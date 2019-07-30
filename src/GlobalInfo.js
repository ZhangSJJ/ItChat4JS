/**
 * @time 2019/6/15
 */
'use strict';
const VERSION = '1.3.10';
const BASE_URL = 'https://login.weixin.qq.com';


const DEFAULT_QR = 'QR.png';

const APP_ID = 'wx782c26e4c19acffb';


const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';

const BaseRequest = {
    Skey: '',
    Sid: '',
    Uin: '',
    DeviceID: ''
};
const LOGIN_INFO = {
    deviceid: '',
    logintime: '',
    fileUrl: '',
    syncUrl: '',
    userId: '',

    skey: '',
    wxsid: '',
    wxuin: '',
    pass_ticket: '',
    syncKey: '',
    syncKeyStr: '',
    selfUserInfo: {},

};

const EMIT_NAME = {
    FRIEND: 'FRIEND',
    CHAT_ROOM: 'CHAT_ROOM',
    MASSIVE_PLATFORM: 'MASSIVE_PLATFORM'
};
const MESSAGE_TYPE = {
    TEXT: 'Text',
    MAP: 'Map',
    CARD: 'Card',
    NOTE: 'Note',
    SHARING: 'Sharing',
    PICTURE: 'Picture',
    RECORDING: 'Recording',
    VOICE: 'Recording',
    ATTACHMENT: 'Attachment',
    VIDEO: 'Video',
    FRIENDS: 'Friends',
    SYSTEM: 'System',
};

export default {
    VERSION,
    BASE_URL,
    DEFAULT_QR,
    APP_ID,
    USER_AGENT,
    BaseRequest,
    LOGIN_INFO,
    EMIT_NAME,
    MESSAGE_TYPE
};
