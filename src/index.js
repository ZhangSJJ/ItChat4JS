/**
 * @time 2019/6/5
 */

import EventEmitter from 'events';
import parser from 'fast-xml-parser';

import Fetch, { toJSON } from './Fetch';

import { convertRes, getUrlDomain, msgFormatter, WhileDoing } from './Utils';

import qrCode from './qrcode-terminal';
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";
import Contact from "./Contact";

import Message from './Message';
import GlobalInfo, { BaseRequest, LOGIN_INFO, APP_ID, BASE_URL, EMIT_NAME } from './GlobalInfo';

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



        this.messageIns = new Message({
            on: this.on,
            emit: this.emit,
            getChatRoomInfo: this.getChatRoomInfo,
            updateChatRoomInfo: this.updateChatRoomInfo,

        });

    }

    async getUserId() {
        const url = BASE_URL + `/jslogin`;
        const res = await Fetch(url, { appid: APP_ID, json: false });
        const bufferText = convertRes(res);
        if (bufferText) {
            const reg = 'window.QRLogin.code = (\\d+); window.QRLogin.uuid = "(\\S+?)";';
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
        const url = `${BASE_URL}/cgi-bin/mmwebwx-bin/login`;
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

        const reg = 'window.code=(\\d+);';
        const match = bufferText.match(reg);

        if (match) {
            const status = +match[1];
            if (status === 200) {
                LOGIN_INFO.isLogin = true;
                /***清除循环***/
                this.loginWhileDoing.end();
                /***清除循环***/
                console.log('You are login!');
                await this.processLoginInfo(bufferText)
            } else if (status === 201) {
                console.log('Please press confirm on your phone.')
            }
        } else {
            throw new Error('获取登录信息失败！')
        }

        return res;
    };

    async processLoginInfo(resText) {
        const reg = 'window.redirect_uri="(\\S+)";';
        const match = resText.match(reg);
        const redirectUrl = match[1];
        LOGIN_INFO.redirectUrl = redirectUrl;
        LOGIN_INFO.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
        const res = await Fetch(redirectUrl, { json: false, redirect: 'manual' });
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        LOGIN_INFO.cookies = new Cookies(cookieArr);


        const urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]],
            ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]],
            ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]],
            ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]],
            ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]
        ];

        LOGIN_INFO['deviceid'] = 'e' + ((Math.random() + '').substring(2, 17));
        LOGIN_INFO['logintime'] = Date.now();

        urlInfo.forEach(([indexUrl, [fileUrl, syncUrl]]) => {
            if (LOGIN_INFO.loginUrl.indexOf(indexUrl) !== -1) {
                LOGIN_INFO['fileUrl'] = fileUrl;
                LOGIN_INFO['syncUrl'] = syncUrl;
            } else {
                LOGIN_INFO['fileUrl'] = LOGIN_INFO['syncUrl'] = LOGIN_INFO.loginUrl;
            }
        });

        const buffer = new Buffer(res.body._buffer).toString();
        const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(buffer)) || {}).error || {};
        if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {
            LOGIN_INFO.skey = BaseRequest.Skey = skey;
            LOGIN_INFO.wxsid = BaseRequest.Sid = wxsid;
            LOGIN_INFO.wxuin = BaseRequest.Uin = wxuin;
            LOGIN_INFO.pass_ticket = pass_ticket;
            BaseRequest.DeviceID = LOGIN_INFO['deviceid'];

            await this.webInit();
            await this.showMobileLogin();

            await this.contactIns.getContact(true);
            this.startReceiving();
        } else {
            console.log(`Your wechat account may be LIMITED to log in WEB wechat, error info:${buffer}`)
        }

    };

    startReceiving(exitCallback) {

        const doingFn = async () => {
            const selector = await this.syncCheck();
            console.log('selector: ' + selector)
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
        const url = `${LOGIN_INFO['syncUrl'] || LOGIN_INFO.loginUrl}/synccheck`;
        const params = {
            r: Date.now(),
            skey: LOGIN_INFO['skey'],
            sid: LOGIN_INFO['wxsid'],
            uin: LOGIN_INFO['wxuin'],
            deviceid: LOGIN_INFO['deviceid'],
            synckey: LOGIN_INFO.syncKeyStr,
            _: LOGIN_INFO['logintime'],
            json: false,
            headers: {
                cookie: LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        LOGIN_INFO['logintime'] += 1;

        const res = await Fetch(url, params);
        const bufferText = convertRes(res);

        const reg = 'window.synccheck={retcode:"(\\d+)",selector:"(\\d+)"}';
        const match = bufferText.match(reg);
        if (!match || match[1] !== '0') {
            process.exit(0);
        }
        return match[2];
    };

    async getMsg() {
        console.log('getmsg')
        const url = `${LOGIN_INFO.loginUrl}/webwxsync?sid=${LOGIN_INFO.wxsid}&skey=${LOGIN_INFO.skey}&pass_ticket=${LOGIN_INFO.pass_ticket}`;
        const params = {
            BaseRequest,
            method: 'post',
            json: false,//为了拿headers更新cookie
            SyncKey: LOGIN_INFO.syncKey,
            rr: ~Date.now(),
            headers: {
                cookie: LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        let res = await Fetch(url, params);
        //更新cookie
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        LOGIN_INFO.cookies.updateCookies(cookieArr);

        res = await toJSON(res);

        if (res.BaseResponse.Ret !== 0) {
            return;
        }
        LOGIN_INFO.syncKey = res.SyncKey;
        LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');

        return {
            msgList: res.AddMsgList,
            contactList: res.ModContactList
        }
    };

    async sendMsg(msgType, content, toUserName) {
        const url = `${LOGIN_INFO.loginUrl}/webwxsendmsg`;
        const params = {
            method: 'post',
            BaseRequest: {
                ...BaseRequest,
                DeviceID: 'e' + ((Math.random() + '').substring(2, 17))
            },
            Msg: {
                Type: msgType,
                Content: content,
                FromUserName: LOGIN_INFO.selfUserInfo.UserName,
                ToUserName: toUserName || LOGIN_INFO.selfUserInfo.UserName,
                LocalID: Date.now() * 1e4 + '',
                ClientMsgId: Date.now() * 1e4 + '',
            },
            Scene: 0,
            headers: {
                cookie: LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        const res = await Fetch(url, params);
        // const returnValue = new ReturnValueFormat(res);

        console.log(res)
    }

    async showMobileLogin() {
        const url = `${LOGIN_INFO.loginUrl}/webwxstatusnotify?lang=zh_CN&pass_ticket=${LOGIN_INFO.pass_ticket}`;
        const params = {
            method: 'post',
            BaseRequest,
            Code: 3,
            FromUserName: LOGIN_INFO.selfUserInfo.UserName,
            ToUserName: LOGIN_INFO.selfUserInfo.UserName,
            ClientMsgId: Date.now(),
            headers: {
                cookie: LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);
        const returnValue = new ReturnValueFormat(res);
        // console.log(returnValue.value())

    };

    async webInit() {
        const now = Date.now();
        let url = `${LOGIN_INFO.loginUrl}/webwxinit?r=${Math.floor(-now / 1579)}&lang=zh_CN&pass_ticket=${LOGIN_INFO.pass_ticket}`;
        const params = {
            BaseRequest,
            method: 'post',
            headers: {
                cookie: LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);

        LOGIN_INFO.syncKey = res.SyncKey;
        LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');


        LOGIN_INFO['InviteStartCount'] = res.InviteStartCount;
        LOGIN_INFO.selfUserInfo = structFriendInfo(res.User);
        // this.contactIns.memberList.push(LOGIN_INFO.selfUserInfo);

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
        const userId = await this.getUserId();
        this.drawQRImage(userId);

        this.loginWhileDoing = new WhileDoing(async () => {
            await this.checkUserLogin(userId);
        });
        this.loginWhileDoing.start();
    }
}

NodeWeChat.MESSAGE_TYPE = EMIT_NAME;

const NodeWeChatIns = new NodeWeChat();
NodeWeChatIns.run();
NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.FRIEND, (replayInfo, toUserName) => {
    console.log('friend', '====================')
    console.log(replayInfo, toUserName)
    const { text } = replayInfo
    if (text === 'zsj') {
        NodeWeChatIns.sendMsg(1, 'zsssssssj', toUserName)
    }

});

NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.CHAT_ROOM, (replayInfo, toUserName) => {
    console.log('charroom', '====================')
    console.log(replayInfo, toUserName)

    const { text } = replayInfo
    if (text === 'zsj') {
        NodeWeChatIns.sendMsg(1, 'zsssssssj', toUserName)
    }

});

