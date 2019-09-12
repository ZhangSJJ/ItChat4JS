var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadFile = exports.prepareFile = exports.revokeMsg = exports.transmitMsg = exports.sendVideo = exports.sendImage = exports.sendFile = exports.sendTextMsg = exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _crypto = _interopRequireDefault(require("crypto"));

var _formData = _interopRequireDefault(require("form-data"));

var _mimeTypes = _interopRequireDefault(require("mime-types"));

var _Utils = require("./Utils");

var _Fetch = _interopRequireDefault(require("./Fetch"));

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _ConvertData = require("./ConvertData");

var _Log = require("./Log");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var FILENAME_WITH_NO_DIR = 'TEMP-FILENAME';
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
        getMpInfo = props.getMpInfo,
        updateLocalUin = props.updateLocalUin;
    this.on = on;
    this.emit = emit;
    this.getChatRoomInfo = getChatRoomInfo;
    this.updateChatRoomInfo = updateChatRoomInfo;
    this.getFriendInfo = getFriendInfo;
    this.getMpInfo = getMpInfo;
    this.updateLocalUin = updateLocalUin;
    this.uselessMsgType = [40, 43, 50, 52, 53, 9999];
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
                reg = /(@[0-9a-z]*?):<br\/>(.*)$/;
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
                chatRoom = this.getChatRoomInfo(chatRoomUserName) || {};
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
                chatRoom = this.getChatRoomInfo(chatRoomUserName) || {};
                member = (chatRoom.MemberList || []).find(function (i) {
                  return i.UserName === actualUserName;
                });

              case 28:
                if (!member) {
                  (0, _Log.LogInfo)('Chat Room Member Fetch Failed With ' + actualUserName);
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
          var defaultUseInfo, msgInfo, reg, data, match, url, filename, downloadFileFn, _url, _filename, _downloadFileFn, _url2, _filename2, _downloadFileFn2, _url3, _filename3, _downloadFileFn3, _url4, _filename4, _downloadFileFn4, _reg, _match, text, _reg2, _match2, _text;

          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  // get actual opposite
                  if (msg.FromUserName === _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName) {
                    msg.actualOpposite = msg.ToUserName;
                  } else {
                    msg.actualOpposite = msg.FromUserName;
                  } // produce basic message


                  if (!(msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1)) {
                    _context2.next = 6;
                    break;
                  }

                  _context2.next = 4;
                  return _this.produceGroupMsg(msg);

                case 4:
                  _context2.next = 7;
                  break;

                case 6:
                  (0, _Utils.msgFormatter)(msg, 'Content');

                case 7:
                  // set user of msg
                  defaultUseInfo = (0, _ConvertData.structFriendInfo)({
                    'UserName': msg.actualOpposite
                  });

                  if (msg.actualOpposite.indexOf('@@') !== -1) {
                    //群聊
                    defaultUseInfo.myDefinedUserType = _GlobalInfo["default"].EMIT_NAME.CHAT_ROOM;
                    msg['User'] = _this.getChatRoomInfo(msg.actualOpposite) || defaultUseInfo;
                  } else if (['filehelper', 'fmessage'].indexOf(msg.actualOpposite) !== -1) {
                    //文件助手等
                    defaultUseInfo.myDefinedUserType = _GlobalInfo["default"].EMIT_NAME.FRIEND;
                    msg['User'] = defaultUseInfo;
                  } else {
                    //订阅号以及公众号
                    defaultUseInfo.myDefinedUserType = _GlobalInfo["default"].EMIT_NAME.FRIEND;
                    msg['User'] = _this.getMpInfo(msg.actualOpposite) || _this.getFriendInfo(msg.actualOpposite) || defaultUseInfo;
                  } // 处理消息


                  msgInfo = {};

                  if (msg['MsgType'] === 1) {
                    // 可能为地图或者文本
                    if (!!msg['Url']) {
                      reg = /(.+?\(.+?\))/;
                      data = 'Map';
                      match = (msg.Content || '').match(reg);

                      if (match && match[1]) {
                        data = match[1];
                      }

                      msgInfo = {
                        Type: 'Map',
                        Text: data
                      };
                      (0, _Log.LogInfo)('Map...');
                    } else {
                      msgInfo = {
                        Type: 'Text',
                        Text: msg['Content']
                      };
                      (0, _Log.LogInfo)('Text...');
                    }
                  } else if (msg['MsgType'] === 3 || msg['MsgType'] === 47) {
                    //picture
                    url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetmsgimg");
                    filename = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + (msg['MsgType'] === 3 ? '.png' : '.gif');
                    downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                    msgInfo = {
                      Type: 'Picture',
                      FileName: filename,
                      Download: downloadFileFn
                    };
                    (0, _Log.LogInfo)('Picture...111'); //todo .gif download failed
                  } else if (msg['MsgType'] === 34) {
                    //voice
                    _url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetvoice");
                    _filename = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + '.mp3';
                    _downloadFileFn = downloadFile(_url, msg['MsgId'], _filename);
                    msgInfo = {
                      Type: 'Recording',
                      FileName: _filename,
                      Download: _downloadFileFn
                    };
                    (0, _Log.LogInfo)('Voice...');
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
                    (0, _Log.LogInfo)('Add Friend Apply...');
                  } else if (msg['MsgType'] === 42) {
                    //name card
                    msgInfo = {
                      Type: 'Card',
                      Text: msg['RecommendInfo']
                    };
                    (0, _Log.LogInfo)('Name Card...');
                  } else if ([43, 62].indexOf(msg['MsgType']) !== -1) {
                    //tiny video
                    _url2 = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetvideo");
                    _filename2 = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + '.mp4';
                    _downloadFileFn2 = downloadFile(_url2, msg['MsgId'], _filename2, true);
                    msgInfo = {
                      Type: 'Video',
                      FileName: _filename2,
                      Download: _downloadFileFn2
                    };
                    (0, _Log.LogInfo)('Video...');
                  } else if (msg['MsgType'] === 49) {
                    //sharing
                    if (msg['AppMsgType'] === 0) {
                      //chat history
                      msgInfo = {
                        Type: 'Note',
                        Text: msg['Content']
                      };
                      (0, _Log.LogInfo)('Chat History...');
                    } else if (msg['AppMsgType'] === 6) {
                      _url3 = "".concat(_GlobalInfo["default"].LOGIN_INFO.fileUrl, "/webwxgetmedia");
                      _filename3 = msg.FileName || (0, _Utils.convertDate)().replace(/-|:|\s/g, '');
                      _downloadFileFn3 = downloadAttachment(_url3, msg, _filename3);
                      msgInfo = {
                        Type: 'Attachment',
                        FileName: _filename3,
                        Download: _downloadFileFn3
                      };
                      (0, _Log.LogInfo)('Attachment...');
                    } else if (msg['AppMsgType'] === 8) {
                      _url4 = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetmsgimg");
                      _filename4 = (0, _Utils.convertDate)().replace(/-|:|\s/g, '') + '.gif';
                      _downloadFileFn4 = downloadFile(_url4, msg['MsgId'], _filename4);
                      msgInfo = {
                        Type: 'Picture',
                        FileName: _filename4,
                        Download: _downloadFileFn4
                      };
                      (0, _Log.LogInfo)('Picture...222');
                    } else if (msg['AppMsgType'] === 17) {
                      msgInfo = {
                        Type: 'Note',
                        FileName: msg['FileName']
                      };
                      (0, _Log.LogInfo)('Note...');
                    } else if (msg['AppMsgType'] === 2000) {
                      _reg = '\[CDATA\[(.+?)\][\s\S]+?\[CDATA\[(.+?)\]';
                      _match = (msg.Content || '').match(_reg);
                      text = 'You may found detailed info in Content key.';

                      if (_match && _match[2]) {
                        text = _match[2].split("\u3002")[0];
                      }

                      msgInfo = {
                        Type: 'Note',
                        Text: text
                      };
                      (0, _Log.LogInfo)('Note...');
                    } else {
                      msgInfo = {
                        Type: 'Sharing',
                        Text: msg['FileName']
                      };
                    }
                  } else if (msg['MsgType'] === 51) {
                    //phone init
                    msgInfo = _this.updateLocalUin(msg);
                  } else if (msg['MsgType'] === 10000) {
                    msgInfo = {
                      Type: 'Note',
                      Text: msg['Content']
                    };
                  } else if (msg['MsgType'] === 10002) {
                    _reg2 = '\[CDATA\[(.+?)\]\]';
                    _match2 = (msg.Content || '').match(_reg2);
                    _text = 'System message';

                    if (_match2 && _match2[1]) {
                      _text = _match2[1].replace('\\', '');
                    }

                    msgInfo = {
                      Type: 'Note',
                      Text: _text
                    };
                  } else if (_this.uselessMsgType.indexOf(msg['MsgType']) !== -1) {
                    msgInfo = {
                      Type: 'Useless',
                      Text: 'UselessMsg'
                    };
                  } else {
                    (0, _Log.LogInfo)("Useless message received:".concat(msg['MsgType'], "\n").concat(JSON.stringify(msg)));
                    msgInfo = {
                      Type: 'Useless',
                      Text: 'UselessMsg'
                    };
                  }

                  msg = _objectSpread({}, msg, {}, msgInfo);

                  _this.reply(msg); // LogInfo(msg['User'].myDefinedUserType + ',' + msg['MsgType'] + ',' + JSON.stringify(msgInfo))


                case 13:
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
    value: function reply(msg) {
      var messageFrom = msg.actualOpposite;
      var emitName = msg['User'].myDefinedUserType;
      var retReply = {
        type: msg['Type'],
        text: msg['Text'],
        filename: msg['FileName'],
        download: msg['Download'],
        content: msg['Content'],
        oriContent: msg['OriContent']
      };

      if (emitName === _GlobalInfo["default"].EMIT_NAME.CHAT_ROOM) {
        retReply = _objectSpread({}, retReply, {
          isAt: msg['IsAt'],
          actualNickName: msg['ActualNickName']
        });
      }

      emitName && this.emit(emitName, retReply, msg['User'] || {
        UserName: messageFrom
      });
    }
  }]);
  return Message;
}();
/**
 * 返回一个下载函数，是否需要下载由用户决定
 * @param url
 * @param msgId
 * @param filename
 * @param isVideo
 * @returns {function(*=)}
 */


