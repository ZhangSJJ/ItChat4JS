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

var _Fetch = _interopRequireDefault(require("./Fetch"));

var _ConvertData = require("./ConvertData");

/**
 * 联系人相关
 * @time 2019/5/30
 */
var Contact =
/*#__PURE__*/
function () {
  function Contact(store) {
    (0, _classCallCheck2["default"])(this, Contact);
    this.store = store;
    this.chatroomList = []; //群列表

    this.memberList = []; //好友列表

    this.mpList = [];
  }

  (0, _createClass2["default"])(Contact, [{
    key: "getContact",
    value: function () {
      var _getContact = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var _this = this;

        var update,
            Seq,
            batchFetchContact,
            chatroomArr,
            otherList,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                update = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : false;

                if (update) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return", (0, _Utils.deepClone)(this.chatroomList));

              case 3:
                Seq = 0;

                batchFetchContact =
                /*#__PURE__*/
                function () {
                  var _ref = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee() {
                    var res, MemberList;
                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return _this.getContactList(Seq);

                          case 2:
                            res = _context.sent;
                            MemberList = res.MemberList;
                            _this.memberList = _this.memberList.concat(MemberList || []);

                            if (!(res.Seq !== 0)) {
                              _context.next = 8;
                              break;
                            }

                            _context.next = 8;
                            return batchFetchContact();

                          case 8:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function batchFetchContact() {
                    return _ref.apply(this, arguments);
                  };
                }();

                _context2.next = 7;
                return batchFetchContact();

              case 7:
                chatroomArr = [], otherList = [];
                this.memberList.forEach(function (item) {
                  if (item.Sex !== 0) {
                    otherList.push(item);
                  } else if (item.UserName.indexOf('@@') !== -1) {
                    chatroomArr.push(item);
                  } else if (item.UserName.indexOf('@') !== -1) {
                    otherList.push(item);
                  }
                });

                if (!!chatroomArr.length) {
                  this.updateLocalChatroom(chatroomArr);
                }

                if (!!otherList.length) {
                  this.updateLocalFriends(otherList);
                }

                return _context2.abrupt("return", (0, _Utils.deepClone)(chatroomArr));

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getContact() {
        return _getContact.apply(this, arguments);
      }

      return getContact;
    }()
  }, {
    key: "getContactList",
    value: function () {
      var _getContactList = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var seq,
            url,
            _args3 = arguments;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                seq = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : 0;
                url = "".concat(this.store.loginUrl, "/webwxgetcontact?r=").concat(Date.now(), "&seq=").concat(seq, "&skey=").concat(this.store.loginInfo['skey']);
                return _context3.abrupt("return", (0, _Fetch["default"])(url, {
                  headers: {
                    cookie: this.store.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                }));

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getContactList() {
        return _getContactList.apply(this, arguments);
      }

      return getContactList;
    }()
  }, {
    key: "updateLocalChatroom",
    value: function updateLocalChatroom() {
      var _this2 = this;

      var roomList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      roomList.forEach(function (chatroom) {
        var oldChatroom = _this2.chatroomList.find(function (i) {
          return i.UserName === chatroom['UserName'];
        }); //更新chatroom的信息（除了MemberList）


        if (oldChatroom) {
          (0, _ConvertData.updateInfoDict)(oldChatroom, chatroom);
          chatroom.MemberList = chatroom.MemberList || [];
          oldChatroom.MemberList = oldChatroom.MemberList || [];
          var _memberList = chatroom.MemberList;
          var _oldMemberList = oldChatroom.MemberList; //更新chatroom的MemberList中的每一个member信息

          _memberList.forEach(function (member) {
            var oldMember = _oldMemberList.find(function (i) {
              return i.UserName = member.UserName;
            });

            if (oldMember) {
              (0, _ConvertData.updateInfoDict)(oldMember, member);
            } else {
              _oldMemberList.push(member);
            }
          });
        } else {
          _this2.chatroomList.push(chatroom);

          oldChatroom = chatroom;
        }

        var memberList = chatroom.MemberList || [];
        var oldMemberList = oldChatroom.MemberList || []; //更新MemberList信息（删除某些不存在的member）

        if (!!memberList.length && memberList.length !== oldMemberList.length) {
          var existsUserNames = memberList.map(function (i) {
            return i.UserName;
          });
          oldMemberList.forEach(function (item) {
            if (existsUserNames.indexOf(item.UserName) === -1) {
              item.isDelete = true;
            }
          });
          oldChatroom.MemberList = oldMemberList.filter(function (i) {
            return !i.isDelete;
          });
        } //update OwnerUin


        if (oldChatroom.ChatRoomOwner && !!oldMemberList.length) {
          var owner = oldMemberList.find(function (i) {
            return i.UserName === oldChatroom.ChatRoomOwner;
          });
          oldChatroom.OwnerUin = (owner || {}).Uin || 0;
        } //update IsAdmin


        if (!!oldChatroom.OwnerUin) {
          oldChatroom.IsAdmin = oldChatroom.OwnerUin === _this2.store.loginInfo['wxuin'];
        } //update Self


        var newSelf = oldMemberList.find(function (i) {
          return i.UserName === _this2.store.storageClass.userName;
        });
        oldChatroom['Self'] = newSelf || (0, _Utils.deepClone)(_this2.store.loginInfo['User']);
      });
      var Text = roomList.map(function (i) {
        return i.UserName;
      });
      return {
        Type: 'System',
        Text: Text,
        SystemInfo: 'chatrooms',
        FromUserName: this.store.storageClass.userName,
        ToUserName: this.store.storageClass.userName
      };
    }
  }, {
    key: "updateLocalFriends",
    value: function updateLocalFriends() {
      var _this3 = this;

      var friendList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var fullList = this.memberList.concat(this.mpList);
      friendList.forEach(function (friend) {
        var oldInfoDict = fullList.find(function (i) {
          return i.UserName === friend['UserName'];
        });

        if (!oldInfoDict) {
          oldInfoDict = (0, _Utils.deepClone)(friend);

          if (oldInfoDict['VerifyFlag'] & 8 === 0) {
            _this3.memberList.push(oldInfoDict);
          } else {
            _this3.mpList.push(oldInfoDict);
          }
        } else {
          (0, _ConvertData.updateInfoDict)(oldInfoDict, friend);
        }
      });
    }
  }]);
  return Contact;
}();

exports["default"] = Contact;