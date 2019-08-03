Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var VERSION = '1.3.10';
var BASE_URL = 'https://login.weixin.qq.com';
var DEFAULT_QR = 'QR.png';
var APP_ID = 'wx782c26e4c19acffb';
var USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';
var BaseRequest = {
  Skey: '',
  Sid: '',
  Uin: '',
  DeviceID: ''
};
var LOGIN_INFO = {
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
  selfUserInfo: {}
};
var EMIT_NAME = {
  FRIEND: 'FRIEND',
  CHAT_ROOM: 'CHAT_ROOM',
  MASSIVE_PLATFORM: 'MASSIVE_PLATFORM'
};
var MESSAGE_TYPE = {
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
  SYSTEM: 'System'
};
var _default = {
  VERSION: VERSION,
  BASE_URL: BASE_URL,
  DEFAULT_QR: DEFAULT_QR,
  APP_ID: APP_ID,
  USER_AGENT: USER_AGENT,
  BaseRequest: BaseRequest,
  LOGIN_INFO: LOGIN_INFO,
  EMIT_NAME: EMIT_NAME,
  MESSAGE_TYPE: MESSAGE_TYPE
};
exports["default"] = _default;