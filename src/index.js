/**
 * @time 2019/6/5
 */

import EventEmitter from 'events';
import parser from 'fast-xml-parser';

import Fetch, { toJSON } from './Fetch';

import { convertRes, getUrlDomain, WhileDoing } from './Utils';

import qrCode from './qrcode-terminal';
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";
import Contact from "./Contact";

import Message from './Message';
import GlobalInfo from './GlobalInfo';
import { readAndMergeGlobalInfo, saveGlobalInfo } from "./StoreGlobalInfo";
import { LogDebug } from "./Log";

export default class NodeWeChat extends EventEmitter {
    constructor() {
        super();
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.init();
    }

    init() {
        this.contactIns = new Contact();
        this.getChatRoomInfo = this.contactIns.getChatRoomInfo.bind(this.contactIns);
        this.updateChatRoomInfo = this.contactIns.updateChatRoomInfo.bind(this.contactIns);
        this.getFriendInfo = this.contactIns.getFriendInfo.bind(this.contactIns);
        this.getMpInfo = this.contactIns.getMpInfo.bind(this.contactIns);


        this.messageIns = new Message({
            on: this.on,
            emit: this.emit,
            getChatRoomInfo: this.getChatRoomInfo,
            updateChatRoomInfo: this.updateChatRoomInfo,
            getFriendInfo: this.getFriendInfo,
            getMpInfo: this.getMpInfo,
        });

    }

    async getUserId() {
        const url = GlobalInfo.BASE_URL + `/jslogin`;
        const res = await Fetch(url, { appid: GlobalInfo.APP_ID, json: false });
        const bufferText = convertRes(res);
        if (bufferText) {
            const reg = /window.QRLogin.code = (\d+); window.QRLogin.uuid = "(\S+?)";/;
            const match = bufferText.match(reg);
            if (match && +match[1] === 200) {
                return match[2];
            } else {
                throw new Error('获取userId失败！')
            }
        } else {
            throw new Error('获取userId失败！')
        }
    };

    drawQRImage(uuid) {
        const url = 'https://login.weixin.qq.com/l/' + uuid;
        qrCode.generate(url);
        console.log('Please scan the QR code to log in.')
    };

    async checkUserLogin(userId) {
        const now = Date.now();
        const url = `${GlobalInfo.BASE_URL}/cgi-bin/mmwebwx-bin/login`;
        const params = {
            loginicon: true,
            uuid: userId,
            tip: 0,
            r: Math.floor(-now / 1579),
            _: now,
            json: false
        };
        const res = await Fetch(url, params);
        const bufferText = convertRes(res);

        const reg = /window.code=(\d+);/;
        const match = bufferText.match(reg);

        if (match) {
            const status = +match[1];
            if (status === 200) {
                GlobalInfo.LOGIN_INFO.isLogin = true;
                /***清除循环***/
                this.loginWhileDoing.end();
                /***清除循环***/
                console.log('You are login!');
                await this.processLoginInfo(bufferText)
            } else if (status === 201) {
                console.log('Please press confirm on your phone.')
            } else {
                console.log('Please wait for a moment...')
            }
        } else {
            throw new Error('获取登录信息失败！')
        }

        return res;
    };

