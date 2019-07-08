var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fs = _interopRequireDefault(require("fs"));

var _Utils = require("./Utils");

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _ConvertData = require("./ConvertData");

/**
 * 处理message
 * messages types
 * 40 msg， 43 videochat, 50 VOIPMSG, 52 voipnotifymsg，53 webwxvoipnotifymsg, 9999 sysnotice
 */
var Message =
/*#__PURE__*/
function () {
  function Message(props) {
    (0, _classCallCheck2["default"])(this, Message);
    var on = props.on,
        emit = props.emit,
        getChatRoomInfo = props.getChatRoomInfo,
        updateChatRoomInfo = props.updateChatRoomInfo,
        getFriendInfo = props.getFriendInfo,
        getMpInfo = props.getMpInfo;
    this.on = on;
    this.emit = emit;
    this.getChatRoomInfo = getChatRoomInfo;
    this.updateChatRoomInfo = updateChatRoomInfo;
    this.getFriendInfo = getFriendInfo;
    this.getMpInfo = getMpInfo;
    this.typeArr = [40, 43, 50, 52, 53, 9999];
  }

  (0, _createClass2["default"])(Message, [{
    key: "produceGroupMsg",
    value: function () {
      var _produceGroupMsg = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(msg) {
        var reg, match, chatRoomUserName, actualUserName, msgContent, chatRoom, member, chatRoomSelfUserInfo, hasSpecialStr, atFlag;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                reg = '(@[0-9a-z]*?):<br/>(.*)$';
                match = (msg.Content || '').match(reg);
                chatRoomUserName = msg['FromUserName'];
                actualUserName = '';
                msgContent = msg['Content'];

                if (!match) {
                  _context.next = 11;
                  break;
                }

                actualUserName = match[1];
                msgContent = match[2];
                chatRoomUserName = msg['FromUserName'];
                _context.next = 21;
                break;

              case 11:
                if (!(msg['FromUserName'] === _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName)) {
                  _context.next = 16;
                  break;
                }

                actualUserName = _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName;
                chatRoomUserName = msg['ToUserName'];
                _context.next = 21;
                break;

              case 16:
                msg['ActualUserName'] = _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName;
                msg['ActualNickName'] = _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.NickName;
                msg['IsAt'] = false;
                (0, _Utils.msgFormatter)(msg, 'Content');
                return _context.abrupt("return");

              case 21:
                chatRoom = this.getChatRoomInfo(chatRoomUserName);
                member = (chatRoom.MemberList || []).find(function (i) {
                  return i.UserName === actualUserName;
                });

                if (member) {
                  _context.next = 28;
                  break;
                }

                _context.next = 26;
                return this.updateChatRoomInfo(chatRoomUserName);

              case 26:
                chatRoom = this.getChatRoomInfo(chatRoomUserName);
                member = (chatRoom.MemberList || []).find(function (i) {
                  return i.UserName === actualUserName;
                });

              case 28:
                if (!member) {
                  // logger.debug('chatroom member fetch failed with %s' % actualUserName);
                  console.log('chatroom member fetch failed with %s' % actualUserName);
                  msg['ActualNickName'] = '';
                  msg['IsAt'] = false;
                } else {
                  msg['ActualNickName'] = member['DisplayName'] || member['NickName'] || '';
                  chatRoomSelfUserInfo = chatRoom['Self'];
                  hasSpecialStr = msg.Content.indexOf("\u2005") !== -1;
                  atFlag = "@".concat(chatRoomSelfUserInfo['DisplayName'] || _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.NickName || '') + (hasSpecialStr ? "\u2005" : ' ');
                  msg['IsAt'] = msg.Content.indexOf(atFlag) !== -1;
                }

                msg['ActualUserName'] = actualUserName;
                msg['Content'] = msgContent;
                (0, _Utils.msgFormatter)(msg, 'Content');

              case 32:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function produceGroupMsg(_x) {
        return _produceGroupMsg.apply(this, arguments);
      }

      return produceGroupMsg;
    }()
  }, {
    key: "produceMsg",
    value: function produceMsg() {
      var _this = this;

      var msgList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      msgList.forEach(
      /*#__PURE__*/
      function () {
        var _ref = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee2(msg) {
          var messageType, msgInfo, reg, data, match, url, filename, downloadFileFn, _url, _filename, _downloadFileFn, _url2, _filename2, params;

          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  // get actual opposite
                  if (msg.FromUserName === _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName) {
                    msg.actualOpposite = msg.ToUserName;
                  } else {
                    msg.actualOpposite = msg.FromUserName;
                  }

                  messageType = _GlobalInfo["default"].EMIT_NAME.FRIEND; // produce basic message

                  if (!(msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1)) {
                    _context2.next = 8;
                    break;
                  }

                  messageType = _GlobalInfo["default"].EMIT_NAME.CHAT_ROOM;
                  _context2.next = 6;
                  return _this.produceGroupMsg(msg);

                case 6:
                  _context2.next = 9;
                  break;

                case 8:
                  (0, _Utils.msgFormatter)(msg, 'Content');

                case 9:
                  // set user of msg
                  if (msg.actualOpposite.indexOf('@@') !== -1 || ['filehelper', 'fmessage'].indexOf(msg.actualOpposite) !== -1) {
                    //群聊或者文件助手
                    msg['User'] = _this.getChatRoomInfo(msg.actualOpposite) || (0, _ConvertData.structFriendInfo)({
                      'UserName': msg.actualOpposite
                    });
                  } else {
                    //订阅号以及公众号
                    msg['User'] = _this.getMpInfo(msg.actualOpposite) || _this.getFriendInfo(msg.actualOpposite) || (0, _ConvertData.structFriendInfo)({
                      'UserName': msg.actualOpposite
                    });
                  } // 处理消息


                  msgInfo = {};

                  if (msg['MsgType'] === 1) {
                    // 可能为地图或者文本
                    if (!!msg['Url']) {
                      reg = /.+?\(.+?\)/;
                      data = 'Map';
                      match = (msg.Content || '').match(reg);

                      if (match) {
                        data = match[0];
                      }

                      msgInfo = {
                        Type: 'Map',
                        Text: data
                      };
                    } else {
                      msgInfo = {
                        Type: 'Text',
                        Text: msg['Content']
                      };
                    }
                  } else if (msg['MsgType'] === 3 || msg['MsgType'] === 47) {
                    //picture
                    url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetmsgimg");
                    filename = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + (msg['MsgType'] === 3 ? '.png' : '.gif');
                    downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                    msgInfo = {
                      Type: 'Picture',
                      FileName: filename,
                      Text: downloadFileFn
                    };
                  } else if (msg['MsgType'] === 34) {
                    //voice
                    _url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetvoice");
                    _filename = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + '.mp3';
                    _downloadFileFn = downloadFile(_url, msg['MsgId'], _filename);
                    msgInfo = {
                      Type: 'Recording',
                      FileName: _filename,
                      Text: _downloadFileFn
                    };
                  } else if (msg['MsgType'] === 37) {
                    //friends
                    msg['User']['UserName'] = msg['RecommendInfo']['UserName'];
                    msgInfo = {
                      Type: 'Friends',
                      Text: {
                        status: msg['Status'],
                        userName: msg['RecommendInfo']['UserName'],
                        verifyContent: msg['Ticket'],
                        autoUpdate: msg['RecommendInfo']
                      }
                    };
                    msg['User'].verifyDict = msgInfo['Text'];
                  } else if (msg['MsgType'] === 42) {
                    //name card
                    msgInfo = {
                      Type: 'Card',
                      Text: msg['RecommendInfo']
                    };
                  } else if ([43, 62].indexOf(msg['MsgType']) !== -1) {
                    //tiny video
                    _url2 = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetvideo");
                    _filename2 = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + '.mp4';
                    params = {
                      // msgid: msg['MsgId'],
                      // skey: GlobalInfo.LOGIN_INFO['skey'],
                      json: false,
                      // buffer: true,
                      headers: {
                        cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(_url2)),
                        'Range': 'bytes=0-'
                      }
                    }; // Fetch('https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgetvideo?msgid=6285823730356002963', params).then(fileData => {
                    //     const wstream = fs.createWriteStream('qqq');
                    //
                    //     wstream.on('open', () => {
                    //         const blockSize = 128;
                    //         const nbBlocks = Math.ceil(fileData.length / (blockSize));
                    //         for (let i = 0; i < nbBlocks; i += 1) {
                    //             const currentBlock = fileData.slice(
                    //                 blockSize * i,
                    //                 Math.min(blockSize * (i + 1), fileData.length),
                    //             );
                    //             wstream.write(currentBlock);
                    //         }
                    //
                    //         wstream.end();
                    //     });
                    //     wstream.on('error', (err) => { console.log('eeeeeeeeeeeeeeeeerrrrrrrrr',err) });
                    //     wstream.on('finish', () => { console.log('finish') });
                    //
                    //     console.log(fileData)
                    // });
                    //todo

                    msgInfo = {
                      Type: 'Video',
                      FileName: _filename2 // Text: downloadFileFn,

                    };
                  } else if (msg['MsgType'] === 49) {
                    //sharing
                    if (msg['AppMsgType'] === 0) {
                      //chat history
                      msgInfo = {
                        Type: 'Note',
                        Text: msg['Content']
                      };
                    } else if (msg['AppMsgType'] === 6) {}
                  }

                  console.log(msgInfo);

                  _this.reply(msg, messageType);

                case 14:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        return function (_x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "reply",
    value: function reply(msg, messageType) {
      var messageFrom = msg.actualOpposite;
      var retReply = {
        type: 'Text',
        text: msg['Content'],
        msgType: msg['MsgType']
      };

      if (messageType === _GlobalInfo["default"].EMIT_NAME.CHAT_ROOM) {
        retReply = (0, _objectSpread2["default"])({}, retReply, {
          isAt: msg['IsAt'],
          actualNickName: msg['ActualNickName']
        });
      }

      this.emit(messageType, retReply, messageFrom);
    }
  }]);
  return Message;
}();
/**
 * 返回一个下载函数，是否需要下载由用户决定
 * @param url
 * @param msgId
 * @param filename
 * @returns {function()}
 */


exports["default"] = Message;

var downloadFile = function downloadFile(url, msgId, filename) {
  return function () {
    var params = {
      msgid: msgId,
      skey: _GlobalInfo["default"].LOGIN_INFO['skey'],
      json: false,
      buffer: true,
      headers: {
        cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url)),
        'Content-Type': 'application/octet-stream'
      }
    };
    return new Promise(function (resolve) {
      (0, _Fetch["default"])(url, params).then(function (data) {
        _fs["default"].writeFile(filename, data, function (err) {
          if (err) {
            resolve('File Download Error!');
          } else {
            resolve('File Download Success!');
          }
        });
      });
    });
  };
};