/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/5/27
 */

import parser from 'fast-xml-parser';
import { BASE_URL, APP_ID } from './Config';
import Fetch, { Fetch111, toJSON } from './Fetch';

import { getUrlDomain, WhileDoing } from './Utils';

const qrCode = require('./qrcode-terminal/lib/main');
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";
import Contact from "./Contact";
import { wrapUserDict } from "./Templates";


const self = {
    BaseRequest: {},
    loginInfo: {},
    storageClass: {},
    memberList: [],
};

const convertRes = (res) => {
    if (res && res.body && res.body._readableState && res.body._readableState.buffer &&
        res.body._readableState.buffer.head && res.body._readableState.buffer.head.data) {
        const buffer = new Buffer(res.body._readableState.buffer.head.data);
        return buffer.toString();
    } else {
        return null;
    }
};

const getUserId = async () => {
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

const drawQRImage = (uuid) => {
    const url = 'https://login.weixin.qq.com/l/' + uuid;
    qrCode.generate(url);
    console.log('Please scan the QR code to log in.')
};

const processLoginInfo = async (resText) => {
    const reg = 'window.redirect_uri="(\\S+)";';
    const match = resText.match(reg);
    const redirectUrl = match[1];
    self.redirectUrl = redirectUrl;
    self.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
    const res = await Fetch(redirectUrl, { json: false, redirect: 'manual' });
    const cookieArr = (res.headers.raw() || {})['set-cookie'];
    self.cookies = new Cookies(cookieArr);


    const urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]],
        ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]],
        ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]],
        ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]],
        ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]
    ];

    self.loginInfo['deviceid'] = 'e' + ((Math.random() + '').substring(2, 17));
    self.loginInfo['logintime'] = Date.now();

    urlInfo.forEach(([indexUrl, [fileUrl, syncUrl]]) => {
        if (self.loginUrl.indexOf(indexUrl) !== -1) {
            self.loginInfo['fileUrl'] = fileUrl;
            self.loginInfo['syncUrl'] = syncUrl;
        } else {
            self.loginInfo['fileUrl'] = self.loginInfo['syncUrl'] = self.loginUrl;
        }
    });

    const buffer = new Buffer(res.body._buffer).toString();
    const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(buffer)) || {}).error || {};
    if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {
        self.loginInfo.skey = self.BaseRequest.skey = skey;
        self.loginInfo.wxsid = self.BaseRequest.wxsid = wxsid;
        self.loginInfo.wxuin = self.BaseRequest.wxuin = wxuin;
        self.loginInfo.pass_ticket = pass_ticket;
        self.BaseRequest.DeviceID = self.loginInfo['deviceid'];

        self.contactIns = new Contact(self);

        await webInit();
        await showMobileLogin();

        await self.contactIns.getContact(true);
        startReceiving();
    } else {
        console.log(`Your wechat account may be LIMITED to log in WEB wechat, error info:${buffer}`)
    }

};

const checkUserLogin = async (userId) => {
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
            self.isLogin = true;
            /***清除循环***/
            self.loginWhileDoing.end();
            /***清除循环***/
            await processLoginInfo(bufferText)
        } else if (status === 201) {
            console.log('Please press confirm on your phone.')
        }
    } else {
        throw new Error('获取登录信息失败！')
    }

    return res;
};

const webInit = async () => {
    const now = Date.now();
    let url = `${self.loginUrl}/webwxinit?r=${Math.floor(-now / 1579)}&lang=zh_CN&pass_ticket=${self.loginInfo.pass_ticket}`;
    const params = {
        BaseRequest: self.BaseRequest,
        method: 'post',
        headers: {
            cookie: self.cookies.getAll(getUrlDomain(url))
        }
    };
    const res = await Fetch(url, params);

    self.loginInfo.syncKey = res.SyncKey;
    self.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');

    // utils.emoji_formatter(dic['User'], 'NickName')
    self.loginInfo['InviteStartCount'] = res.InviteStartCount;
    self.loginInfo['User'] = wrapUserDict(structFriendInfo(res.User)).getValue();
    self.contactIns.memberList.push(self.loginInfo['User']);

    self.storageClass.userName = res.User.UserName;
    self.storageClass.nickName = res.User.NickName;


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

const showMobileLogin = async () => {
    const url = `${self.loginUrl}/webwxstatusnotify?lang=zh_CN&pass_ticket=${self.loginInfo.pass_ticket}`;
    const params = {
        method: 'post',
        BaseRequest: self.BaseRequest,
        Code: 3,
        FromUserName: self.storageClass.userName,
        ToUserName: self.storageClass.userName,
        ClientMsgId: Date.now(),
        headers: {
            cookie: self.cookies.getAll(getUrlDomain(url))
        }
    };
    const res = await Fetch(url, params);
    const returnValue = new ReturnValueFormat(res);
    // console.log(returnValue.value())

};


const startReceiving = (exitCallback) => {

    const doingFn = async () => {
        const selector = await syncCheck();
        console.log('selector: ' + selector)
        if (+selector === 0) {
            return;
        }
        const { msgList, contactList } = await getMsg();
        console.log(msgList, '\n=====================================')

    };

    self.getMsgWhileDoing = new WhileDoing(doingFn, 3000);
    self.getMsgWhileDoing.start();


};

const syncCheck = async () => {
    const url = `${self.loginInfo['syncUrl'] || self.loginUrl}/synccheck`;
    const params = {
        r: Date.now(),
        skey: self.loginInfo['skey'],
        sid: self.loginInfo['wxsid'],
        uin: self.loginInfo['wxuin'],
        deviceid: self.loginInfo['deviceid'],
        synckey: self.loginInfo.syncKeyStr,
        _: self.loginInfo['logintime'],
        json: false,
        headers: {
            cookie: self.cookies.getAll(getUrlDomain(url))
        }
    };

    self.loginInfo['logintime'] += 1;

    const res = await Fetch(url, params);
    const bufferText = convertRes(res);

    const reg = 'window.synccheck={retcode:"(\\d+)",selector:"(\\d+)"}';
    const match = bufferText.match(reg);
    if (!match || +match[1] !== 0) {
        throw new Error('Unexpected sync check result: ' + bufferText);
    }
    return match[2];
};

const getMsg = async () => {
    console.log('getmsg')
    const url = `${self.loginUrl}/webwxsync?sid=${self.loginInfo.wxsid}&skey=${self.loginInfo.skey}&pass_ticket=${self.loginInfo.pass_ticket}`;
    const params = {
        BaseRequest: self.BaseRequest,
        method: 'post',
        json: false,//为了拿headers更新cookie
        SyncKey: self.loginInfo.syncKey,
        rr: ~Date.now(),
        headers: {
            cookie: self.cookies.getAll(getUrlDomain(url))
        }
    };

    let res = await Fetch(url, params);
    //更新cookie
    const cookieArr = (res.headers.raw() || {})['set-cookie'];
    self.cookies.updateCookies(cookieArr);

    res = await toJSON(res);

    if (res.BaseResponse.Ret !== 0) {
        return;
    }
    self.loginInfo.syncKey = res.SyncKey;
    self.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');

    return {
        msgList: res.AddMsgList,
        contactList: res.ModContactList
    }
};

const fn = async () => {
    const userId = await getUserId();
    console.log(userId)
    drawQRImage(userId);

    self.loginWhileDoing = new WhileDoing(async () => {
        await checkUserLogin(userId);
    });
    self.loginWhileDoing.start();

};

fn()
