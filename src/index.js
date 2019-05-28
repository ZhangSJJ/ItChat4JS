/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/5/27
 */

import { BASE_URL, APP_ID } from './Config';
import  Fetch  from './Fetch';

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
    const res = await Fetch(redirectUrl, { json: false });

    const bufferText = convertRes(res);
    const buffer = new Buffer(res.body._buffer);

    console.log(buffer.toString())
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

const webInit = () => {

};

const fn = async () => {
    const userId = await getUserId();
    console.log(userId)
    drawQRImage(userId);

    self.intervalId = whileDoing(async () => {
        await checkUserLogin(userId);
        webInit();
    })


};

fn()












