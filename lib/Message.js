var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Utils = require("./Utils");

var _Fetch = _interopRequireWildcard(require("./Fetch"));

var _ReturnValueFormat = _interopRequireDefault(require("./ReturnValueFormat"));

/**
 * @time 2019/5/31
 */

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
    var store = props.store,
        friendReplyInfo = props.friendReplyInfo,
        groupReplyInfo = props.groupReplyInfo;
    this.messageList = [];
    this.store = store;
    this.typeArr = [40, 43, 50, 52, 53, 9999];
    this.groupMsgList = [];
    this.friendMsgList = [];
    this.friendReplyInfo = friendReplyInfo;
    this.groupReplyInfo = groupReplyInfo;
  }

  (0, _createClass2["default"])(Message, [{
    key: "produceMsg",
    value: function produceMsg() {
      var _this = this;

      var msgList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      msgList.forEach(function (msg) {
        //  get actual opposite
        if (msg.FromUserName === _this.store.storageClass.userName) {
          _this.actualOpposite = msg.ToUserName;
        } else {
          _this.actualOpposite = msg.FromUserName;
        } // produce basic message


        if (msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1) {//todo
          // produce_group_chat(core, m)
        } else {
          (0, _Utils.msgFormatter)(msg, 'Content');
        }
      });
    }
  }, {
    key: "appendMsg",
    value: function appendMsg(message) {
      this.messageList.push(message);
    }
  }, {
    key: "startReplying",
    value: function startReplying() {}
  }, {
    key: "sendMsg",
    value: function () {
      var _sendMsg = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(msgType, content, toUserName) {
        var url, params, res;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                url = "".concat(this.store.loginUrl, "/webwxsendmsg");
                params = {
                  method: 'post',
                  BaseRequest: (0, _objectSpread2["default"])({}, this.store.BaseRequest, {
                    DeviceID: 'e' + (Math.random() + '').substring(2, 17)
                  }),
                  Msg: {
                    Type: msgType,
                    Content: content,
                    FromUserName: this.store.storageClass.userName,
                    ToUserName: toUserName || this.store.storageClass.userName,
                    LocalID: Date.now() * 1e4 + '',
                    ClientMsgId: Date.now() * 1e4 + ''
                  },
                  Scene: 0,
                  headers: {
                    cookie: this.store.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                console.log(JSON.stringify(params));
                _context.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context.sent;
                // const returnValue = new ReturnValueFormat(res);
                console.log(res);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function sendMsg(_x, _x2, _x3) {
        return _sendMsg.apply(this, arguments);
      }

      return sendMsg;
    }()
  }]);
  return Message;
}();

exports["default"] = Message;