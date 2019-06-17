var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Utils = require("./Utils");

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

var _GlobalInfo = require("./GlobalInfo");

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
        updateChatRoomInfo = props.updateChatRoomInfo;
    this.on = on;
    this.emit = emit;
    this.getChatRoomInfo = getChatRoomInfo;
    this.updateChatRoomInfo = updateChatRoomInfo;
    this.typeArr = [40, 43, 50, 52, 53, 9999];
  }

  (0, _createClass2["default"])(Message, [{
    key: "produceMsg",
    value: function produceMsg() {
      var _this = this;

      var msgList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      msgList.forEach(
      /*#__PURE__*/
      function () {
        var _ref = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee(msg) {
          var messageType, reg, match, chatRoomUserName, actualUserName, chatRoom, member, chatRoomSelfUserInfo, hasSpecialStr, atFlag;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  //  get actual opposite
                  if (msg.FromUserName === _GlobalInfo.LOGIN_INFO.selfUserInfo.UserName) {
                    msg.actualOpposite = msg.ToUserName;
                  } else {
                    msg.actualOpposite = msg.FromUserName;
                  }

                  messageType = _GlobalInfo.EMIT_NAME.FRIEND; // produce basic message

                  if (!(msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1)) {
                    _context.next = 21;
                    break;
                  }

                  messageType = _GlobalInfo.EMIT_NAME.CHAT_ROOM;
                  reg = '(@[0-9a-z]*?):<br/>(.*)$';
                  match = (msg.Content || '').match(reg);
                  chatRoomUserName = msg['FromUserName'];

                  if (!match) {
                    _context.next = 19;
                    break;
                  }

                  actualUserName = match[1];
                  chatRoom = _this.getChatRoomInfo(chatRoomUserName);
                  member = (chatRoom.MemberList || []).find(function (i) {
                    return i.UserName === actualUserName;
                  });

                  if (member) {
                    _context.next = 16;
                    break;
                  }

                  _context.next = 14;
                  return _this.updateChatRoomInfo(chatRoomUserName);

                case 14:
                  chatRoom = _this.getChatRoomInfo(chatRoomUserName);
                  member = (chatRoom.MemberList || []).find(function (i) {
                    return i.UserName === actualUserName;
                  });

                case 16:
                  if (!member) {
                    // logger.debug('chatroom member fetch failed with %s' % actualUserName);
                    console.log('chatroom member fetch failed with %s' % actualUserName);
                    msg['ActualNickName'] = '';
                    msg['IsAt'] = false;
                  } else {
                    msg['ActualNickName'] = member['DisplayName'] || member['NickName'] || '';
                    chatRoomSelfUserInfo = chatRoom['Self'];
                    hasSpecialStr = msg.Content.indexOf("\u2005") !== -1;
                    atFlag = "@".concat(chatRoomSelfUserInfo['DisplayName'] || _GlobalInfo.LOGIN_INFO.selfUserInfo.NickName || '') + (hasSpecialStr ? "\u2005" : ' ');
                    msg['IsAt'] = msg.Content.indexOf(atFlag) !== -1;
                  }

                  msg['ActualUserName'] = actualUserName;
                  (0, _Utils.msgFormatter)(msg, 'Content');

                case 19:
                  _context.next = 22;
                  break;

                case 21:
                  (0, _Utils.msgFormatter)(msg, 'Content');

                case 22:
                  _this.reply(msg, messageType);

                case 23:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
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
        isAt: msg['IsAt']
      };
      this.emit(messageType, retReply, messageFrom);
    }
  }]);
  return Message;
}();

exports["default"] = Message;