exports["default"] = Message;

var downloadFile = function downloadFile(url, msgId, filename) {
  var isVideo = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return function (path, name) {
    var buffer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    path = path || '';
    name = name || filename;
    var params = {
      msgid: msgId,
      skey: _GlobalInfo["default"].LOGIN_INFO['skey'],
      json: false,
      buffer: true,
      headers: {
        cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
      }
    };
    params.headers['Content-Type'] = 'application/octet-stream';

    if (isVideo) {
      params.headers['Range'] = 'bytes=0-';
    }

    var realPath = makeDirs(path);
    return new Promise(function (resolve) {
      (0, _Fetch["default"])(url, params).then(function (data) {
        if (buffer) {
          if (data instanceof Uint8Array) {
            data = Buffer.from(data);
          }

          resolve(data);
          return;
        }

        _fs["default"].writeFile(realPath + name, data, function (err) {
          if (err) {
            (0, _Log.LogError)('File Download Error:' + err);
            resolve('File Download Error!');
          } else {
            resolve('File Download Success!');
          }
        });
      });
    });
  };
};

var downloadAttachment = function downloadAttachment(url, msg, filename) {
  return function (path, name) {
    var buffer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    path = path || '';
    name = name || filename;

    var webwxDataTicket = _GlobalInfo["default"].LOGIN_INFO.cookies.getValue('webwx_data_ticket', (0, _Utils.getUrlDomain)(url));

    var params = {
      sender: msg['FromUserName'],
      mediaid: msg['MediaId'],
      filename: msg['FileName'],
      fromuser: _GlobalInfo["default"].LOGIN_INFO['wxuin'],
      pass_ticket: 'undefined',
      webwx_data_ticket: webwxDataTicket,
      json: false,
      buffer: true,
      headers: {
        cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url)),
        'Content-Type': 'application/octet-stream'
      }
    };
    var realPath = makeDirs(path);
    return new Promise(function (resolve) {
      (0, _Fetch["default"])(url, params).then(function (data) {
        if (buffer) {
          if (data instanceof Uint8Array) {
            data = Buffer.from(data);
          }

          resolve(data);
          return;
        }

        _fs["default"].writeFile(realPath + name, data, function (err) {
          if (err) {
            (0, _Log.LogError)('File Download Error:' + err);
            resolve('File Download Error!');
          } else {
            resolve('File Download Success!');
          }
        });
      });
    });
  };
};

