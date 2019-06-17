Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.EMIT_NAME = exports.LOGIN_INFO = exports.BaseRequest = exports.USER_AGENT = exports.APP_ID = exports.DEFAULT_QR = exports.BASE_URL = exports.VERSION = void 0;
var VERSION = '1.3.10';
exports.VERSION = VERSION;
var BASE_URL = 'https://login.weixin.qq.com';
exports.BASE_URL = BASE_URL;
var DEFAULT_QR = 'QR.png';
exports.DEFAULT_QR = DEFAULT_QR;
var APP_ID = 'wx782c26e4c19acffb';
exports.APP_ID = APP_ID;
var USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';
exports.USER_AGENT = USER_AGENT;
var BaseRequest = {
  Skey: '',
  Sid: '',
  Uin: '',
  DeviceID: ''
};
exports.BaseRequest = BaseRequest;
var LOGIN_INFO = {
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
  selfUserInfo: {}
};
exports.LOGIN_INFO = LOGIN_INFO;
var EMIT_NAME = {
  FRIEND: 'FRIEND',
  CHAT_ROOM: 'CHAT_ROOM',
  OTHER: 'OTHER'
};
exports.EMIT_NAME = EMIT_NAME;
var _default = {
  VERSION: VERSION,
  BASE_URL: BASE_URL,
  DEFAULT_QR: DEFAULT_QR,
  APP_ID: APP_ID,
  USER_AGENT: USER_AGENT,
  BaseRequest: BaseRequest,
  LOGIN_INFO: LOGIN_INFO
};
exports["default"] = _default;