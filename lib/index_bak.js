var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fastXmlParser = _interopRequireDefault(require("fast-xml-parser"));

var _Config = require("./Config");

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _Utils = require("./Utils");

var _nodeJsCookie = _interopRequireDefault(require("./node-js-cookie"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

var _ConvertData = require("./ConvertData");

var _Contact = _interopRequireDefault(require("./Contact"));

var _Templates = require("./Templates");

var _index = _interopRequireDefault(require("./index"));

/**
 * @time 2019/5/27
 */
var qrCode = require('./qrcode-terminal/index');

var self = {
  BaseRequest: {},
  loginInfo: {},
  storageClass: {},
  memberList: []
};

var convertRes = function convertRes(res) {
  if (res && res.body && res.body._readableState && res.body._readableState.buffer && res.body._readableState.buffer.head && res.body._readableState.buffer.head.data) {
    var buffer = new Buffer(res.body._readableState.buffer.head.data);
    return buffer.toString();
  } else {
    return null;
  }
};

var getUserId =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
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

  return function getUserId() {
    return _ref.apply(this, arguments);
  };
}();

var drawQRImage = function drawQRImage(uuid) {
  var url = 'https://login.weixin.qq.com/l/' + uuid;
  qrCode.generate(url);
  console.log('Please scan the QR code to log in.');
};

var processLoginInfo =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(resText) {
    var reg, match, redirectUrl, res, cookieArr, urlInfo, buffer, _ref5, ret, skey, wxsid, wxuin, pass_ticket;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            reg = 'window.redirect_uri="(\\S+)";';
            match = resText.match(reg);
            redirectUrl = match[1];
            self.redirectUrl = redirectUrl;
            self.loginUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
            _context2.next = 7;
            return (0, _Fetch["default"])(redirectUrl, {
              json: false,
              redirect: 'manual'
            });

          case 7:
            res = _context2.sent;
            cookieArr = (res.headers.raw() || {})['set-cookie'];
            self.cookies = new _nodeJsCookie["default"](cookieArr);
            urlInfo = [["wx2.qq.com", ["file.wx2.qq.com", "webpush.wx2.qq.com"]], ["wx8.qq.com", ["file.wx8.qq.com", "webpush.wx8.qq.com"]], ["qq.com", ["file.wx.qq.com", "webpush.wx.qq.com"]], ["web2.wechat.com", ["file.web2.wechat.com", "webpush.web2.wechat.com"]], ["wechat.com", ["file.web.wechat.com", "webpush.web.wechat.com"]]];
            self.loginInfo['deviceid'] = 'e' + (Math.random() + '').substring(2, 17);
            self.loginInfo['logintime'] = Date.now();
            urlInfo.forEach(function (_ref3) {
              var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
                  indexUrl = _ref4[0],
                  _ref4$ = (0, _slicedToArray2["default"])(_ref4[1], 2),
                  fileUrl = _ref4$[0],
                  syncUrl = _ref4$[1];

              if (self.loginUrl.indexOf(indexUrl) !== -1) {
                self.loginInfo['fileUrl'] = fileUrl;
                self.loginInfo['syncUrl'] = syncUrl;
              } else {
                self.loginInfo['fileUrl'] = self.loginInfo['syncUrl'] = self.loginUrl;
              }
            });
            buffer = new Buffer(res.body._buffer).toString();
            _ref5 = (_fastXmlParser["default"].parse(buffer) || {}).error || {}, ret = _ref5.ret, skey = _ref5.skey, wxsid = _ref5.wxsid, wxuin = _ref5.wxuin, pass_ticket = _ref5.pass_ticket;

            if (!(ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket)) {
              _context2.next = 32;
              break;
            }

            self.loginInfo.skey = self.BaseRequest.Skey = skey;
            self.loginInfo.wxsid = self.BaseRequest.Sid = wxsid;
            self.loginInfo.wxuin = self.BaseRequest.Uin = wxuin;
            self.loginInfo.pass_ticket = pass_ticket;
            self.BaseRequest.DeviceID = self.loginInfo['deviceid'];
            self.contactIns = new _Contact["default"](self);
            _context2.next = 25;
            return webInit();

          case 25:
            _context2.next = 27;
            return showMobileLogin();

          case 27:
            _context2.next = 29;
            return self.contactIns.getContact(true);

          case 29:
            startReceiving();
            _context2.next = 33;
            break;

          case 32:
            console.log("Your wechat account may be LIMITED to log in WEB wechat, error info:".concat(buffer));

          case 33:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function processLoginInfo(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var checkUserLogin =
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(userId) {
    var now, url, params, res, bufferText, reg, match, status;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
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
            _context3.next = 5;
            return (0, _Fetch["default"])(url, params);

          case 5:
            res = _context3.sent;
            bufferText = convertRes(res);
            reg = 'window.code=(\\d+);';
            match = bufferText.match(reg);

            if (!match) {
              _context3.next = 21;
              break;
            }

            status = +match[1];

            if (!(status === 200)) {
              _context3.next = 18;
              break;
            }

            self.isLogin = true;
            /***清除循环***/

            self.loginWhileDoing.end();
            /***清除循环***/

            _context3.next = 16;
            return processLoginInfo(bufferText);

          case 16:
            _context3.next = 19;
            break;

          case 18:
            if (status === 201) {
              console.log('Please press confirm on your phone.');
            }

          case 19:
            _context3.next = 22;
            break;

          case 21:
            throw new Error('获取登录信息失败！');

          case 22:
            return _context3.abrupt("return", res);

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function checkUserLogin(_x2) {
    return _ref6.apply(this, arguments);
  };
}();

var webInit =
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee4() {
    var now, url, params, res, contactList, chatroomList, otherList;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            now = Date.now();
            url = "".concat(self.loginUrl, "/webwxinit?r=").concat(Math.floor(-now / 1579), "&lang=zh_CN&pass_ticket=").concat(self.loginInfo.pass_ticket);
            params = {
              BaseRequest: self.BaseRequest,
              method: 'post',
              headers: {
                cookie: self.cookies.getAll((0, _Utils.getUrlDomain)(url))
              }
            };
            _context4.next = 5;
            return (0, _Fetch["default"])(url, params);

          case 5:
            res = _context4.sent;
            self.loginInfo.syncKey = res.SyncKey;
            self.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
              return item.Key + '_' + item.Val;
            }).join('|'); // utils.emoji_formatter(dic['User'], 'NickName')

            self.loginInfo['InviteStartCount'] = res.InviteStartCount;
            self.loginInfo['User'] = (0, _Templates.wrapUserDict)((0, _ConvertData.structFriendInfo)(res.User)).getValue();
            self.contactIns.memberList.push(self.loginInfo['User']);
            self.storageClass.userName = res.User.UserName;
            self.storageClass.nickName = res.User.NickName; // # deal with contact list returned when init

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
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function webInit() {
    return _ref7.apply(this, arguments);
  };
}();

var showMobileLogin =
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee5() {
    var url, params, res, returnValue;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            url = "".concat(self.loginUrl, "/webwxstatusnotify?lang=zh_CN&pass_ticket=").concat(self.loginInfo.pass_ticket);
            params = {
              method: 'post',
              BaseRequest: self.BaseRequest,
              Code: 3,
              FromUserName: self.storageClass.userName,
              ToUserName: self.storageClass.userName,
              ClientMsgId: Date.now(),
              headers: {
                cookie: self.cookies.getAll((0, _Utils.getUrlDomain)(url))
              }
            };
            _context5.next = 4;
            return (0, _Fetch["default"])(url, params);

          case 4:
            res = _context5.sent;
            returnValue = new _ReturnValueFormat["default"](res); // console.log(returnValue.value())

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function showMobileLogin() {
    return _ref8.apply(this, arguments);
  };
}();

var startReceiving = function startReceiving(exitCallback) {
  var doingFn =
  /*#__PURE__*/
  function () {
    var _ref9 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee6() {
      var selector, _ref10, msgList, contactList;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return syncCheck();

            case 2:
              selector = _context6.sent;
              console.log('selector: ' + selector);

              if (!(+selector === 0)) {
                _context6.next = 6;
                break;
              }

              return _context6.abrupt("return");

            case 6:
              _context6.next = 8;
              return getMsg();

            case 8:
              _ref10 = _context6.sent;
              msgList = _ref10.msgList;
              contactList = _ref10.contactList;
              console.log(msgList[0].Content, '\n=====================================');
              (0, _Utils.msgFormatter)(msgList[0], 'Content');
              console.log(msgList[0].Content);

            case 14:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function doingFn() {
      return _ref9.apply(this, arguments);
    };
  }();

  self.getMsgWhileDoing = new _Utils.WhileDoing(doingFn, 3000);
  self.getMsgWhileDoing.start();
};

var syncCheck =
/*#__PURE__*/
function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee7() {
    var url, params, res, bufferText, reg, match;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            url = "".concat(self.loginInfo['syncUrl'] || self.loginUrl, "/synccheck");
            params = {
              r: Date.now(),
              skey: self.loginInfo['skey'],
              sid: self.loginInfo['wxsid'],
              uin: self.loginInfo['wxuin'],
              deviceid: self.loginInfo['deviceid'],
              synckey: self.loginInfo.syncKeyStr,
              _: self.loginInfo['logintime'],
              json: false,
              headers: {
                cookie: self.cookies.getAll((0, _Utils.getUrlDomain)(url))
              }
            };
            self.loginInfo['logintime'] += 1;
            _context7.next = 5;
            return (0, _Fetch["default"])(url, params);

          case 5:
            res = _context7.sent;
            bufferText = convertRes(res);
            reg = 'window.synccheck={retcode:"(\\d+)",selector:"(\\d+)"}';
            match = bufferText.match(reg);

            if (!(!match || +match[1] !== 0)) {
              _context7.next = 11;
              break;
            }

            throw new Error('Unexpected sync check result: ' + bufferText);

          case 11:
            return _context7.abrupt("return", match[2]);

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function syncCheck() {
    return _ref11.apply(this, arguments);
  };
}();

var getMsg =
/*#__PURE__*/
function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee8() {
    var url, params, res, cookieArr;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            console.log('getmsg');
            url = "".concat(self.loginUrl, "/webwxsync?sid=").concat(self.loginInfo.wxsid, "&skey=").concat(self.loginInfo.skey, "&pass_ticket=").concat(self.loginInfo.pass_ticket);
            params = {
              BaseRequest: self.BaseRequest,
              method: 'post',
              json: false,
              //为了拿headers更新cookie
              SyncKey: self.loginInfo.syncKey,
              rr: ~Date.now(),
              headers: {
                cookie: self.cookies.getAll((0, _Utils.getUrlDomain)(url))
              }
            };
            _context8.next = 5;
            return (0, _Fetch["default"])(url, params);

          case 5:
            res = _context8.sent;
            //更新cookie
            cookieArr = (res.headers.raw() || {})['set-cookie'];
            self.cookies.updateCookies(cookieArr);
            _context8.next = 10;
            return (0, _Fetch.toJSON)(res);

          case 10:
            res = _context8.sent;

            if (!(res.BaseResponse.Ret !== 0)) {
              _context8.next = 13;
              break;
            }

            return _context8.abrupt("return");

          case 13:
            self.loginInfo.syncKey = res.SyncKey;
            self.loginInfo.syncKeyStr = (res.SyncKey.List || []).map(function (item) {
              return item.Key + '_' + item.Val;
            }).join('|');
            return _context8.abrupt("return", {
              msgList: res.AddMsgList,
              contactList: res.ModContactList
            });

          case 16:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function getMsg() {
    return _ref12.apply(this, arguments);
  };
}();

var fn =
/*#__PURE__*/
function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee10() {
    var userId;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return getUserId();

          case 2:
            userId = _context10.sent;
            console.log(userId);
            drawQRImage(userId);
            self.loginWhileDoing = new _Utils.WhileDoing(
            /*#__PURE__*/
            (0, _asyncToGenerator2["default"])(
            /*#__PURE__*/
            _regenerator["default"].mark(function _callee9() {
              return _regenerator["default"].wrap(function _callee9$(_context9) {
                while (1) {
                  switch (_context9.prev = _context9.next) {
                    case 0:
                      _context9.next = 2;
                      return checkUserLogin(userId);

                    case 2:
                    case "end":
                      return _context9.stop();
                  }
                }
              }, _callee9);
            })));
            self.loginWhileDoing.start();

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function fn() {
    return _ref13.apply(this, arguments);
  };
}(); // fn()


var NodeWeChatIns = new _index["default"]();
NodeWeChatIns.run();