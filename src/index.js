/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/5/27
 */

import parser from 'fast-xml-parser';
import { BASE_URL, APP_ID } from './Config';
import Fetch, { Fetch111 } from './Fetch';

import { getUrlDomain, whileDoing } from './Utils';

const qrCode = require('./qrcode-terminal/lib/main');
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";


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

    const buffer = new Buffer(res.body._buffer).toString();
    const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(buffer)) || {}).error || {};
    if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {

        self.loginInfo.skey = self.BaseRequest.skey = skey;
        self.loginInfo.wxsid = self.BaseRequest.wxsid = wxsid;
        self.loginInfo.wxuin = self.BaseRequest.wxuin = wxuin;
        self.loginInfo.pass_ticket = pass_ticket;
        self.BaseRequest.DeviceID = 'e' + ((Math.random() + '').substring(2, 17));
        await webInit();
        await showMobileLogin();
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
            self.intervalId && clearInterval(self.intervalId);
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

    self.loginInfo.SyncKey = res.SyncKey;
    // self.loginInfo.synckey = (res.SyncKey.List || []).map(item => item.key + '_' + item.val).join('|');

    // utils.emoji_formatter(dic['User'], 'NickName')
    self.loginInfo['InviteStartCount'] = res.InviteStartCount;
    // self.loginInfo['User'] = wrap_user_dict(structFriendInfo(res.User))
    self.memberList.push(self.loginInfo['User'])


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

        whileDoing(async () => {
            await getMsg();
        }, 3000)
    })
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
    console.log(returnValue.value())

};

const getMsg = async () => {
    const url = `${self.loginUrl}/webwxsync?sid=${self.loginInfo.wxsid}&skey=${self.loginInfo.skey}&pass_ticket=${self.loginInfo.pass_ticket}`;
    const params = {
        BaseRequest: self.BaseRequest,
        method: 'post',
        SyncKey: self.loginInfo.SyncKey,
        rr: ~Date.now(),
        headers: {
            cookie: self.cookies.getAll(getUrlDomain(url))
        }
    };
    const res = await Fetch(url, params);
    if (res.BaseResponse.Ret !== 0) {
        return;
    }
    self.loginInfo.SyncKey = res.SyncKey;
    // self.loginInfo.synckey = (res.SyncKey.List || []).map(item => item.key + '_' + item.val).join('|');

    console.log(res.AddMsgList, res.ModContactList)
};

const fn = async () => {
    const userId = await getUserId();
    console.log(userId)
    drawQRImage(userId);

    self.intervalId = whileDoing(async () => {
        await checkUserLogin(userId);
    })


};

fn()
