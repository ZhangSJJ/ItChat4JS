var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _events = _interopRequireDefault(require("events"));

var _fastXmlParser = _interopRequireDefault(require("fast-xml-parser"));

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _Utils = require("./Utils");

var _qrcodeTerminal = _interopRequireDefault(require("./qrcode-terminal"));

var _nodeJsCookie = _interopRequireDefault(require("./node-js-cookie"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

var _ConvertData = require("./ConvertData");

var _Contact = _interopRequireDefault(require("./Contact"));

var _Message = _interopRequireDefault(require("./Message"));

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _StoreGlobalInfo = require("./StoreGlobalInfo");

/**
 * @time 2019/6/5
 */
var NodeWeChat =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2["default"])(NodeWeChat, _EventEmitter);

  function NodeWeChat() {
    var _this;

    (0, _classCallCheck2["default"])(this, NodeWeChat);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(NodeWeChat).call(this));
    _this.on = _this.on.bind((0, _assertThisInitialized2["default"])(_this));
    _this.emit = _this.emit.bind((0, _assertThisInitialized2["default"])(_this));

    _this.init();

    return _this;
  }

  (0, _createClass2["default"])(NodeWeChat, [{
    key: "init",
    value: function init() {
      this.contactIns = new _Contact["default"]();
      this.getChatRoomInfo = this.contactIns.getChatRoomInfo.bind(this.contactIns);
      this.updateChatRoomInfo = this.contactIns.updateChatRoomInfo.bind(this.contactIns);
      this.getFriendInfo = this.contactIns.getFriendInfo.bind(this.contactIns);
      this.getMpInfo = this.contactIns.getMpInfo.bind(this.contactIns);
      this.messageIns = new _Message["default"]({
        on: this.on,
        emit: this.emit,
        getChatRoomInfo: this.getChatRoomInfo,
        updateChatRoomInfo: this.updateChatRoomInfo,
        getFriendInfo: this.getFriendInfo,
        getMpInfo: this.getMpInfo
      });
    }
  }, {
    key: "getUserId",
    value: function () {
      var _getUserId = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var url, res, bufferText, reg, match;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                url = _GlobalInfo["default"].BASE_URL + "/jslogin";
                _context.next = 3;
                return (0, _Fetch["default"])(url, {
                  appid: _GlobalInfo["default"].APP_ID,
                  json: false
                });

              case 3:
                res = _context.sent;
                bufferText = (0, _Utils.convertRes)(res);

                if (!bufferText) {
                  _context.next = 15;
                  break;
                }

                reg = 'window.QRLogin.code = (\\d+); window.QRLogin.uuid = "(\\S+?)";';
                match = bufferText.match(reg);

                if (!(match && +match[1] === 200)) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt("return", match[2]);

              case 12:
                throw new Error('获取userId失败！');

              case 13:
                _context.next = 16;
                break;

              case 15:
                throw new Error('获取userId失败！');

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getUserId() {
        return _getUserId.apply(this, arguments);
      }

      return getUserId;
    }()
  }, {
    key: "drawQRImage",
    value: function drawQRImage(uuid) {
      var url = 'https://login.weixin.qq.com/l/' + uuid;

      _qrcodeTerminal["default"].generate(url);

      console.log('Please scan the QR code to log in.');
    }
  }, {
    key: "checkUserLogin",
    value: function () {
      var _checkUserLogin = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(userId) {
        var now, url, params, res, bufferText, reg, match, status;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                now = Date.now();
                url = "".concat(_GlobalInfo["default"].BASE_URL, "/cgi-bin/mmwebwx-bin/login");
                params = {
                  loginicon: true,
                  uuid: userId,
                  tip: 0,
                  r: Math.floor(-now / 1579),
                  _: now,
                  json: false
                };
                _context2.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context2.sent;
                bufferText = (0, _Utils.convertRes)(res);
                reg = 'window.code=(\\d+);';
                match = bufferText.match(reg);

                if (!match) {
                  _context2.next = 22;
                  break;
                }

                status = +match[1];

                if (!(status === 200)) {
                  _context2.next = 19;
                  break;
                }

                _GlobalInfo["default"].LOGIN_INFO.isLogin = true;
                /***清除循环***/

                this.loginWhileDoing.end();
                /***清除循环***/

                console.log('You are login!');
                _context2.next = 17;
                return this.processLoginInfo(bufferText);

              case 17:
                _context2.next = 20;
                break;

              case 19:
                if (status === 201) {
                  console.log('Please press confirm on your phone.');
                } else {
                  console.log('Please wait for a moment...');
                }

              case 20:
                _context2.next = 23;
                break;

              case 22:
                throw new Error('获取登录信息失败！');

              case 23:
                return _context2.abrupt("return", res);

              case 24:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function checkUserLogin(_x) {
        return _checkUserLogin.apply(this, arguments);
      }

      return checkUserLogin;
    }()
  }, {
    key: "processLoginInfo",
    value: function () {
      var _processLoginInfo = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3(resText) {
        var reg, match, redirectUrl, res, cookieArr, urlInfo, buffer, _ref3, ret, skey, wxsid, wxuin, pass_ticket;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                reg = 'window.redirect_uri="(\\S+)";';
                match = resText.match(reg);
                redirectUrl = match[1];
                _GlobalInfo["default"].LOGIN_INFO.redirectUrl = redirectUrl;
                _GlobalInfo["default"].LOGIN_INFO.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
                _context3.next = 7;
                return (0, _Fetch["default"])(redirectUrl, {
                  json: false,
                  redirect: 'manual'
                });

              case 7:
                res = _context3.sent;
                cookieArr = (res.headers.raw() || {})['set-cookie'];
                _GlobalInfo["default"].LOGIN_INFO.cookies = new _nodeJsCookie["default"](cookieArr);
                urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]], ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]], ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]], ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]], ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]];
                _GlobalInfo["default"].LOGIN_INFO['deviceid'] = 'e' + (Math.random() + '').substring(2, 17);
                _GlobalInfo["default"].LOGIN_INFO['logintime'] = Date.now();
                urlInfo.forEach(function (_ref) {
                  var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
                      indexUrl = _ref2[0],
                      _ref2$ = (0, _slicedToArray2["default"])(_ref2[1], 2),
                      fileUrl = _ref2$[0],
                      syncUrl = _ref2$[1];

                  if (_GlobalInfo["default"].LOGIN_INFO.loginUrl.indexOf(indexUrl) !== -1) {
                    _GlobalInfo["default"].LOGIN_INFO['fileUrl'] = fileUrl;
                    _GlobalInfo["default"].LOGIN_INFO['syncUrl'] = syncUrl;
                  } else {
                    _GlobalInfo["default"].LOGIN_INFO['fileUrl'] = _GlobalInfo["default"].LOGIN_INFO['syncUrl'] = _GlobalInfo["default"].LOGIN_INFO.loginUrl;
                  }
                });
                buffer = new Buffer(res.body._buffer).toString();
                _ref3 = (_fastXmlParser["default"].parse(buffer) || {}).error || {}, ret = _ref3.ret, skey = _ref3.skey, wxsid = _ref3.wxsid, wxuin = _ref3.wxuin, pass_ticket = _ref3.pass_ticket;

                if (!(ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket)) {
                  _context3.next = 30;
                  break;
                }

                _GlobalInfo["default"].LOGIN_INFO.skey = _GlobalInfo["default"].BaseRequest.Skey = skey;
                _GlobalInfo["default"].LOGIN_INFO.wxsid = _GlobalInfo["default"].BaseRequest.Sid = wxsid;
                _GlobalInfo["default"].LOGIN_INFO.wxuin = _GlobalInfo["default"].BaseRequest.Uin = wxuin;
                _GlobalInfo["default"].LOGIN_INFO.pass_ticket = pass_ticket;
                _GlobalInfo["default"].BaseRequest.DeviceID = _GlobalInfo["default"].LOGIN_INFO['deviceid'];
                _context3.next = 24;
                return this.webInit();

              case 24:
                _context3.next = 26;
                return this.contactIns.getContact(true);

              case 26:
                //登录态存储
                (0, _StoreGlobalInfo.saveGlobalInfo)();
                this.startReceiving();
                _context3.next = 31;
                break;

              case 30:
                console.log("Your wechat account may be LIMITED to log in WEB wechat, error info:".concat(buffer));

              case 31:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function processLoginInfo(_x2) {
        return _processLoginInfo.apply(this, arguments);
      }

      return processLoginInfo;
    }()
  }, {
    key: "startReceiving",
    value: function startReceiving(exitCallback) {
      var _this2 = this;

      var doingFn =
      /*#__PURE__*/
      function () {
        var _ref4 = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee4() {
          var selector, _ref5, msgList, contactList;

          return _regenerator["default"].wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return _this2.syncCheck();

                case 2:
                  selector = _context4.sent;
                  console.log('selector: ' + selector);

                  if (!(selector === '0')) {
                    _context4.next = 6;
                    break;
                  }

                  return _context4.abrupt("return");

                case 6:
                  _context4.next = 8;
                  return _this2.getMsg();

                case 8:
                  _ref5 = _context4.sent;
                  msgList = _ref5.msgList;
                  contactList = _ref5.contactList;

                  _this2.messageIns.produceMsg(msgList);

                case 12:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        return function doingFn() {
          return _ref4.apply(this, arguments);
        };
      }();

      this.getMsgWhileDoing = new _Utils.WhileDoing(doingFn, 3000);
      this.getMsgWhileDoing.start();
    }
  }, {
    key: "syncCheck",
    value: function () {
      var _syncCheck = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5() {
        var url, params, res, bufferText, reg, match;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO['syncUrl'] || _GlobalInfo["default"].LOGIN_INFO.loginUrl, "/synccheck");
                params = {
                  r: Date.now(),
                  skey: _GlobalInfo["default"].LOGIN_INFO['skey'],
                  sid: _GlobalInfo["default"].LOGIN_INFO['wxsid'],
                  uin: _GlobalInfo["default"].LOGIN_INFO['wxuin'],
                  deviceid: _GlobalInfo["default"].LOGIN_INFO['deviceid'],
                  synckey: _GlobalInfo["default"].LOGIN_INFO.syncKeyStr,
                  _: _GlobalInfo["default"].LOGIN_INFO['logintime'],
                  json: false,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _GlobalInfo["default"].LOGIN_INFO['logintime'] += 1;
                _context5.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context5.sent;
                bufferText = (0, _Utils.convertRes)(res);
                reg = 'window.synccheck={retcode:"(\\d+)",selector:"(\\d+)"}';
                match = bufferText.match(reg);

                if (!match || match[1] !== '0') {
                  process.exit(0);
                }

                return _context5.abrupt("return", match[2]);

              case 11:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function syncCheck() {
        return _syncCheck.apply(this, arguments);
      }

      return syncCheck;
    }()
  }, {
    key: "getMsg",
    value: function () {
      var _getMsg = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee6() {
        var url, params, res, cookieArr;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                console.log('getmsg');
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsync?sid=").concat(_GlobalInfo["default"].LOGIN_INFO.wxsid, "&skey=").concat(_GlobalInfo["default"].LOGIN_INFO.skey, "&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  method: 'post',
                  json: false,
                  //为了拿headers更新cookie
                  SyncKey: _GlobalInfo["default"].LOGIN_INFO.syncKey,
                  rr: ~Date.now(),
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context6.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context6.sent;
                //更新cookie
                cookieArr = (res.headers.raw() || {})['set-cookie'];

                _GlobalInfo["default"].LOGIN_INFO.cookies.updateCookies(cookieArr);

                _context6.next = 10;
                return (0, _Fetch.toJSON)(res);

              case 10:
                res = _context6.sent;

                if (!(res.BaseResponse.Ret !== 0)) {
                  _context6.next = 13;
                  break;
                }

                return _context6.abrupt("return");

              case 13:
                _GlobalInfo["default"].LOGIN_INFO.syncKey = res.SyncKey;
                _GlobalInfo["default"].LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
                  return item.Key + '_' + item.Val;
                }).join('|');
                return _context6.abrupt("return", {
                  msgList: res.AddMsgList,
                  contactList: res.ModContactList
                });

              case 16:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function getMsg() {
        return _getMsg.apply(this, arguments);
      }

      return getMsg;
    }()
  }, {
    key: "sendMsg",
    value: function () {
      var _sendMsg = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee7(msgType, content, toUserName) {
        var url, params, res;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendmsg");
                params = {
                  method: 'post',
                  BaseRequest: (0, _objectSpread2["default"])({}, _GlobalInfo["default"].BaseRequest, {
                    DeviceID: 'e' + (Math.random() + '').substring(2, 17)
                  }),
                  Msg: {
                    Type: msgType,
                    Content: content,
                    FromUserName: _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName,
                    ToUserName: toUserName || _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName,
                    LocalID: Date.now() * 1e4 + '',
                    ClientMsgId: Date.now() * 1e4 + ''
                  },
                  Scene: 0,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context7.next = 4;
                return (0, _Fetch["default"])(url, params);

              case 4:
                res = _context7.sent;
                // const returnValue = new ReturnValueFormat(res);
                console.log(res);

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function sendMsg(_x3, _x4, _x5) {
        return _sendMsg.apply(this, arguments);
      }

      return sendMsg;
    }()
  }, {
    key: "showMobileLogin",
    value: function () {
      var _showMobileLogin = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee8() {
        var url, params, res, formatRes;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxstatusnotify?lang=zh_CN&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);

                if (!(!_GlobalInfo["default"].LOGIN_INFO.cookies || !_GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url)))) {
                  _context8.next = 3;
                  break;
                }

                return _context8.abrupt("return", false);

              case 3:
                params = {
                  method: 'post',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  Code: 3,
                  FromUserName: _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName,
                  ToUserName: _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName,
                  ClientMsgId: Date.now(),
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context8.next = 6;
                return (0, _Fetch["default"])(url, params);

              case 6:
                res = _context8.sent;
                formatRes = new _ReturnValueFormat["default"](res);
                return _context8.abrupt("return", formatRes.value().BaseResponse && formatRes.value().BaseResponse.Ret === 0);

              case 9:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function showMobileLogin() {
        return _showMobileLogin.apply(this, arguments);
      }

      return showMobileLogin;
    }()
  }, {
    key: "webInit",
    value: function () {
      var _webInit = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee9() {
        var now, url, params, res, contactList, chatRoomList, otherList;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                now = Date.now();
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxinit?r=").concat(Math.floor(-now / 1579), "&lang=zh_CN&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  method: 'post',
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context9.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context9.sent;
                _GlobalInfo["default"].LOGIN_INFO.syncKey = res.SyncKey;
                _GlobalInfo["default"].LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
                  return item.Key + '_' + item.Val;
                }).join('|');
                _GlobalInfo["default"].LOGIN_INFO['InviteStartCount'] = res.InviteStartCount;
                _GlobalInfo["default"].LOGIN_INFO.selfUserInfo = (0, _ConvertData.structFriendInfo)(res.User); // this.contactIns.memberList.push(GlobalInfo.LOGIN_INFO.selfUserInfo);
                // # deal with contact list returned when init

                contactList = res.ContactList || [], chatRoomList = [], otherList = [];
                contactList.forEach(function (item) {
                  if (item.Sex !== 0) {
                    otherList.push(item);
                  } else if (item.UserName.indexOf('@@') !== -1) {
                    item.MemberList = [];
                    chatRoomList.push(item);
                  } else if (item.UserName.indexOf('@') !== -1) {
                    otherList.push(item);
                  }
                });
                this.contactIns.updateLocalChatRoom(chatRoomList);
                this.contactIns.updateLocalFriends(otherList);

              case 14:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function webInit() {
        return _webInit.apply(this, arguments);
      }

      return webInit;
    }()
  }, {
    key: "run",
    value: function () {
      var _run = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee11() {
        var _this3 = this;

        var isLogin, userId;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return (0, _StoreGlobalInfo.readAndMergeGlobalInfo)();

              case 2:
                _context11.next = 4;
                return this.showMobileLogin();

              case 4:
                isLogin = _context11.sent;

                if (!isLogin) {
                  _context11.next = 9;
                  break;
                }

                this.startReceiving();
                _context11.next = 15;
                break;

              case 9:
                _context11.next = 11;
                return this.getUserId();

              case 11:
                userId = _context11.sent;
                this.drawQRImage(userId);
                this.loginWhileDoing = new _Utils.WhileDoing(
                /*#__PURE__*/
                (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee10() {
                  return _regenerator["default"].wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          _context10.next = 2;
                          return _this3.checkUserLogin(userId);

                        case 2:
                        case "end":
                          return _context10.stop();
                      }
                    }
                  }, _callee10);
                })));
                this.loginWhileDoing.start();

              case 15:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function run() {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }]);
  return NodeWeChat;
}(_events["default"]);

exports["default"] = NodeWeChat;
NodeWeChat.MESSAGE_TYPE = _GlobalInfo["default"].EMIT_NAME;