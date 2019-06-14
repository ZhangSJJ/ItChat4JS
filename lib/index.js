var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fastXmlParser = _interopRequireDefault(require("fast-xml-parser"));

var _Config = require("./Config");

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _Utils = require("./Utils");

var _nodeJsCookie = _interopRequireDefault(require("./node-js-cookie"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

var _ConvertData = require("./ConvertData");

var _Contact = _interopRequireDefault(require("./Contact"));

var _Templates = require("./Templates");

var _Message = _interopRequireDefault(require("./Message"));

/**
 * @time 2019/6/5
 */
var qrCode = require('./qrcode-terminal');

var NodeWeChat =
/*#__PURE__*/
function () {
  function NodeWeChat() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, NodeWeChat);
    var friendChatInfo = props.friendChatInfo,
        groupChatInfo = props.groupChatInfo,
        mpChatInfo = props.mpChatInfo;
    this.fridendChat = {};
    this.groupChat = {};
    this.mpChat = {};
    this.init();
  }

  (0, _createClass2["default"])(NodeWeChat, [{
    key: "init",
    value: function init() {
      this.store = {
        BaseRequest: {},
        loginInfo: {},
        storageClass: {},
        memberList: []
      };
      this.mssageIns = new _Message["default"]({
        store: this.store
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
                url = _Config.BASE_URL + "/jslogin";
                _context.next = 3;
                return (0, _Fetch["default"])(url, {
                  appid: _Config.APP_ID,
                  json: false
                });

              case 3:
                res = _context.sent;
                bufferText = convertRes(res);

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
      qrCode.generate(url);
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
                url = "".concat(_Config.BASE_URL, "/cgi-bin/mmwebwx-bin/login");
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
                bufferText = convertRes(res);
                reg = 'window.code=(\\d+);';
                match = bufferText.match(reg);

                if (!match) {
                  _context2.next = 21;
                  break;
                }

                status = +match[1];

                if (!(status === 200)) {
                  _context2.next = 18;
                  break;
                }

                this.store.isLogin = true;
                /***清除循环***/

                this.loginWhileDoing.end();
                /***清除循环***/

                _context2.next = 16;
                return this.processLoginInfo(bufferText);

              case 16:
                _context2.next = 19;
                break;

              case 18:
                if (status === 201) {
                  console.log('Please press confirm on your phone.');
                }

              case 19:
                _context2.next = 22;
                break;

              case 21:
                throw new Error('获取登录信息失败！');

              case 22:
                return _context2.abrupt("return", res);

              case 23:
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
        var _this = this;

        var reg, match, redirectUrl, res, cookieArr, urlInfo, buffer, _ref3, ret, skey, wxsid, wxuin, pass_ticket;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                reg = 'window.redirect_uri="(\\S+)";';
                match = resText.match(reg);
                redirectUrl = match[1];
                this.store.redirectUrl = redirectUrl;
                this.store.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
                _context3.next = 7;
                return (0, _Fetch["default"])(redirectUrl, {
                  json: false,
                  redirect: 'manual'
                });

              case 7:
                res = _context3.sent;
                cookieArr = (res.headers.raw() || {})['set-cookie'];
                this.store.cookies = new _nodeJsCookie["default"](cookieArr);
                urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]], ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]], ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]], ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]], ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]];
                this.store.loginInfo['deviceid'] = 'e' + (Math.random() + '').substring(2, 17);
                this.store.loginInfo['logintime'] = Date.now();
                urlInfo.forEach(function (_ref) {
                  var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
                      indexUrl = _ref2[0],
                      _ref2$ = (0, _slicedToArray2["default"])(_ref2[1], 2),
                      fileUrl = _ref2$[0],
                      syncUrl = _ref2$[1];

                  if (_this.store.loginUrl.indexOf(indexUrl) !== -1) {
                    _this.store.loginInfo['fileUrl'] = fileUrl;
                    _this.store.loginInfo['syncUrl'] = syncUrl;
                  } else {
                    _this.store.loginInfo['fileUrl'] = _this.store.loginInfo['syncUrl'] = _this.store.loginUrl;
                  }
                });
                buffer = new Buffer(res.body._buffer).toString();
                _ref3 = (_fastXmlParser["default"].parse(buffer) || {}).error || {}, ret = _ref3.ret, skey = _ref3.skey, wxsid = _ref3.wxsid, wxuin = _ref3.wxuin, pass_ticket = _ref3.pass_ticket;

                if (!(ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket)) {
                  _context3.next = 32;
                  break;
                }

                this.store.loginInfo.skey = this.store.BaseRequest.Skey = skey;
                this.store.loginInfo.wxsid = this.store.BaseRequest.Sid = wxsid;
                this.store.loginInfo.wxuin = this.store.BaseRequest.Uin = wxuin;
                this.store.loginInfo.pass_ticket = pass_ticket;
                this.store.BaseRequest.DeviceID = this.store.loginInfo['deviceid'];
                this.store.contactIns = new _Contact["default"](this.store);
                _context3.next = 25;
                return this.webInit();

              case 25:
                _context3.next = 27;
                return this.showMobileLogin();

              case 27:
                _context3.next = 29;
                return this.store.contactIns.getContact(true);

              case 29:
                this.startReceiving();
                _context3.next = 33;
                break;

              case 32:
                console.log("Your wechat account may be LIMITED to log in WEB wechat, error info:".concat(buffer));

              case 33:
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

                  if (!(+selector === 0)) {
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

                  if (!(msgList[0] && msgList[0].Content)) {
                    _context4.next = 14;
                    break;
                  }

                  _context4.next = 14;
                  return _this2.mssageIns.sendMsg(1, msgList[0].Content, 'filehelper');

                case 14:
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
                url = "".concat(this.store.loginInfo['syncUrl'] || this.store.loginUrl, "/synccheck");
                params = {
                  r: Date.now(),
                  skey: this.store.loginInfo['skey'],
                  sid: this.store.loginInfo['wxsid'],
                  uin: this.store.loginInfo['wxuin'],
                  deviceid: this.store.loginInfo['deviceid'],
                  synckey: this.store.loginInfo.syncKeyStr,
                  _: this.store.loginInfo['logintime'],
                  json: false,
                  headers: {
                    cookie: this.store.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                this.store.loginInfo['logintime'] += 1;
                _context5.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context5.sent;
                bufferText = convertRes(res);
                reg = 'window.synccheck={retcode:"(\\d+)",selector:"(\\d+)"}';
                match = bufferText.match(reg);

                if (!(!match || +match[1] !== 0)) {
                  _context5.next = 11;
                  break;
                }

                throw new Error('Unexpected sync check result: ' + bufferText);

              case 11:
                return _context5.abrupt("return", match[2]);

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
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
                url = "".concat(this.store.loginUrl, "/webwxsync?sid=").concat(this.store.loginInfo.wxsid, "&skey=").concat(this.store.loginInfo.skey, "&pass_ticket=").concat(this.store.loginInfo.pass_ticket);
                params = {
                  BaseRequest: this.store.BaseRequest,
                  method: 'post',
                  json: false,
                  //为了拿headers更新cookie
                  SyncKey: this.store.loginInfo.syncKey,
                  rr: ~Date.now(),
                  headers: {
                    cookie: this.store.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context6.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context6.sent;
                //更新cookie
                cookieArr = (res.headers.raw() || {})['set-cookie'];
                this.store.cookies.updateCookies(cookieArr);
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
                this.store.loginInfo.syncKey = res.SyncKey;
                this.store.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
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
        }, _callee6, this);
      }));

      function getMsg() {
        return _getMsg.apply(this, arguments);
      }

      return getMsg;
    }()
  }, {
    key: "showMobileLogin",
    value: function () {
      var _showMobileLogin = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee7() {
        var url, params, res, returnValue;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                url = "".concat(this.store.loginUrl, "/webwxstatusnotify?lang=zh_CN&pass_ticket=").concat(this.store.loginInfo.pass_ticket);
                params = {
                  method: 'post',
                  BaseRequest: this.store.BaseRequest,
                  Code: 3,
                  FromUserName: this.store.storageClass.userName,
                  ToUserName: this.store.storageClass.userName,
                  ClientMsgId: Date.now(),
                  headers: {
                    cookie: this.store.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context7.next = 4;
                return (0, _Fetch["default"])(url, params);

              case 4:
                res = _context7.sent;
                returnValue = new _ReturnValueFormat["default"](res); // console.log(returnValue.value())

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
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
      _regenerator["default"].mark(function _callee8() {
        var now, url, params, res, contactList, chatroomList, otherList;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                now = Date.now();
                url = "".concat(this.store.loginUrl, "/webwxinit?r=").concat(Math.floor(-now / 1579), "&lang=zh_CN&pass_ticket=").concat(this.store.loginInfo.pass_ticket);
                params = {
                  BaseRequest: this.store.BaseRequest,
                  method: 'post',
                  headers: {
                    cookie: this.store.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context8.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context8.sent;
                this.store.loginInfo.syncKey = res.SyncKey;
                this.store.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
                  return item.Key + '_' + item.Val;
                }).join('|'); // utils.emoji_formatter(dic['User'], 'NickName')

                this.store.loginInfo['InviteStartCount'] = res.InviteStartCount;
                this.store.loginInfo['User'] = (0, _Templates.wrapUserDict)((0, _ConvertData.structFriendInfo)(res.User)).getValue();
                this.store.contactIns.memberList.push(this.store.loginInfo['User']);
                this.store.storageClass.userName = res.User.UserName;
                this.store.storageClass.nickName = res.User.NickName; // # deal with contact list returned when init

                contactList = res.ContactList || [], chatroomList = [], otherList = [];
                contactList.forEach(function (item) {
                  if (item.Sex !== 0) {
                    otherList.push(item);
                  } else if (item.UserName.indexOf('@@') !== -1) {
                    item.MemberList = []; // don't let dirty info pollute the list

                    chatroomList.push(item);
                  } else if (item.UserName.indexOf('@') !== -1) {
                    // # mp will be dealt in update_local_friends as well
                    otherList.push(item);
                  }
                });

              case 15:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
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
      _regenerator["default"].mark(function _callee10() {
        var _this3 = this;

        var userId;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.getUserId();

              case 2:
                userId = _context10.sent;
                this.drawQRImage(userId);
                this.loginWhileDoing = new _Utils.WhileDoing(
                /*#__PURE__*/
                (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee9() {
                  return _regenerator["default"].wrap(function _callee9$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          _context9.next = 2;
                          return _this3.checkUserLogin(userId);

                        case 2:
                        case "end":
                          return _context9.stop();
                      }
                    }
                  }, _callee9);
                })));
                this.loginWhileDoing.start();

              case 6:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function run() {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }]);
  return NodeWeChat;
}();

exports["default"] = NodeWeChat;

var convertRes = function convertRes(res) {
  if (res && res.body && res.body._readableState && res.body._readableState.buffer && res.body._readableState.buffer.head && res.body._readableState.buffer.head.data) {
    var buffer = new Buffer(res.body._readableState.buffer.head.data);
    return buffer.toString();
  } else {
    return null;
  }
};