var makeDirs = function makeDirs(pathStr) {
  if (!pathStr) {
    return '';
  }

  var sep = _path["default"].sep;
  pathStr = _path["default"].dirname(pathStr + sep + 'dir'); //解决path.dirname('aa/bb/cc')和path.dirname('aa/bb/cc/')都返回aa/bb/
  //path.dirname('aa/bb/cc')和path.dirname('aa/bb/cc/')--->aa/bb/cc 或 aa/bb/cc/

  var pathTemp = '';
  pathStr.split(/[/\\]/).forEach(function (dirName) {
    if (!dirName) {
      return;
    }

    if (pathTemp) {
      pathTemp = _path["default"].join(pathTemp, dirName);
    } else {
      pathTemp = dirName;
    }

    if (!_fs["default"].existsSync(pathTemp)) {
      _fs["default"].mkdirSync(pathTemp);
    }
  });

  var isAbsolute = _path["default"].isAbsolute(pathStr);

  return (isAbsolute ? sep : '') + pathTemp + sep;
};

var sendMsg =
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(_ref2) {
    var url, msgType, content, _ref2$toUserName, toUserName, mediaId, params, res;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            url = _ref2.url, msgType = _ref2.msgType, content = _ref2.content, _ref2$toUserName = _ref2.toUserName, toUserName = _ref2$toUserName === void 0 ? 'filehelper' : _ref2$toUserName, mediaId = _ref2.mediaId;
            params = {
              method: 'post',
              BaseRequest: _objectSpread({}, _GlobalInfo["default"].BaseRequest, {
                DeviceID: 'e' + (Math.random() + '').substring(2, 17)
              }),
              Msg: {
                Type: msgType,
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

            if (!!content) {
              params.Msg.Content = content;
            }

            if (!!mediaId) {
              params.Msg.MediaId = mediaId;
            }

            _context3.next = 6;
            return (0, _Fetch["default"])(url, params);

          case 6:
            res = _context3.sent;
            (0, _Log.LogInfo)(res);
            return _context3.abrupt("return", res);

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function sendMsg(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var sendTextMsg =
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee4(msg, toUserName) {
    var url;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendmsg");
            (0, _Log.LogInfo)('Request to send a text message to ' + toUserName + ': ' + msg);
            _context4.next = 4;
            return sendMsg({
              url: url,
              msgType: 1,
              content: msg,
              toUserName: toUserName
            });

          case 4:
            return _context4.abrupt("return", _context4.sent);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function sendTextMsg(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

exports.sendTextMsg = sendTextMsg;

var sendFile =
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee5(fileDir) {
    var toUserName,
        mediaId,
        streamInfo,
        fileReadStream,
        filename,
        extName,
        preparedFile,
        fileSize,
        uploadRes,
        url,
        content,
        _args5 = arguments;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            toUserName = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : 'filehelper';
            mediaId = _args5.length > 2 ? _args5[2] : undefined;
            streamInfo = _args5.length > 3 && _args5[3] !== undefined ? _args5[3] : {};
            (0, _Log.LogInfo)("Request to send a file(mediaId: ".concat(mediaId, ") to ").concat(toUserName, ": ").concat(fileDir));
            fileReadStream = streamInfo.fileReadStream, filename = streamInfo.filename, extName = streamInfo.extName;
            _context5.next = 7;
            return prepareFile(fileDir, fileReadStream);

          case 7:
            preparedFile = _context5.sent;

            if (preparedFile) {
              _context5.next = 11;
              break;
            }

            (0, _Log.LogError)('File Analysis Failed...');
            return _context5.abrupt("return");

          case 11:
            fileSize = preparedFile.fileSize;

            if (mediaId) {
              _context5.next = 20;
              break;
            }

            _context5.next = 15;
            return uploadFile({
              fileDir: fileDir,
              toUserName: toUserName,
              preparedFile: preparedFile
            });

          case 15:
            uploadRes = _context5.sent;

            if (!(!uploadRes.BaseResponse || uploadRes.BaseResponse.Ret !== 0 || !uploadRes['MediaId'])) {
              _context5.next = 19;
              break;
            }

            (0, _Log.LogError)("Request to upload a file: ".concat(fileDir, " failed"));
            return _context5.abrupt("return");

          case 19:
            mediaId = uploadRes['MediaId'];

          case 20:
            url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendappmsg?fun=async&f=json");
            extName = (extName || '').slice(1);

            if (!!fileDir) {
              filename = _path["default"].basename(fileDir);
              extName = _path["default"].extname(fileDir).slice(1);
            }

            content = "<appmsg appid='wxeb7ec651dd0aefa9' sdkver=''><title>".concat(filename, "</title><des></des><action></action><type>6</type><content></content><url></url><lowurl></lowurl><appattach><totallen>").concat(fileSize, "</totallen><attachid>").concat(mediaId, "</attachid><fileext>").concat(extName, "</fileext></appattach><extinfo></extinfo></appmsg>");
            _context5.next = 26;
            return sendMsg({
              url: url,
              msgType: 6,
              content: content,
              toUserName: toUserName,
              mediaId: mediaId
            });

          case 26:
            return _context5.abrupt("return", _context5.sent);

          case 27:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function sendFile(_x6) {
    return _ref5.apply(this, arguments);
  };
}();

exports.sendFile = sendFile;

var sendImage =
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee6(fileDir) {
    var toUserName,
        mediaId,
        streamInfo,
        fileReadStream,
        extName,
        preparedFile,
        isGif,
        uploadRes,
        url,
        _args6 = arguments;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            toUserName = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : 'filehelper';
            mediaId = _args6.length > 2 ? _args6[2] : undefined;
            streamInfo = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : {};
            (0, _Log.LogInfo)("Request to send a image(mediaId: ".concat(mediaId, ") to ").concat(toUserName, ": ").concat(fileDir));
            fileReadStream = streamInfo.fileReadStream, extName = streamInfo.extName;
            _context6.next = 7;
            return prepareFile(fileDir, fileReadStream);

          case 7:
            preparedFile = _context6.sent;

            if (preparedFile) {
              _context6.next = 11;
              break;
            }

            (0, _Log.LogError)('File Analysis Failed...');
            return _context6.abrupt("return");

          case 11:
            if (mediaId) {
              _context6.next = 20;
              break;
            }

            isGif = extName === '.gif' || fileDir && _path["default"].extname(fileDir) === '.gif';
            _context6.next = 15;
            return uploadFile({
              fileDir: fileDir,
              toUserName: toUserName,
              isPicture: !isGif,
              preparedFile: preparedFile
            });

          case 15:
            uploadRes = _context6.sent;

            if (!(!uploadRes.BaseResponse || uploadRes.BaseResponse.Ret !== 0 || !uploadRes['MediaId'])) {
              _context6.next = 19;
              break;
            }

            (0, _Log.LogError)("Request to upload a image: ".concat(fileDir, " failed"));
            return _context6.abrupt("return");

          case 19:
            mediaId = uploadRes['MediaId'];

          case 20:
            url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendmsgimg?fun=async&f=json");
            _context6.next = 23;
            return sendMsg({
              url: url,
              msgType: 3,
              toUserName: toUserName,
              mediaId: mediaId
            });

          case 23:
            return _context6.abrupt("return", _context6.sent);

          case 24:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function sendImage(_x7) {
    return _ref6.apply(this, arguments);
  };
}();

exports.sendImage = sendImage;

var sendVideo =
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee7(fileDir) {
    var toUserName,
        mediaId,
        streamInfo,
        fileReadStream,
        preparedFile,
        uploadRes,
        url,
        _args7 = arguments;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            toUserName = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : 'filehelper';
            mediaId = _args7.length > 2 ? _args7[2] : undefined;
            streamInfo = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : {};
            (0, _Log.LogInfo)("Request to send a video(mediaId: ".concat(mediaId, ") to ").concat(toUserName, ": ").concat(fileDir));
            fileReadStream = streamInfo.fileReadStream;
            _context7.next = 7;
            return prepareFile(fileDir, fileReadStream);

          case 7:
            preparedFile = _context7.sent;

            if (preparedFile) {
              _context7.next = 11;
              break;
            }

            (0, _Log.LogError)('File Analysis Failed...');
            return _context7.abrupt("return");

          case 11:
            if (mediaId) {
              _context7.next = 19;
              break;
            }

            _context7.next = 14;
            return uploadFile({
              fileDir: fileDir,
              toUserName: toUserName,
              isVideo: true,
              preparedFile: preparedFile
            });

          case 14:
            uploadRes = _context7.sent;

            if (!(!uploadRes.BaseResponse || uploadRes.BaseResponse.Ret !== 0 || !uploadRes['MediaId'])) {
              _context7.next = 18;
              break;
            }

            (0, _Log.LogError)("Request to upload a video: ".concat(fileDir, " failed"));
            return _context7.abrupt("return");

          case 18:
            mediaId = uploadRes['MediaId'];

          case 19:
            url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendvideomsg?fun=async&f=json&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
            _context7.next = 22;
            return sendMsg({
              url: url,
              msgType: 43,
              toUserName: toUserName,
              mediaId: mediaId
            });

          case 22:
            return _context7.abrupt("return", _context7.sent);

          case 23:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function sendVideo(_x8) {
    return _ref7.apply(this, arguments);
  };
}();
/**
 * 转发消息(网页版只支持文本，图片，视频)
 * @param content
 * @param msgType
 * @param toUserName
 * @returns {Promise<*>}
 */


exports.sendVideo = sendVideo;

var transmitMsg =
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee8(content, msgType, toUserName) {
    var url, type;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendmsg");

            if (msgType === _GlobalInfo["default"].MESSAGE_TYPE.TEXT) {
              type = 1;
            } else if (msgType === _GlobalInfo["default"].MESSAGE_TYPE.PICTURE) {
              url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendmsgimg?fun=async&f=json");
              type = 3;
            } else if (msgType === _GlobalInfo["default"].MESSAGE_TYPE.VIDEO) {
              url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxsendvideomsg?fun=async&f=json&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
              type = 43;
            } else if (msgType === _GlobalInfo["default"].MESSAGE_TYPE.MAP) {
              type = 48;
            }

            if (!(!!url && !!type)) {
              _context8.next = 4;
              break;
            }

            return _context8.abrupt("return", sendMsg({
              url: url,
              msgType: type,
              content: content,
              toUserName: toUserName
            }));

          case 4:
            return _context8.abrupt("return", Promise.resolve().then(function () {
              return {
                BaseResponse: {
                  Ret: -1
                }
              };
            }));

          case 5:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function transmitMsg(_x9, _x10, _x11) {
    return _ref8.apply(this, arguments);
  };
}();

exports.transmitMsg = transmitMsg;

var revokeMsg =
/*#__PURE__*/
function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee9(msgId, toUserName, localId) {
    var url, params, res;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxrevokemsg");
            params = {
              method: 'post',
              BaseRequest: _GlobalInfo["default"].BaseRequest,
              ClientMsgId: localId || Date.now() + '',
              SvrMsgId: msgId,
              ToUserName: toUserName,
              headers: {
                cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
              }
            };
            _context9.next = 4;
            return (0, _Fetch["default"])(url, params);

          case 4:
            res = _context9.sent;
            (0, _Log.LogInfo)(res);
            return _context9.abrupt("return", res);

          case 7:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function revokeMsg(_x12, _x13, _x14) {
    return _ref9.apply(this, arguments);
  };
}();
/**
 * 解析文件，获得文件MD5，buffer，fileSize
 * @param fileDir
 * @param fileStream
 * @returns {Promise}
 */


exports.revokeMsg = revokeMsg;

var prepareFile = function prepareFile(fileDir, fileStream) {
  return new Promise(function (resolve) {
    if (!fileDir && !fileStream) {
      resolve(null);
    }

    var md5sum = _crypto["default"].createHash('md5');

    var stream = fileStream || _fs["default"].createReadStream(fileDir);

    var handleData = function handleData(buffer) {
      var fileSize = buffer.length;
      var chunks = Math.floor((fileSize - 1) / 524288) + 1;
      var bufferArr = Array.from({
        length: chunks
      }).map(function (v, index) {
        return buffer.slice(index * 524288, (index + 1) * 524288);
      });
      md5sum.update(buffer.toString());
      var fileMd5 = md5sum.digest('hex');
      return {
        fileMd5: fileMd5,
        bufferArr: bufferArr,
        fileSize: fileSize
      };
    };

    if (fileStream instanceof Uint8Array) {
      var buffer = Buffer.from(fileStream);
      resolve(handleData(buffer));
      return;
    }

    var bufferArr = [];
    stream.on('data', function (chunk) {
      bufferArr.push(chunk);
    });
    stream.on('end', function () {
      var buffer = Buffer.concat(bufferArr);
      resolve(handleData(buffer));
    });
    stream.on('err', function (err) {
      (0, _Log.LogError)('解析文件发生异常:' + err);
      resolve(null);
    });
  });
};
/**
 * @param fileDir
 * @param isPicture
 * @param isVideo
 * @param toUserName
 * @param preparedFile
 * @returns {Promise.<*>}
 */


exports.prepareFile = prepareFile;

var uploadFile =
/*#__PURE__*/
function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee10(_ref10) {
    var fileDir, _ref10$isPicture, isPicture, _ref10$isVideo, isVideo, _ref10$toUserName, toUserName, preparedFile, _preparedFile, fileMd5, bufferArr, fileSize, fileSymbol, fileName, fileType, promiseArr;

    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            fileDir = _ref10.fileDir, _ref10$isPicture = _ref10.isPicture, isPicture = _ref10$isPicture === void 0 ? false : _ref10$isPicture, _ref10$isVideo = _ref10.isVideo, isVideo = _ref10$isVideo === void 0 ? false : _ref10$isVideo, _ref10$toUserName = _ref10.toUserName, toUserName = _ref10$toUserName === void 0 ? 'filehelper' : _ref10$toUserName, preparedFile = _ref10.preparedFile;
            (0, _Log.LogInfo)("Request to upload a ".concat(isPicture ? 'picture' : isVideo ? 'video' : 'file', ": ").concat(fileDir));
            _context10.t0 = preparedFile;

            if (_context10.t0) {
              _context10.next = 7;
              break;
            }

            _context10.next = 6;
            return prepareFile(fileDir);

          case 6:
            _context10.t0 = _context10.sent;

          case 7:
            preparedFile = _context10.t0;
            _preparedFile = preparedFile, fileMd5 = _preparedFile.fileMd5, bufferArr = _preparedFile.bufferArr, fileSize = _preparedFile.fileSize;

            if (!(!preparedFile || !bufferArr || !bufferArr.length)) {
              _context10.next = 12;
              break;
            }

            (0, _Log.LogError)('File Analysis Failed...');
            return _context10.abrupt("return");

          case 12:
            fileSymbol = 'doc';

            if (isPicture) {
              fileSymbol = 'pic';
            } else if (isVideo) {
              fileSymbol = 'video';
            }

            fileName = FILENAME_WITH_NO_DIR;
            fileType = 'application/octet-stream';

            if (!!fileDir) {
              fileName = _path["default"].basename(fileDir);
              fileType = _mimeTypes["default"].lookup(fileDir);
            }

            promiseArr = bufferArr.map(function (buffer, index) {
              return uploadChunk({
                buffer: buffer,
                fileMd5: fileMd5,
                fileSymbol: fileSymbol,
                totalFileSize: fileSize,
                fileName: fileName,
                fileType: fileType,
                toUserName: toUserName,
                chunks: bufferArr.length,
                chunk: index
              });
            });
            return _context10.abrupt("return", promiseArr.reduce(function (result, next) {
              return result.then(function () {
                return next();
              });
            }, Promise.resolve()));

          case 19:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function uploadFile(_x15) {
    return _ref11.apply(this, arguments);
  };
}();

exports.uploadFile = uploadFile;

var uploadChunk = function uploadChunk(_ref12) {
  var buffer = _ref12.buffer,
      fileMd5 = _ref12.fileMd5,
      fileSymbol = _ref12.fileSymbol,
      totalFileSize = _ref12.totalFileSize,
      fileName = _ref12.fileName,
      fileType = _ref12.fileType,
      toUserName = _ref12.toUserName,
      chunks = _ref12.chunks,
      chunk = _ref12.chunk;
  var url = "".concat(_GlobalInfo["default"].LOGIN_INFO.fileUrl || _GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxuploadmedia?f=json");
  var uploadMediaRequest = {
    UploadType: 2,
    BaseRequest: _GlobalInfo["default"].BaseRequest,
    ClientMediaId: Date.now(),
    TotalLen: totalFileSize,
    StartPos: 0,
    DataLen: totalFileSize,
    MediaType: 4,
    FromUserName: _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName,
    ToUserName: toUserName,
    FileMd5: fileMd5
  };

  var webwxDataTicket = _GlobalInfo["default"].LOGIN_INFO.cookies.getValue('webwx_data_ticket', (0, _Utils.getUrlDomain)(url));

  var dataJson = {
    id: 'WU_FILE_0',
    name: fileName,
    type: fileType,
    lastModifiedDate: new Date().toString(),
    size: totalFileSize,
    mediatype: fileSymbol,
    uploadmediarequest: JSON.stringify(uploadMediaRequest),
    webwx_data_ticket: webwxDataTicket,
    pass_ticket: _GlobalInfo["default"].LOGIN_INFO.pass_ticket
  };
  return function () {
    //必须返回一个函数，延迟promise执行
    (0, _Log.LogInfo)("Request to upload a chunk ".concat(fileSymbol, ", chunks: ").concat(chunks, ", chunk: ").concat(chunk, " to: ").concat(toUserName));
    var formData = new _formData["default"]();
    formData.append('filename', buffer, {
      filename: fileName,
      contentType: fileType
    });

    if (chunks > 1) {
      dataJson.chunks = chunks;
      dataJson.chunk = chunk;
    }

    Object.keys(dataJson).forEach(function (key) {
      formData.append(key, dataJson[key]);
    });
    return (0, _Fetch["default"])(url, {
      method: 'POST',
      formData: formData,
      headers: _objectSpread({
        cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url)),
        'Content-Type': 'multipart/form-data'
      }, formData.getHeaders() || {})
    });
  };
};