    async processLoginInfo(resText) {
        const reg = /window.redirect_uri="(\S+)";/;
        const match = resText.match(reg);
        const redirectUrl = match[1];
        GlobalInfo.LOGIN_INFO.redirectUrl = redirectUrl;
        GlobalInfo.LOGIN_INFO.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
        const res = await Fetch(redirectUrl, { json: false, redirect: 'manual' });
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        GlobalInfo.LOGIN_INFO.cookies = new Cookies(cookieArr);


        const urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]],
            ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]],
            ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]],
            ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]],
            ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]
        ];

        GlobalInfo.LOGIN_INFO['deviceid'] = 'e' + ((Math.random() + '').substring(2, 17));
        GlobalInfo.LOGIN_INFO['logintime'] = Date.now();

        urlInfo.forEach(([indexUrl, [fileUrl, syncUrl]]) => {
            if (GlobalInfo.LOGIN_INFO.loginUrl.indexOf(indexUrl) !== -1) {
                GlobalInfo.LOGIN_INFO['fileUrl'] = fileUrl;
                GlobalInfo.LOGIN_INFO['syncUrl'] = syncUrl;
            } else {
                GlobalInfo.LOGIN_INFO['fileUrl'] = GlobalInfo.LOGIN_INFO['syncUrl'] = GlobalInfo.LOGIN_INFO.loginUrl;
            }
        });

        const buffer = new Buffer(res.body._buffer).toString();
        const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(buffer)) || {}).error || {};
        if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {
            GlobalInfo.LOGIN_INFO.skey = GlobalInfo.BaseRequest.Skey = skey;
            GlobalInfo.LOGIN_INFO.wxsid = GlobalInfo.BaseRequest.Sid = wxsid;
            GlobalInfo.LOGIN_INFO.wxuin = GlobalInfo.BaseRequest.Uin = wxuin;
            GlobalInfo.LOGIN_INFO.pass_ticket = pass_ticket;
            GlobalInfo.BaseRequest.DeviceID = GlobalInfo.LOGIN_INFO['deviceid'];

            await this.webInit();
            await this.contactIns.getContact(true);

            //登录态存储
            saveGlobalInfo();

            this.startReceiving();
        } else {
            console.log(`Your wechat account may be LIMITED to log in WEB wechat, error info:${buffer}`)
        }

    };

    startReceiving(exitCallback) {

        const doingFn = async () => {
            const selector = await this.syncCheck();
            LogDebug('selector: ' + selector);
            if (selector === '0') {
                return;
            }
            const { msgList, contactList } = await this.getMsg();
            this.messageIns.produceMsg(msgList)
        };

        this.getMsgWhileDoing = new WhileDoing(doingFn, 3000);
        this.getMsgWhileDoing.start();


    };

    async syncCheck() {
        const url = `${GlobalInfo.LOGIN_INFO['syncUrl'] || GlobalInfo.LOGIN_INFO.loginUrl}/synccheck`;
        const params = {
            r: Date.now(),
            skey: GlobalInfo.LOGIN_INFO['skey'],
            sid: GlobalInfo.LOGIN_INFO['wxsid'],
            uin: GlobalInfo.LOGIN_INFO['wxuin'],
            deviceid: GlobalInfo.LOGIN_INFO['deviceid'],
            synckey: GlobalInfo.LOGIN_INFO.syncKeyStr,
            _: GlobalInfo.LOGIN_INFO['logintime'],
            json: false,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        GlobalInfo.LOGIN_INFO['logintime'] += 1;

        const res = await Fetch(url, params);
        const bufferText = convertRes(res);

        const reg = /window.synccheck={retcode:"(\d+)",selector:"(\d+)"}/;
        const match = bufferText.match(reg);
        if (!match || match[1] !== '0') {
            process.exit(0);
        }
        return match[2];
    };

    async getMsg() {
        LogDebug('Getting Message...');
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsync?sid=${GlobalInfo.LOGIN_INFO.wxsid}&skey=${GlobalInfo.LOGIN_INFO.skey}&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            BaseRequest: GlobalInfo.BaseRequest,
            method: 'post',
            json: false,//为了拿headers更新cookie
            SyncKey: GlobalInfo.LOGIN_INFO.syncKey,
            rr: ~Date.now(),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        let res = await Fetch(url, params);
        //更新cookie
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        GlobalInfo.LOGIN_INFO.cookies.updateCookies(cookieArr);

        res = await toJSON(res);

        if (res.BaseResponse.Ret !== 0) {
            return;
        }
        GlobalInfo.LOGIN_INFO.syncKey = res.SyncKey;
        GlobalInfo.LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');

        return {
            msgList: res.AddMsgList,
            contactList: res.ModContactList
        }
    };

    async sendMsg(msgType, content, toUserName) {
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendmsg`;
        const params = {
            method: 'post',
            BaseRequest: {
                ...GlobalInfo.BaseRequest,
                DeviceID: 'e' + ((Math.random() + '').substring(2, 17))
            },
            Msg: {
                Type: msgType,
                Content: content,
                FromUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
                ToUserName: toUserName || GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
                LocalID: Date.now() * 1e4 + '',
                ClientMsgId: Date.now() * 1e4 + '',
            },
            Scene: 0,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        const res = await Fetch(url, params);
        // const returnValue = new ReturnValueFormat(res);

        console.log(res)
    }

    async showMobileLogin() {
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxstatusnotify?lang=zh_CN&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;

        if (!GlobalInfo.LOGIN_INFO.cookies || !GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))) {
            return false;
        }

        const params = {
            method: 'post',
            BaseRequest: GlobalInfo.BaseRequest,
            Code: 3,
            FromUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            ToUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            ClientMsgId: Date.now(),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);
        const formatRes = new ReturnValueFormat(res);
        return formatRes.value().BaseResponse && formatRes.value().BaseResponse.Ret === 0;
    };

    async webInit() {
        const now = Date.now();
        let url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxinit?r=${Math.floor(-now / 1579)}&lang=zh_CN&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            BaseRequest: GlobalInfo.BaseRequest,
            method: 'post',
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);

        GlobalInfo.LOGIN_INFO.syncKey = res.SyncKey;
        GlobalInfo.LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');


        GlobalInfo.LOGIN_INFO['InviteStartCount'] = res.InviteStartCount;
        GlobalInfo.LOGIN_INFO.selfUserInfo = structFriendInfo(res.User);
        // this.contactIns.memberList.push(GlobalInfo.LOGIN_INFO.selfUserInfo);

        // # deal with contact list returned when init

        const contactList = res.ContactList || [],
            chatRoomList = [], otherList = [];

        contactList.forEach(item => {
            if (item.Sex !== 0) {
                otherList.push(item)
            } else if (item.UserName.indexOf('@@') !== -1) {
                item.MemberList = [];
                chatRoomList.push(item)
            } else if (item.UserName.indexOf('@') !== -1) {
                otherList.push(item)
            }
        });
        this.contactIns.updateLocalChatRoom(chatRoomList);
        this.contactIns.updateLocalFriends(otherList);

    };

    async run() {
        await readAndMergeGlobalInfo();
        const isLogin = await this.showMobileLogin();
        if (isLogin) {
            this.startReceiving();
        } else {
            const userId = await this.getUserId();
            this.drawQRImage(userId);

            this.loginWhileDoing = new WhileDoing(async () => {
                await this.checkUserLogin(userId);
            });
            this.loginWhileDoing.start();
        }
    }
}

NodeWeChat.MESSAGE_TYPE = GlobalInfo.EMIT_NAME;

