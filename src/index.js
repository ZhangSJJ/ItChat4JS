/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/5/27
 */

import parser from 'fast-xml-parser';
import { BASE_URL, APP_ID } from './Config';
import Fetch, { Fetch111 } from './Fetch';

import { whileDoing } from './Utils';

const qrCode = require('./qrcode-terminal/lib/main');

const self = {};

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
    console.log(bufferText)
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
    const buffer = new Buffer(res.body._buffer).toString();
    const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(buffer)) || {}).error || {};
    if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {
        self.BaseRequest = {};
        self.skey = self.BaseRequest.skey = skey;
        self.wxsid = self.BaseRequest.wxsid = wxsid;
        self.wxuin = self.BaseRequest.wxuin = wxuin;
        self.pass_ticket = pass_ticket;
        self.BaseRequest.DeviceID = 'e' + ((Math.random() + '').substring(2, 17));
        await webInit();
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
    const url = `${self.loginUrl}?r=${Math.floor(-now / 1579)}&lang=zh_CN&pass_ticket=${self.pass_ticket}`;
    console.log(url)
    const params = {
        BaseRequest: self.BaseRequest,
        method: 'post',
        json: false
    };
    const res = await Fetch(url, params);
    console.log(res)

};

const fn = async () => {
    const userId = await getUserId();
    console.log(userId)
    drawQRImage(userId);

    self.intervalId = whileDoing(async () => {
        await checkUserLogin(userId);
    })


};

// fn()

// var data = '<error><ret>0</ret><message></message><skey>@crypt_2cea0d31_3477374853f8e7005293353ccdb1006e</skey><wxsid>py6LmvsRhrrFzLeu</wxsid><wxuin>452613396</wxuin><pass_ticket>9+6tj4AepAbuT+h34vUlmIlzT+lF1dyaulpsZi721HLlK+MUhj+n4ExmLQV3bW9Q</pass_ticket><isgrayscale>1</isgrayscale></error>';
//
// console.log(parser.parse(data))

Fetch111('https://gateway.m.uat.qa.nt.ctripcorp.com/restapi/soa2/16357/json/voiceDetail', {
    "ver": "8.3.2.1",
    "pageid": 10650015942,
    "resourceid": 1000624081,
    "head": {
        "cid": "09031149111446967275",
        "ctok": "",
        "cver": "1.0",
        "lang": "01",
        "sid": "8888",
        "syscode": "09",
        "auth": null,
        "extension": [{ "name": "networkstatus", "value": "None" }, { "name": "protocal", "value": "http" }]
    },
    "contentType": "json",
    method:'post'
}).then(res=>{
    console.log(res)
})







