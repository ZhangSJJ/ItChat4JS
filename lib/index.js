var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "sendFile", {
  enumerable: true,
  get: function get() {
    return _Message.sendFile;
  }
});
Object.defineProperty(exports, "sendImage", {
  enumerable: true,
  get: function get() {
    return _Message.sendImage;
  }
});
Object.defineProperty(exports, "sendVideo", {
  enumerable: true,
  get: function get() {
    return _Message.sendVideo;
  }
});
Object.defineProperty(exports, "sendTextMsg", {
  enumerable: true,
  get: function get() {
    return _Message.sendTextMsg;
  }
});
Object.defineProperty(exports, "revokeMsg", {
  enumerable: true,
  get: function get() {
    return _Message.revokeMsg;
  }
});
Object.defineProperty(exports, "transmitMsg", {
  enumerable: true,
  get: function get() {
    return _Message.transmitMsg;
  }
});
exports["default"] = exports.MESSAGE_TYPE = exports.EMIT_NAME = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _events = _interopRequireDefault(require("events"));

var _fastXmlParser = _interopRequireDefault(require("fast-xml-parser"));

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _Utils = require("./Utils");

var _qrcodeTerminal = _interopRequireDefault(require("./qrcode-terminal"));

var _nodeJsCookie = _interopRequireDefault(require("./node-js-cookie"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

var _ConvertData = require("./ConvertData");

var _Contact = _interopRequireDefault(require("./Contact"));

var _Message = _interopRequireWildcard(require("./Message"));

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _StoreGlobalInfo = require("./StoreGlobalInfo");

var _Log = require("./Log");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NodeWeChat = /*#__PURE__*/function (_EventEmitter) {
  (0, _inherits2["default"])(NodeWeChat, _EventEmitter);

  var _super = _createSuper(NodeWeChat);

  function NodeWeChat() {
    var _this;

    (0, _classCallCheck2["default"])(this, NodeWeChat);
    _this = _super.call(this);
    _this.on = _this.on.bind((0, _assertThisInitialized2["default"])(_this));
    _this.emit = _this.emit.bind((0, _assertThisInitialized2["default"])(_this));

    _this.init();

    return _this;
  }

  (0, _createClass2["default"])(NodeWeChat, [{
    key: "init",
    value: function init() {
      this.contactIns = new _Contact["default"]();
      var getChatRoomInfo = this.contactIns.getChatRoomInfo.bind(this.contactIns);
      var updateChatRoomInfo = this.contactIns.updateChatRoomInfo.bind(this.contactIns);
      var getFriendInfo = this.contactIns.getFriendInfo.bind(this.contactIns);
      var getMpInfo = this.contactIns.getMpInfo.bind(this.contactIns);
      var updateLocalUin = this.contactIns.updateLocalUin.bind(this.contactIns);
      this.messageIns = new _Message["default"]({
        on: this.on,
        emit: this.emit,
        getChatRoomInfo: getChatRoomInfo,
        updateChatRoomInfo: updateChatRoomInfo,
        getFriendInfo: getFriendInfo,
        getMpInfo: getMpInfo,
        updateLocalUin: updateLocalUin
      });
      this.verifyFriend = this.contactIns.verifyFriend.bind(this.contactIns);
      this.getContactInfoByName = this.contactIns.getContactInfoByName.bind(this.contactIns);
      this.setAlias = this.contactIns.setAlias.bind(this.contactIns);
      this.setPinned = this.contactIns.setPinned.bind(this.contactIns);
      this.createChatRoom = this.contactIns.createChatRoom.bind(this.contactIns);
      this.setChatRoomName = this.contactIns.setChatRoomName.bind(this.contactIns);
      this.deleteMemberFromChatRoom = this.contactIns.deleteMemberFromChatRoom.bind(this.contactIns);
      this.addMemberIntoChatRoom = this.contactIns.addMemberIntoChatRoom.bind(this.contactIns);
    }
  }, {
    key: "getUserId",
    value: function () {
      var _getUserId = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var url, res, bufferText, reg, match;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                url = "".concat((0, _Utils.getUrlDomain)(_GlobalInfo["default"].LOGIN_INFO.loginUrl), "/jslogin");
                _context.next = 3;
                return (0, _Fetch["default"])(url, {
                  redirect_uri: encodeURIComponent("".concat(_GlobalInfo["default"].LOGIN_INFO.hostUrl, "/webwxnewloginpage")) + "&fun=new&lang=".concat(_GlobalInfo["default"].LANG),
                  appid: _GlobalInfo["default"].APP_ID,
                  json: false,
                  buffer: true
                });

              case 3:
                res = _context.sent;
                bufferText = res.toString();

                if (!bufferText) {
                  _context.next = 15;
                  break;
                }

                reg = /window.QRLogin.code = (\d+); window.QRLogin.uuid = "(\S+?)";/;
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

      (0, _Log.LogInfo)('Please scan the QR code to log in.');
    }
  }, {
    key: "webWxPushLogin",
    value: function () {
      var _webWxPushLogin = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var url, pushLoginRes;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(!_GlobalInfo["default"].LOGIN_INFO.hostUrl || !_GlobalInfo["default"].LOGIN_INFO.wxuin)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", false);

              case 2:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.hostUrl, "/webwxpushloginurl?uin=").concat(_GlobalInfo["default"].LOGIN_INFO.wxuin);
                _context2.next = 5;
                return (0, _Fetch["default"])(url, {
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                });

              case 5:
                pushLoginRes = _context2.sent;
                (0, _Log.LogInfo)('WeChat Push Login Request Result:' + pushLoginRes.msg);

                if (pushLoginRes.ret === '0') {
                  _GlobalInfo["default"].LOGIN_INFO.userId = pushLoginRes.uuid;
                }

                return _context2.abrupt("return", pushLoginRes.ret === '0');

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function webWxPushLogin() {
        return _webWxPushLogin.apply(this, arguments);
      }

      return webWxPushLogin;
    }()
  }, {
    key: "checkUserLogin",
    value: function () {
      var _checkUserLogin = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(userId) {
        var now, url, params, res, bufferText, reg, match, status;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                now = Date.now();
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/login");
                params = {
                  loginicon: true,
                  uuid: userId,
                  tip: 0,
                  r: ~new Date(),
                  json: false,
                  buffer: true
                };

                if (_GlobalInfo["default"].LOGIN_INFO['logintime']) {
                  params._ = ++_GlobalInfo["default"].LOGIN_INFO['logintime'];
                } else {
                  params._ = now;
                }

                _context3.next = 6;
                return (0, _Fetch.FetchWithExcept)(url, params, null);

              case 6:
                res = _context3.sent;

                if (res) {
                  _context3.next = 9;
                  break;
                }

                return _context3.abrupt("return");

              case 9:
                bufferText = res.toString();
                reg = /window.code=(\d+);/;
                match = bufferText.match(reg);

                if (!match) {
                  _context3.next = 34;
                  break;
                }

                status = +match[1];

                if (!(status === 200)) {
                  _context3.next = 22;
                  break;
                }

                _GlobalInfo["default"].LOGIN_INFO.isLogin = true;
                /***清除循环***/

                this.loginWhileDoing.end();
                /***清除循环***/

                (0, _Log.LogInfo)('You are login!');
                _context3.next = 20;
                return this.processLoginInfo(bufferText);

              case 20:
                _context3.next = 32;
                break;

              case 22:
                if (!(status === 201)) {
                  _context3.next = 26;
                  break;
                }

                (0, _Log.LogInfo)('Please press confirm on your phone.');
                _context3.next = 32;
                break;

              case 26:
                if (!(status === 408)) {
                  _context3.next = 30;
                  break;
                }

                (0, _Log.LogInfo)('Please wait for a moment...');
                _context3.next = 32;
                break;

              case 30:
                (0, _Log.LogInfo)('WeChat Mobile Client Refuse To Login!');
                return _context3.abrupt("return", process.exit(0));

              case 32:
                _context3.next = 35;
                break;

              case 34:
                (0, _Log.LogError)('获取登录信息失败！');

              case 35:
                return _context3.abrupt("return", res);

              case 36:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function checkUserLogin(_x) {
        return _checkUserLogin.apply(this, arguments);
      }

      return checkUserLogin;
    }()
  }, {
    key: "processLoginInfo",
    value: function () {
      var _processLoginInfo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(resText) {
        var reg, match, redirectUrl, hostUrl, params, res, cookieArr, urlInfo, urlDetailInfo, _urlDetailInfo, indexUrl, _urlDetailInfo$, loginUrl, fileUrl, syncUrl, bufferText, _ref, ret, skey, wxsid, wxuin, pass_ticket;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                reg = /window.redirect_uri="(\S+)";/;
                match = resText.match(reg);
                redirectUrl = match[1];
                _GlobalInfo["default"].LOGIN_INFO.redirectUrl = redirectUrl;
                hostUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
                params = {
                  fun: 'new',
                  version: 'v2',
                  json: false,
                  redirect: 'manual'
                };

                if (this.desktopMode) {
                  params = _objectSpread(_objectSpread({}, params), {}, {
                    mod: 'desktop',
                    headers: _GlobalInfo["default"].DESKTOP_MODE_HEADER
                  });
                }

                _context4.next = 9;
                return (0, _Fetch["default"])(redirectUrl, params);

              case 9:
                res = _context4.sent;
                cookieArr = (res.headers.raw() || {})['set-cookie'];
                _GlobalInfo["default"].LOGIN_INFO.cookies = new _nodeJsCookie["default"](cookieArr);
                urlInfo = [["wx2.qq.com", ["login.wx2.qq.com", "file.wx2.qq.com", "webpush.wx2.qq.com"]], ["wx8.qq.com", ["login.wx8.qq.com", "file.wx8.qq.com", "webpush.wx8.qq.com"]], ["qq.com", ["login.wx.qq.com", "file.wx.qq.com", "webpush.wx.qq.com"]], ["web2.wechat.com", ["login.web2.wechat.com", "file.web2.wechat.com", "webpush.web2.wechat.com"]], ["wechat.com", ["login.web.wechat.com", "file.web.wechat.com", "webpush.web.wechat.com"]]];
                urlDetailInfo = urlInfo.find(function (info) {
                  return hostUrl.indexOf(info[0]) !== -1;
                });

                if (urlDetailInfo) {
                  _urlDetailInfo = (0, _slicedToArray2["default"])(urlDetailInfo, 2), indexUrl = _urlDetailInfo[0], _urlDetailInfo$ = (0, _slicedToArray2["default"])(_urlDetailInfo[1], 3), loginUrl = _urlDetailInfo$[0], fileUrl = _urlDetailInfo$[1], syncUrl = _urlDetailInfo$[2];
                  _GlobalInfo["default"].LOGIN_INFO['loginUrl'] = "https://".concat(loginUrl, "/cgi-bin/mmwebwx-bin");
                  _GlobalInfo["default"].LOGIN_INFO['fileUrl'] = "https://".concat(fileUrl, "/cgi-bin/mmwebwx-bin");
                  _GlobalInfo["default"].LOGIN_INFO['syncUrl'] = "https://".concat(syncUrl, "/cgi-bin/mmwebwx-bin");
                  _GlobalInfo["default"].LOGIN_INFO.hostUrl = hostUrl;
                } else {// GlobalInfo.LOGIN_INFO['loginUrl'] = GlobalInfo.LOGIN_INFO['fileUrl'] = GlobalInfo.LOGIN_INFO['syncUrl'] = GlobalInfo.LOGIN_INFO.hostUrl;
                }

                _context4.next = 17;
                return (0, _Fetch.toBuffer)(res);

              case 17:
                res = _context4.sent;
                bufferText = res.toString();
                _ref = (_fastXmlParser["default"].parse(bufferText) || {}).error || {}, ret = _ref.ret, skey = _ref.skey, wxsid = _ref.wxsid, wxuin = _ref.wxuin, pass_ticket = _ref.pass_ticket;

                if (!(ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket)) {
                  _context4.next = 33;
                  break;
                }

                _GlobalInfo["default"].LOGIN_INFO.skey = _GlobalInfo["default"].BaseRequest.Skey = skey;
                _GlobalInfo["default"].LOGIN_INFO.wxsid = _GlobalInfo["default"].BaseRequest.Sid = wxsid;
                _GlobalInfo["default"].LOGIN_INFO.wxuin = _GlobalInfo["default"].BaseRequest.Uin = wxuin;
                _GlobalInfo["default"].LOGIN_INFO.pass_ticket = pass_ticket;
                _context4.next = 27;
                return this.webInit();

              case 27:
                _context4.next = 29;
                return this.contactIns.getContact(true);

              case 29:
                //登录态存储
                (0, _StoreGlobalInfo.saveGlobalInfo)();
                this.startReceiving();
                _context4.next = 35;
                break;

              case 33:
                (0, _Log.LogInfo)("Your wechat account may be LIMITED to log in WEB wechat, error info:".concat(bufferText));
                return _context4.abrupt("return", process.exit(0));

              case 35:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function processLoginInfo(_x2) {
        return _processLoginInfo.apply(this, arguments);
      }

      return processLoginInfo;
    }()
  }, {
    key: "startReceiving",
    value: function startReceiving() {
      var _this2 = this;

      if (!this.autoReceiving) {
        return;
      }

      this.getMsgWhileDoing && this.getMsgWhileDoing.end();

      var doingFn = /*#__PURE__*/function () {
        var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
          var selector, msgInfo, msgList, modContactList, delContactList;
          return _regenerator["default"].wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return _this2.syncCheck();

                case 2:
                  selector = _context5.sent;
                  (0, _Log.LogInfo)('selector: ' + selector);

                  if (!(!selector || selector === '0')) {
                    _context5.next = 6;
                    break;
                  }

                  return _context5.abrupt("return");

                case 6:
                  _context5.next = 8;
                  return _this2.getMsg();

                case 8:
                  msgInfo = _context5.sent;

                  if (msgInfo) {
                    _context5.next = 11;
                    break;
                  }

                  return _context5.abrupt("return");

                case 11:
                  msgList = msgInfo.msgList, modContactList = msgInfo.modContactList, delContactList = msgInfo.delContactList;

                  _this2.messageIns.produceMsg(msgList);

                  _this2.contactIns.updateContactList(modContactList);

                  _this2.contactIns.deleteContactList(delContactList);

                case 15:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));

        return function doingFn() {
          return _ref2.apply(this, arguments);
        };
      }();

      this.getMsgWhileDoing = new _Utils.WhileDoing(doingFn);
      this.getMsgWhileDoing.start();
    }
  }, {
    key: "syncCheck",
    value: function () {
      var _syncCheck = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
        var url, params, res, bufferText, reg, match;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO['syncUrl'] || _GlobalInfo["default"].LOGIN_INFO.hostUrl, "/synccheck");
                params = {
                  r: Date.now(),
                  skey: _GlobalInfo["default"].LOGIN_INFO['skey'],
                  sid: _GlobalInfo["default"].LOGIN_INFO['wxsid'],
                  uin: _GlobalInfo["default"].LOGIN_INFO['wxuin'],
                  deviceid: (0, _Utils.getDeviceID)(),
                  synckey: _GlobalInfo["default"].LOGIN_INFO.syncKeyStr,
                  _: ++_GlobalInfo["default"].LOGIN_INFO['logintime'],
                  json: false,
                  buffer: true,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context6.next = 4;
                return (0, _Fetch.FetchWithExcept)(url, params, 'window.synccheck={retcode:"0",selector:"0"}');

              case 4:
                res = _context6.sent;
                bufferText = res.toString();
                reg = /window.synccheck={retcode:"(\d+)",selector:"(\d+)"}/;
                match = bufferText.match(reg);

                if (!(match && match[1] === '0')) {
                  _context6.next = 10;
                  break;
                }

                return _context6.abrupt("return", match[2]);

              case 10:
                if (!(!match || ['1100', '1101', '1102'].indexOf(match[1]) === -1)) {
                  _context6.next = 13;
                  break;
                }

                (0, _Log.LogError)('SyncCheck Net Error...' + (match ? match[1] : ''));
                return _context6.abrupt("return", '0');

              case 13:
                (0, _Log.LogInfo)('User Log Out...' + match[1]);
                this.getMsgWhileDoing.end();
                _context6.next = 17;
                return this.login({
                  receiving: true,
                  desktopMode: this.desktopMode
                });

              case 17:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function syncCheck() {
        return _syncCheck.apply(this, arguments);
      }

      return syncCheck;
    }()
  }, {
    key: "getMsg",
    value: function () {
      var _getMsg = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
        var url, params, res, cookieArr;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                (0, _Log.LogInfo)('Getting Message...');
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.hostUrl, "/webwxsync?sid=").concat(_GlobalInfo["default"].LOGIN_INFO.wxsid, "&skey=").concat(_GlobalInfo["default"].LOGIN_INFO.skey, "&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  BaseRequest: (0, _Utils.getBaseRequest)(),
                  method: 'post',
                  json: false,
                  //为了拿headers更新cookie
                  SyncKey: _GlobalInfo["default"].LOGIN_INFO.syncKey,
                  rr: ~new Date(),
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context7.next = 5;
                return (0, _Fetch.FetchWithExcept)(url, params, {
                  BaseResponse: {
                    Ret: -1
                  }
                });

              case 5:
                res = _context7.sent;

                //更新cookie
                if (res.headers && res.headers.raw && typeof res.headers.raw === 'function') {
                  cookieArr = (res.headers.raw() || {})['set-cookie'];

                  _GlobalInfo["default"].LOGIN_INFO.cookies.updateCookies(cookieArr);
                }

                _context7.next = 9;
                return (0, _Fetch.toJSON)(res)["catch"](function (e) {
                  (0, _Log.LogError)(JSON.stringify('ToJSON Error：' + e));
                });

              case 9:
                res = _context7.sent;
                this.setSyncKey(res && res.SyncKey);
                this.setSyncCheckKey(res && res.SyncCheckKey);

                if (!(!res || res.BaseResponse.Ret !== 0)) {
                  _context7.next = 14;
                  break;
                }

                return _context7.abrupt("return");

              case 14:
                _GlobalInfo["default"].LOGIN_INFO.syncKeyStr = ((_GlobalInfo["default"].LOGIN_INFO.syncCheckKey || _GlobalInfo["default"].LOGIN_INFO.syncKey).List || []).map(function (item) {
                  return item.Key + '_' + item.Val;
                }).join('|');
                return _context7.abrupt("return", {
                  msgList: res.AddMsgList,
                  modContactList: res.ModContactList,
                  delContactList: res.DelContactList
                });

              case 16:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getMsg() {
        return _getMsg.apply(this, arguments);
      }

      return getMsg;
    }()
  }, {
    key: "showMobileLogin",
    value: function () {
      var _showMobileLogin = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
        var url, params, res, formatRes;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.hostUrl, "/webwxstatusnotify?lang=").concat(_GlobalInfo["default"].LANG, "&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);

                if (!(!_GlobalInfo["default"].LOGIN_INFO.cookies || !_GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url)))) {
                  _context8.next = 3;
                  break;
                }

                return _context8.abrupt("return", false);

              case 3:
                params = {
                  method: 'post',
                  BaseRequest: (0, _Utils.getBaseRequest)(),
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
      var _webInit = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
        var url, params, res;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.hostUrl, "/webwxinit?r=").concat(~new Date(), "&lang=").concat(_GlobalInfo["default"].LANG, "&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  BaseRequest: (0, _Utils.getBaseRequest)(),
                  method: 'post',
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context9.next = 4;
                return (0, _Fetch["default"])(url, params);

              case 4:
                res = _context9.sent;
                this.setSyncKey(res.SyncKey);
                _GlobalInfo["default"].LOGIN_INFO.skey = _GlobalInfo["default"].BaseRequest.Skey = res.SKey;
                _GlobalInfo["default"].LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
                  return item.Key + '_' + item.Val;
                }).join('|');
                _GlobalInfo["default"].LOGIN_INFO['logintime'] = Date.now();
                _GlobalInfo["default"].LOGIN_INFO['InviteStartCount'] = res.InviteStartCount;
                (0, _Utils.emojiFormatter)(res.User, 'NickName');
                _GlobalInfo["default"].LOGIN_INFO.selfUserInfo = (0, _ConvertData.structFriendInfo)(res.User); // this.contactIns.memberList.push(GlobalInfo.LOGIN_INFO.selfUserInfo);
                // # deal with contact list returned when init

                this.contactIns.updateContactList(res.ContactList);

              case 13:
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
      var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(options) {
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.login(_objectSpread(_objectSpread({}, options), {}, {
                  receiving: true
                }));

              case 2:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function run(_x3) {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: "login",
    value: function () {
      var _login = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12() {
        var _this3 = this;

        var _ref3,
            _ref3$receiving,
            receiving,
            _ref3$desktopMode,
            desktopMode,
            isLogin,
            _args12 = arguments;

        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _ref3 = _args12.length > 0 && _args12[0] !== undefined ? _args12[0] : {}, _ref3$receiving = _ref3.receiving, receiving = _ref3$receiving === void 0 ? false : _ref3$receiving, _ref3$desktopMode = _ref3.desktopMode, desktopMode = _ref3$desktopMode === void 0 ? false : _ref3$desktopMode;
                this.autoReceiving = receiving; // 监听消息

                this.desktopMode = desktopMode; // 桌面版本微信 hack某些微信号天生无法网页登录的缺陷

                _context12.next = 5;
                return (0, _StoreGlobalInfo.readAndMergeGlobalInfo)();

              case 5:
                //清空可能上次登录获取的联系人列表
                this.contactIns.clearContactList();
                _context12.next = 8;
                return this.showMobileLogin();

              case 8:
                isLogin = _context12.sent;

                if (!isLogin) {
                  _context12.next = 15;
                  break;
                }

                _context12.next = 12;
                return this.contactIns.getContact(true);

              case 12:
                this.startReceiving();
                _context12.next = 25;
                break;

              case 15:
                _context12.next = 17;
                return this.webWxPushLogin();

              case 17:
                if (_context12.sent) {
                  _context12.next = 22;
                  break;
                }

                _context12.next = 20;
                return this.getUserId();

              case 20:
                _GlobalInfo["default"].LOGIN_INFO.userId = _context12.sent;
                this.drawQRImage(_GlobalInfo["default"].LOGIN_INFO.userId);

              case 22:
                this.loginWhileDoing = new _Utils.WhileDoing( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
                  return _regenerator["default"].wrap(function _callee11$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          _context11.next = 2;
                          return _this3.checkUserLogin(_GlobalInfo["default"].LOGIN_INFO.userId);

                        case 2:
                        case "end":
                          return _context11.stop();
                      }
                    }
                  }, _callee11);
                })));
                _context12.next = 25;
                return this.loginWhileDoing.start();

              case 25:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function login() {
        return _login.apply(this, arguments);
      }

      return login;
    }()
  }, {
    key: "listen",
    value: function listen(emitName, msgType, callback) {
      if (!msgType) {
        msgType = [];
      }

      if (!(0, _Utils.isArray)(msgType)) {
        msgType = [msgType];
      }

      this.on(emitName, function (msgInfo, messageFrom) {
        if (!msgType.length || msgType.indexOf(msgInfo.type) !== -1) {
          callback && callback(msgInfo, messageFrom);
        }
      });
    }
  }, {
    key: "setSyncKey",
    value: function setSyncKey(syncKey) {
      if (syncKey && syncKey.Count > 0) {
        _GlobalInfo["default"].LOGIN_INFO.syncKey = syncKey;
      } else {
        (0, _Log.LogError)("JS Function: setSyncKey. Error. no synckey");
      }
    }
  }, {
    key: "setSyncCheckKey",
    value: function setSyncCheckKey(syncCheckKey) {
      if (syncCheckKey && syncCheckKey.Count > 0) {
        _GlobalInfo["default"].LOGIN_INFO.syncCheckKey = syncCheckKey;
      } else {
        (0, _Log.LogError)("JS Function: setSyncCheckKey. Error. no synccheckkey");
      }
    }
  }]);
  return NodeWeChat;
}(_events["default"]);

var EMIT_NAME = _GlobalInfo["default"].EMIT_NAME;
exports.EMIT_NAME = EMIT_NAME;
var MESSAGE_TYPE = _GlobalInfo["default"].MESSAGE_TYPE;
exports.MESSAGE_TYPE = MESSAGE_TYPE;
var _default = NodeWeChat;
exports["default"] = _default;