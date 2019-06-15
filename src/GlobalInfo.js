/**
 * @time 2019/6/15
 */
'use strict';
export const VERSION = '1.3.10';
export const BASE_URL = 'https://login.weixin.qq.com';


export const DEFAULT_QR = 'QR.png';

export const APP_ID = 'wx782c26e4c19acffb';


export const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';

export const BaseRequest = {
    Skey: '',
    Sid: '',
    Uin: '',
    DeviceID: ''
};
export const LOGIN_INFO = {
    deviceid: '',
    logintime: '',
    fileUrl: '',
    syncUrl: '',

    skey: '',
    wxsid: '',
    wxuin: '',
    pass_ticket: '',
    syncKey: '',
    syncKeyStr: '',
    selfUserInfo: {},

};

export const EMIT_NAME = {
    FRIEND: 'FRIEND',
    CHAT_ROOM: 'CHAT_ROOM',
    OTHER: 'OTHER'
};

export default {
    VERSION,
    BASE_URL,
    DEFAULT_QR,
    APP_ID,
    USER_AGENT,
    BaseRequest,
    LOGIN_INFO
};
