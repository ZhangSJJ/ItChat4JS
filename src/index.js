/**
 * @time 2019/6/5
 */

import EventEmitter from 'events';
import parser from 'fast-xml-parser';
import Fetch, { FetchWithExcept, toBuffer, toJSON } from './Fetch';
import { getUrlDomain, isArray, WhileDoing } from './Utils';
import qrCode from './qrcode-terminal';
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";
import Contact from "./Contact";
import Message, { sendFile, sendImage, sendVideo, sendTextMsg, revokeMsg, transmitMsg } from './Message';
import GlobalInfo from './GlobalInfo';
import { readAndMergeGlobalInfo, saveGlobalInfo } from "./StoreGlobalInfo";
import { LogDebug, LogInfo } from "./Log";

class NodeWeChat extends EventEmitter {
    constructor() {
        super();
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.init();
    }

    init() {
        this.contactIns = new Contact();
        const getChatRoomInfo = this.contactIns.getChatRoomInfo.bind(this.contactIns);
        const updateChatRoomInfo = this.contactIns.updateChatRoomInfo.bind(this.contactIns);
        const getFriendInfo = this.contactIns.getFriendInfo.bind(this.contactIns);
        const getMpInfo = this.contactIns.getMpInfo.bind(this.contactIns);
        const updateLocalUin = this.contactIns.updateLocalUin.bind(this.contactIns);


        this.messageIns = new Message({
            on: this.on,
            emit: this.emit,
            getChatRoomInfo,
            updateChatRoomInfo,
            getFriendInfo,
            getMpInfo,
            updateLocalUin,
        });

        this.verifyFriend = this.contactIns.verifyFriend.bind(this.contactIns);
        this.getContactInfoByName = this.contactIns.getContactInfoByName.bind(this.contactIns);
        this.setAlias = this.contactIns.setAlias.bind(this.contactIns);
        this.setPinned = this.contactIns.setPinned.bind(this.contactIns);
        this.createChatRoom = this.contactIns.createChatRoom.bind(this.contactIns);
        this.setChatRoomName = this.contactIns.setChatRoomName.bind(this.contactIns);
        this.deleteMemberFromChatRoom = this.contactIns.deleteMemberFromChatRoom.bind(this.contactIns);
        this.addMemberIntoChatRoom = this.contactIns.addMemberIntoChatRoom.bind(this.contactIns);


    }

    async getUserId() {
        const url = GlobalInfo.BASE_URL + `/jslogin`;
        const res = await Fetch(url, { appid: GlobalInfo.APP_ID, json: false, buffer: true });
        const bufferText = res.toString();
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

    async webWxPushLogin() {
        if (!GlobalInfo.LOGIN_INFO.loginUrl || !GlobalInfo.LOGIN_INFO.wxuin) {
            return false;
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxpushloginurl?uin=${GlobalInfo.LOGIN_INFO.wxuin}`;
        const pushLoginRes = await Fetch(url, {
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(GlobalInfo.LOGIN_INFO.loginUrl))
            }
        });
        LogDebug('WeChat Push Login Request Result:' + pushLoginRes.msg);

        if (pushLoginRes.ret === '0') {
            GlobalInfo.LOGIN_INFO.userId = pushLoginRes.uuid;
        }

        return pushLoginRes.ret === '0';
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
            json: false,
            buffer: true
        };
        const res = await Fetch(url, params);
        const bufferText = res.toString();

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
        let res = await Fetch(redirectUrl, { json: false, redirect: 'manual' });
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
        res = await toBuffer(res);
        const bufferText = res.toString();
        const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(bufferText)) || {}).error || {};
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
            console.log(`Your wechat account may be LIMITED to log in WEB wechat, error info:${bufferText}`)
        }

    };

    startReceiving() {
        if (!this.autoReceiving) {
            return;
        }
        const doingFn = async () => {
            const selector = await this.syncCheck();
            LogDebug('selector: ' + selector);
            if (selector === '0') {
                return;
            }
            const msgInfo = await this.getMsg();
            if (!msgInfo) {
                return;
            }
            const { msgList, contactList } = msgInfo;
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
            buffer: true,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        GlobalInfo.LOGIN_INFO['logintime'] += 1;

        const res = await FetchWithExcept(url, params, 'window.synccheck={retcode:"0",selector:"0"}');
        const bufferText = res.toString();

        const reg = /window.synccheck={retcode:"(\d+)",selector:"(\d+)"}/;
        const match = bufferText.match(reg);
        if (match && match[1] === '1101') {
            LogInfo('User Log Out...');
            return process.exit(0);
        }
        if (!match || match[1] !== '0') {
            return '0';
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
        await this.login(true);
    }

    async login(receiving = false) {
        this.autoReceiving = receiving;
        await readAndMergeGlobalInfo();


        const isLogin = await this.showMobileLogin();
        if (isLogin) {
            await this.contactIns.getContact(true);
            this.startReceiving();
        } else {
            //首先唤起手机微信网页登陆
            if (!await this.webWxPushLogin()) {
                GlobalInfo.LOGIN_INFO.userId = await this.getUserId();
                this.drawQRImage(GlobalInfo.LOGIN_INFO.userId);
            }
            this.loginWhileDoing = new WhileDoing(async () => {
                await this.checkUserLogin(GlobalInfo.LOGIN_INFO.userId);
            });
            await this.loginWhileDoing.start();
        }
    }

    listen(emitName, msgType, callback) {
        if (!msgType) {
            msgType = [];
        }
        if (!isArray(msgType)) {
            msgType = [msgType];
        }
        this.on(emitName, (msgInfo, messageFrom) => {
            if (!msgType.length || msgType.indexOf(msgInfo.type) !== -1) {
                callback && callback(msgInfo, messageFrom);
            }
        })
    }
}

const EMIT_NAME = GlobalInfo.EMIT_NAME;
const MESSAGE_TYPE = GlobalInfo.MESSAGE_TYPE;


export {
    sendFile,
    sendImage,
    sendVideo,
    sendTextMsg,
    revokeMsg,
    transmitMsg,
    EMIT_NAME,
    MESSAGE_TYPE
}

export default NodeWeChat;