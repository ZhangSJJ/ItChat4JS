/**
 * @time 2019/6/5
 */
'use strict';

import parser from 'fast-xml-parser';
import { BASE_URL, APP_ID } from './Config';
import Fetch, { toJSON } from './Fetch';

import { getUrlDomain, msgFormatter, WhileDoing } from './Utils';

const qrCode = require('./qrcode-terminal/lib/main');
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";
import Contact from "./Contact";
import { wrapUserDict } from "./Templates";

export default class NodeWeChat {
    constructor(props = {}) {
        const { friendChatInfo, groupChatInfo, mpChatInfo } = props;
        this.fridendChat = {};
        this.groupChat = {};
        this.mpChat = {};
        this.init()
    }

    init() {
        this.store = {
            BaseRequest: {},
            loginInfo: {},
            storageClass: {},
            memberList: [],
        };
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
                this.store.isLogin = true;
                /***清除循环***/
                this.loginWhileDoing.end();
                /***清除循环***/
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
        this.store.redirectUrl = redirectUrl;
        this.store.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
        const res = await Fetch(redirectUrl, { json: false, redirect: 'manual' });
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        this.store.cookies = new Cookies(cookieArr);


        const urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]],
            ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]],
            ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]],
            ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]],
            ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]
        ];

        this.store.loginInfo['deviceid'] = 'e' + ((Math.random() + '').substring(2, 17));
        this.store.loginInfo['logintime'] = Date.now();

        urlInfo.forEach(([indexUrl, [fileUrl, syncUrl]]) => {
            if (this.store.loginUrl.indexOf(indexUrl) !== -1) {
                this.store.loginInfo['fileUrl'] = fileUrl;
                this.store.loginInfo['syncUrl'] = syncUrl;
            } else {
                this.store.loginInfo['fileUrl'] = this.store.loginInfo['syncUrl'] = this.store.loginUrl;
            }
        });

        const buffer = new Buffer(res.body._buffer).toString();
        const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(buffer)) || {}).error || {};
        if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {
            this.store.loginInfo.skey = this.store.BaseRequest.skey = skey;
            this.store.loginInfo.wxsid = this.store.BaseRequest.wxsid = wxsid;
            this.store.loginInfo.wxuin = this.store.BaseRequest.wxuin = wxuin;
            this.store.loginInfo.pass_ticket = pass_ticket;
            this.store.BaseRequest.DeviceID = this.store.loginInfo['deviceid'];

            this.store.contactIns = new Contact(this.store);

            await this.webInit();
            await this.showMobileLogin();

            await this.store.contactIns.getContact(true);
            this.startReceiving();
        } else {
            console.log(`Your wechat account may be LIMITED to log in WEB wechat, error info:${buffer}`)
        }

    };

    startReceiving(exitCallback) {

        const doingFn = async () => {
            const selector = await this.syncCheck();
            console.log('selector: ' + selector)
            if (+selector === 0) {
                return;
            }
            const { msgList, contactList } = await this.getMsg();

            console.log(msgList[0].Content, '\n=====================================')
            msgFormatter(msgList[0], 'Content')
            console.log(msgList[0].Content)

        };

        this.getMsgWhileDoing = new WhileDoing(doingFn, 3000);
        this.getMsgWhileDoing.start();


    };

    async syncCheck() {
        const url = `${this.store.loginInfo['syncUrl'] || this.store.loginUrl}/synccheck`;
        const params = {
            r: Date.now(),
            skey: this.store.loginInfo['skey'],
            sid: this.store.loginInfo['wxsid'],
            uin: this.store.loginInfo['wxuin'],
            deviceid: this.store.loginInfo['deviceid'],
            synckey: this.store.loginInfo.syncKeyStr,
            _: this.store.loginInfo['logintime'],
            json: false,
            headers: {
                cookie: this.store.cookies.getAll(getUrlDomain(url))
            }
        };

        this.store.loginInfo['logintime'] += 1;

        const res = await Fetch(url, params);
        const bufferText = convertRes(res);

        const reg = 'window.synccheck={retcode:"(\\d+)",selector:"(\\d+)"}';
        const match = bufferText.match(reg);
        if (!match || +match[1] !== 0) {
            throw new Error('Unexpected sync check result: ' + bufferText);
        }
        return match[2];
    };

    async getMsg() {
        console.log('getmsg')
        const url = `${this.store.loginUrl}/webwxsync?sid=${this.store.loginInfo.wxsid}&skey=${this.store.loginInfo.skey}&pass_ticket=${this.store.loginInfo.pass_ticket}`;
        const params = {
            BaseRequest: this.store.BaseRequest,
            method: 'post',
            json: false,//为了拿headers更新cookie
            SyncKey: this.store.loginInfo.syncKey,
            rr: ~Date.now(),
            headers: {
                cookie: this.store.cookies.getAll(getUrlDomain(url))
            }
        };

        let res = await Fetch(url, params);
        //更新cookie
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        this.store.cookies.updateCookies(cookieArr);

        res = await toJSON(res);

        if (res.BaseResponse.Ret !== 0) {
            return;
        }
        this.store.loginInfo.syncKey = res.SyncKey;
        this.store.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');

        return {
            msgList: res.AddMsgList,
            contactList: res.ModContactList
        }
    };


    async showMobileLogin() {
        const url = `${this.store.loginUrl}/webwxstatusnotify?lang=zh_CN&pass_ticket=${this.store.loginInfo.pass_ticket}`;
        const params = {
            method: 'post',
            BaseRequest: this.store.BaseRequest,
            Code: 3,
            FromUserName: this.store.storageClass.userName,
            ToUserName: this.store.storageClass.userName,
            ClientMsgId: Date.now(),
            headers: {
                cookie: this.store.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);
        const returnValue = new ReturnValueFormat(res);
        // console.log(returnValue.value())

    };

    async webInit() {
        const now = Date.now();
        let url = `${this.store.loginUrl}/webwxinit?r=${Math.floor(-now / 1579)}&lang=zh_CN&pass_ticket=${this.store.loginInfo.pass_ticket}`;
        const params = {
            BaseRequest: this.store.BaseRequest,
            method: 'post',
            headers: {
                cookie: this.store.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);

        this.store.loginInfo.syncKey = res.SyncKey;
        this.store.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');

        // utils.emoji_formatter(dic['User'], 'NickName')
        this.store.loginInfo['InviteStartCount'] = res.InviteStartCount;
        this.store.loginInfo['User'] = wrapUserDict(structFriendInfo(res.User)).getValue();
        this.store.contactIns.memberList.push(this.store.loginInfo['User']);

        this.store.storageClass.userName = res.User.UserName;
        this.store.storageClass.nickName = res.User.NickName;


        // # deal with contact list returned when init

        const contactList = res.ContactList || [],
            chatroomList = [], otherList = [];

        contactList.forEach(item => {
            if (item.Sex !== 0) {
                otherList.push(item)
            } else if (item.UserName.indexOf('@@') !== -1) {
                item.MemberList = []; // don't let dirty info pollute the list
                chatroomList.push(item)
            } else if (item.UserName.indexOf('@') !== -1) {
                // # mp will be dealt in update_local_friends as well
                otherList.push(item)
            }
        });

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

const convertRes = (res) => {
    if (res && res.body && res.body._readableState && res.body._readableState.buffer &&
        res.body._readableState.buffer.head && res.body._readableState.buffer.head.data) {
        const buffer = new Buffer(res.body._readableState.buffer.head.data);
        return buffer.toString();
    } else {
        return null;
    }
};