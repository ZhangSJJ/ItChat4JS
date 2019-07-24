var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Utils = require("./Utils");

var _Fetch = _interopRequireDefault(require("./Fetch"));

var _ConvertData = require("./ConvertData");

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _Log = require("./Log");

/**
 * 联系人相关
 * @time 2019/5/30
 */
var Contact =
/*#__PURE__*/
function () {
  function Contact() {
    (0, _classCallCheck2["default"])(this, Contact);
    this.chatRoomList = []; //群列表

    this.memberList = []; //好友列表

    this.mpList = []; //订阅号以及公众号
  }

  (0, _createClass2["default"])(Contact, [{
    key: "getContact",
    value: function () {
      var _getContact = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var _this = this;

        var update,
            tempMemberList,
            Seq,
            batchFetchContact,
            chatRoomArr,
            otherList,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                update = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : false;
                tempMemberList = [];

                if (update) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt("return", (0, _Utils.deepClone)(this.chatRoomList));

              case 4:
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
                            tempMemberList = tempMemberList.concat(MemberList || []);

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

                _context2.next = 8;
                return batchFetchContact();

              case 8:
                chatRoomArr = [], otherList = [];
                tempMemberList.forEach(function (item) {
                  if (item.Sex !== 0) {
                    otherList.push(item);
                  } else if (item.UserName.indexOf('@@') !== -1) {
                    chatRoomArr.push(item);
                  } else if (item.UserName.indexOf('@') !== -1) {
                    otherList.push(item);
                  }
                });

                if (!!chatRoomArr.length) {
                  this.updateLocalChatRoom(chatRoomArr);
                }

                if (!!otherList.length) {
                  this.updateLocalFriends(otherList);
                }

                return _context2.abrupt("return", (0, _Utils.deepClone)(chatRoomArr));

              case 13:
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
    key: "getChatRoomInfo",
    value: function getChatRoomInfo(chatRoomUserName) {
      var nameIsArray = (0, _Utils.isArray)(chatRoomUserName);

      if (!nameIsArray) {
        chatRoomUserName = [chatRoomUserName];
      }

      var filterRet = this.chatRoomList.filter(function (i) {
        return chatRoomUserName.indexOf(i.UserName) !== -1;
      });

      if (nameIsArray) {
        return filterRet;
      }

      return filterRet[0];
    }
  }, {
    key: "getFriendInfo",
    value: function getFriendInfo(userName) {
      var nameIsArray = (0, _Utils.isArray)(userName);

      if (!nameIsArray) {
        userName = [userName];
      }

      var filterRet = this.memberList.filter(function (i) {
        return userName.indexOf(i.UserName) !== -1;
      });

      if (nameIsArray) {
        return filterRet;
      }

      return filterRet[0];
    }
  }, {
    key: "getMpInfo",
    value: function getMpInfo(userName) {
      var nameIsArray = (0, _Utils.isArray)(userName);

      if (!nameIsArray) {
        userName = [userName];
      }

      var filterRet = this.mpList.filter(function (i) {
        return userName.indexOf(i.UserName) !== -1;
      });

      if (nameIsArray) {
        return filterRet;
      }

      return filterRet[0];
    }
    /**
     * 在所有的list中查找成员
     * 可以通过UserName，NickName，RemarkName 获取好友信息
     * @param name
     * @returns {*}
     */

  }, {
    key: "getContactInfoByName",
    value: function getContactInfoByName(name) {
      var nameIsArray = (0, _Utils.isArray)(name);

      if (!nameIsArray) {
        name = [name];
      }

      var fullContact = this.chatRoomList.concat(this.memberList).concat(this.mpList);
      var filterRet = fullContact.filter(function (i) {
        return name.indexOf(i.UserName) !== -1 || name.indexOf(i.NickName) !== -1 || name.indexOf(i.RemarkName) !== -1;
      });

      if (nameIsArray) {
        return filterRet;
      }

      return filterRet[0];
    }
  }, {
    key: "updateChatRoomInfo",
    value: function () {
      var _updateChatRoomInfo = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3(userName) {
        var url, params, res, chatRoomInfoArr;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(0, _Utils.isArray)(userName)) {
                  userName = [userName];
                }

                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxbatchgetcontact?type=ex&r=").concat(Date.now());
                params = {
                  method: 'POST',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  Count: userName.length,
                  List: userName.map(function (i) {
                    return {
                      ChatRoomId: '',
                      UserName: i
                    };
                  }),
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context3.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context3.sent;

                if (res.BaseResponse && res.BaseResponse.Ret === 0) {
                  this.updateLocalChatRoom(res.ContactList);
                }

                chatRoomInfoArr = this.getChatRoomInfo(res.ContactList.map(function (i) {
                  return i.UserName;
                }));
                return _context3.abrupt("return", chatRoomInfoArr.length > 1 ? chatRoomInfoArr : chatRoomInfoArr[0]);

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function updateChatRoomInfo(_x) {
        return _updateChatRoomInfo.apply(this, arguments);
      }

      return updateChatRoomInfo;
    }()
  }, {
    key: "updateFriendInfo",
    value: function () {
      var _updateFriendInfo = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4(userName) {
        var url, params, res;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(0, _Utils.isArray)(userName)) {
                  userName = [userName];
                }

                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxbatchgetcontact?type=ex&r=").concat(Date.now());
                params = {
                  method: 'POST',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  Count: userName.length,
                  List: userName.map(function (i) {
                    return {
                      EncryChatRoomId: '',
                      UserName: i
                    };
                  }),
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context4.next = 5;
                return (0, _Fetch["default"])(url, params);

              case 5:
                res = _context4.sent;

                if (res.BaseResponse && res.BaseResponse.Ret === 0) {
                  this.updateLocalFriends(res.ContactList);
                }

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function updateFriendInfo(_x2) {
        return _updateFriendInfo.apply(this, arguments);
      }

      return updateFriendInfo;
    }()
  }, {
    key: "getContactList",
    value: function () {
      var _getContactList = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5() {
        var seq,
            url,
            _args5 = arguments;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                seq = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : 0;
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxgetcontact?r=").concat(Date.now(), "&seq=").concat(seq, "&skey=").concat(_GlobalInfo["default"].LOGIN_INFO['skey']);
                return _context5.abrupt("return", (0, _Fetch["default"])(url, {
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                }));

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function getContactList() {
        return _getContactList.apply(this, arguments);
      }

      return getContactList;
    }()
  }, {
    key: "updateLocalChatRoom",
    value: function updateLocalChatRoom() {
      var _this2 = this;

      var roomList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      roomList.forEach(function (chatRoom) {
        if (!chatRoom['UserName']) {
          return;
        }

        var oldChatRoom = _this2.chatRoomList.find(function (i) {
          return i.UserName === chatRoom['UserName'];
        }); //更新chatRoom的信息（除了MemberList）


        if (oldChatRoom) {
          (0, _ConvertData.updateInfoDict)(oldChatRoom, chatRoom);
          chatRoom.MemberList = chatRoom.MemberList || [];
          oldChatRoom.MemberList = oldChatRoom.MemberList || [];
          var _memberList = chatRoom.MemberList;
          var _oldMemberList = oldChatRoom.MemberList; //更新chatRoom的MemberList中的每一个member信息

          _memberList.forEach(function (member) {
            var oldMember = _oldMemberList.find(function (i) {
              return i.UserName === member.UserName;
            });

            if (oldMember) {
              (0, _ConvertData.updateInfoDict)(oldMember, member);
            } else {
              _oldMemberList.push(member);
            }
          });
        } else {
          chatRoom.myDefinedUserType = _GlobalInfo["default"].EMIT_NAME.CHAT_ROOM;

          _this2.chatRoomList.push(chatRoom);

          oldChatRoom = chatRoom;
        }

        var memberList = chatRoom.MemberList || [];
        var oldMemberList = oldChatRoom.MemberList || []; //更新MemberList信息（删除某些不存在的member）

        if (!!memberList.length && memberList.length !== oldMemberList.length) {
          var existsUserNames = memberList.map(function (i) {
            return i.UserName;
          });
          oldMemberList.forEach(function (item) {
            if (existsUserNames.indexOf(item.UserName) === -1) {
              item.isDelete = true;
            }
          });
          oldChatRoom.MemberList = oldMemberList.filter(function (i) {
            return !i.isDelete;
          });
        } //update OwnerUin


        if (oldChatRoom.ChatRoomOwner && !!oldMemberList.length) {
          var owner = oldMemberList.find(function (i) {
            return i.UserName === oldChatRoom.ChatRoomOwner;
          });
          oldChatRoom.OwnerUin = (owner || {}).Uin || 0;
        } //update IsAdmin


        if (!!oldChatRoom.OwnerUin) {
          oldChatRoom.IsAdmin = oldChatRoom.OwnerUin === _GlobalInfo["default"].LOGIN_INFO['wxuin'];
        } //update Self


        var newSelf = oldMemberList.find(function (i) {
          return i.UserName === _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName;
        });
        oldChatRoom['Self'] = newSelf || (0, _Utils.deepClone)(_GlobalInfo["default"].LOGIN_INFO.selfUserInfo);
      });
      var Text = roomList.map(function (i) {
        return i.UserName;
      });
      return {
        Type: 'System',
        Text: Text,
        SystemInfo: 'chatrooms',
        FromUserName: _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName,
        ToUserName: _GlobalInfo["default"].LOGIN_INFO.selfUserInfo.UserName
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

          if ((oldInfoDict['VerifyFlag'] & 8) === 0) {
            oldInfoDict.myDefinedUserType = _GlobalInfo["default"].EMIT_NAME.FRIEND;

            _this3.memberList.push(oldInfoDict);
          } else {
            oldInfoDict.myDefinedUserType = _GlobalInfo["default"].EMIT_NAME.MASSIVE_PLATFORM;

            _this3.mpList.push(oldInfoDict);
          }
        } else {
          (0, _ConvertData.updateInfoDict)(oldInfoDict, friend);
        }
      });
    }
  }, {
    key: "updateLocalUin",
    value: function updateLocalUin(msg) {
      var _this4 = this;

      var usernameChangedList = [];
      var ret = {
        'Type': 'System',
        'Text': usernameChangedList,
        'SystemInfo': 'uins'
      };
      msg = msg || {
        Content: ''
      };
      var reg = '<username>([^<]*?)<';
      var match = msg['Content'].match(reg);

      if (match && match[1]) {
        var uins = match[1].split(',');
        var usernames = msg['StatusNotifyUserName'].split(',');

        if (!!uins.length && !!usernames.length && uins.length === usernames.length) {
          uins.forEach(
          /*#__PURE__*/
          function () {
            var _ref2 = (0, _asyncToGenerator2["default"])(
            /*#__PURE__*/
            _regenerator["default"].mark(function _callee6(uin, index) {
              var username, userInfo, newChatRoomInfo, newFriendInfo;
              return _regenerator["default"].wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      username = usernames[index];

                      if (!(username.indexOf('@') === -1)) {
                        _context6.next = 3;
                        break;
                      }

                      return _context6.abrupt("return");

                    case 3:
                      userInfo = _this4.getContactInfoByName(username);

                      if (!userInfo) {
                        _context6.next = 8;
                        break;
                      }

                      if ((userInfo['Uin'] || 0) === 0) {
                        userInfo['Uin'] = uin;
                        usernameChangedList.push(username);
                        (0, _Log.LogDebug)('Uin fetched: ' + username + ', ' + uin);
                      } else if (userInfo['Uin'] !== uin) {
                        (0, _Log.LogDebug)('Uin changed: ' + userInfo['Uin'] + ', ' + uin);
                      }

                      _context6.next = 22;
                      break;

                    case 8:
                      if (!(username.indexOf('@@') !== -1)) {
                        _context6.next = 15;
                        break;
                      }

                      _context6.next = 11;
                      return _this4.updateChatRoomInfo(username);

                    case 11:
                      newChatRoomInfo = _this4.getChatRoomInfo(username);

                      if (!newChatRoomInfo) {
                        newChatRoomInfo = (0, _ConvertData.structFriendInfo)({
                          'UserName': username,
                          'Uin': uin,
                          'Self': (0, _Utils.deepClone)(_GlobalInfo["default"].LOGIN_INFO.selfUserInfo)
                        });

                        _this4.chatRoomList.push(newChatRoomInfo);
                      } else {
                        newChatRoomInfo['Uin'] = uin;
                      }

                      _context6.next = 20;
                      break;

                    case 15:
                      if (!(username.indexOf('@') !== -1)) {
                        _context6.next = 20;
                        break;
                      }

                      _context6.next = 18;
                      return _this4.updateFriendInfo(username);

                    case 18:
                      newFriendInfo = _this4.getFriendInfo(username);

                      if (!newFriendInfo) {
                        newFriendInfo = (0, _ConvertData.structFriendInfo)({
                          'UserName': username,
                          'Uin': uin
                        });

                        _this4.memberList.push(newFriendInfo);
                      } else {
                        newFriendInfo['Uin'] = uin;
                      }

                    case 20:
                      usernameChangedList.push(username);
                      (0, _Log.LogDebug)('Uin fetched: ' + username + ',  ' + uin);

                    case 22:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _callee6);
            }));

            return function (_x3, _x4) {
              return _ref2.apply(this, arguments);
            };
          }());
        } else {
          (0, _Log.LogDebug)('Wrong length of uins & usernames: ' + uins.length + ',' + usernames.length);
        }
      } else {
        (0, _Log.LogDebug)('No uins in 51 message');
        (0, _Log.LogDebug)(msg['Content']);
      }

      return ret;
    }
    /**
     * for adding status should be 2
     * for accepting status should be 3
     * @param userName
     * @param status
     * @param verifyContent
     * @param autoUpdate
     * @returns {Promise.<*>}
     */

  }, {
    key: "verifyFriend",
    value: function () {
      var _verifyFriend = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee7(userName) {
        var status,
            verifyContent,
            autoUpdate,
            url,
            params,
            res,
            _args7 = arguments;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                status = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : 2;
                verifyContent = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : '';
                autoUpdate = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : true;
                (0, _Log.LogDebug)('Add a friend or accept a friend');
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxverifyuser");
                params = {
                  method: 'post',
                  r: Date.now(),
                  pass_ticket: _GlobalInfo["default"].LOGIN_INFO.pass_ticket,
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  Opcode: status,
                  VerifyUserListSize: 1,
                  VerifyUserList: [{
                    Value: userName,
                    VerifyUserTicket: ''
                  }],
                  VerifyContent: verifyContent,
                  SceneListCount: 1,
                  SceneList: [33],
                  skey: _GlobalInfo["default"].LOGIN_INFO['skey'],
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context7.next = 8;
                return (0, _Fetch["default"])(url, params);

              case 8:
                res = _context7.sent;
                (0, _Log.LogDebug)(res);

                if (!autoUpdate) {
                  _context7.next = 13;
                  break;
                }

                _context7.next = 13;
                return this.updateFriendInfo(userName);

              case 13:
                return _context7.abrupt("return", res);

              case 14:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function verifyFriend(_x5) {
        return _verifyFriend.apply(this, arguments);
      }

      return verifyFriend;
    }()
    /**
     * 设置别名(好友)
     * @param userName
     * @param alias
     * @returns {Promise.<void>}
     */

  }, {
    key: "setAlias",
    value: function () {
      var _setAlias = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee8(userName) {
        var alias,
            oldFriendInfo,
            url,
            params,
            _args8 = arguments;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                alias = _args8.length > 1 && _args8[1] !== undefined ? _args8[1] : '';
                oldFriendInfo = this.getFriendInfo(userName);

                if (oldFriendInfo) {
                  _context8.next = 5;
                  break;
                }

                (0, _Log.LogError)('You Do Not Have A Friend Named :' + userName);
                return _context8.abrupt("return");

              case 5:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxoplog?lang=zh_CN&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  method: 'post',
                  UserName: userName,
                  CmdId: 2,
                  RemarkName: alias,
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context8.next = 9;
                return (0, _Fetch["default"])(url, params);

              case 9:
                return _context8.abrupt("return", _context8.sent);

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function setAlias(_x6) {
        return _setAlias.apply(this, arguments);
      }

      return setAlias;
    }()
    /**
     * 置顶好友
     * @param userName
     * @param isPinned
     * @returns {Promise.<*>}
     */

  }, {
    key: "setPinned",
    value: function () {
      var _setPinned = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee9(userName) {
        var isPinned,
            oldFriendInfo,
            url,
            params,
            _args9 = arguments;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                isPinned = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : true;
                oldFriendInfo = this.getContactInfoByName(userName);

                if (oldFriendInfo) {
                  _context9.next = 5;
                  break;
                }

                (0, _Log.LogError)('You Do Not Have A Friend, Chat Room Or Massive Platform Named :' + userName);
                return _context9.abrupt("return");

              case 5:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxoplog?pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  method: 'post',
                  UserName: userName,
                  CmdId: 3,
                  OP: +isPinned,
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  RemarkName: oldFriendInfo.RemarkName,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context9.next = 9;
                return (0, _Fetch["default"])(url, params);

              case 9:
                return _context9.abrupt("return", _context9.sent);

              case 10:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function setPinned(_x7) {
        return _setPinned.apply(this, arguments);
      }

      return setPinned;
    }()
    /**
     * 创建群聊
     * @param memberList
     * @param topic
     * @returns {Promise.<*>}
     */

  }, {
    key: "createChatRoom",
    value: function () {
      var _createChatRoom = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee10(memberList) {
        var topic,
            url,
            params,
            _args10 = arguments;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                topic = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : '';

                if (!(!memberList || !memberList.length)) {
                  _context10.next = 4;
                  break;
                }

                (0, _Log.LogError)('None Member To Add To Create A ChatRoom!');
                return _context10.abrupt("return");

              case 4:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxcreatechatroom?pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket, "&r=").concat(Date.now());
                params = {
                  method: 'post',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  MemberCount: memberList.length,
                  MemberList: memberList.map(function (member) {
                    return {
                      UserName: member['UserName']
                    };
                  }),
                  Topic: topic,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context10.next = 8;
                return (0, _Fetch["default"])(url, params);

              case 8:
                return _context10.abrupt("return", _context10.sent);

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10);
      }));

      function createChatRoom(_x8) {
        return _createChatRoom.apply(this, arguments);
      }

      return createChatRoom;
    }()
  }, {
    key: "setChatRoomName",
    value: function () {
      var _setChatRoomName = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee11(chatRoomUserName, name) {
        var oldChatRoomInfo, url, params;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                oldChatRoomInfo = this.getChatRoomInfo(chatRoomUserName);

                if (oldChatRoomInfo) {
                  _context11.next = 4;
                  break;
                }

                (0, _Log.LogError)('You Are Not In A Chat Room Named :' + chatRoomUserName);
                return _context11.abrupt("return");

              case 4:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxupdatechatroom?fun=modtopic&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  method: 'post',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  ChatRoomName: chatRoomUserName,
                  NewTopic: name,
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                _context11.next = 8;
                return (0, _Fetch["default"])(url, params);

              case 8:
                return _context11.abrupt("return", _context11.sent);

              case 9:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function setChatRoomName(_x9, _x10) {
        return _setChatRoomName.apply(this, arguments);
      }

      return setChatRoomName;
    }()
    /**
     * todo 删除群成员总是返回Ret：1不成功（网页版也不成功）
     * @param chatRoomUserName
     * @param memberList
     * @returns {Promise.<*>}
     */

  }, {
    key: "deleteMemberFromChatRoom",
    value: function () {
      var _deleteMemberFromChatRoom = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee12(chatRoomUserName, memberList) {
        var oldChatRoomInfo, url, params;
        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!(0, _Utils.isArray)(memberList)) {
                  memberList = [memberList];
                }

                oldChatRoomInfo = this.getChatRoomInfo(chatRoomUserName);

                if (oldChatRoomInfo) {
                  _context12.next = 5;
                  break;
                }

                (0, _Log.LogError)('You Are Not In A Chat Room Named :' + chatRoomUserName);
                return _context12.abrupt("return");

              case 5:
                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxupdatechatroom?fun=delmember&lang=zh_CN&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = {
                  method: 'post',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  ChatRoomName: chatRoomUserName,
                  DelMemberList: memberList.map(function (member) {
                    return member['UserName'];
                  }).join(','),
                  headers: {
                    cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                  }
                };
                console.log(url, '==============');
                console.log(params, '==============');
                _context12.next = 11;
                return (0, _Fetch["default"])(url, params);

              case 11:
                return _context12.abrupt("return", _context12.sent);

              case 12:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function deleteMemberFromChatRoom(_x11, _x12) {
        return _deleteMemberFromChatRoom.apply(this, arguments);
      }

      return deleteMemberFromChatRoom;
    }()
    /**
     * add or invite member into chatroom
     * there are two ways to get members into chatroom: invite or directly add
     * but for chatrooms with more than 40 users, you can only use invite
     * but don't worry we will auto-force userInvitation for you when necessary
     * @param chatRoomUserName
     * @param memberList
     * @param useInvitation
     */

  }, {
    key: "addMemberIntoChatRoom",
    value: function () {
      var _addMemberIntoChatRoom = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee13(chatRoomUserName, memberList) {
        var _params;

        var useInvitation,
            oldChatRoomInfo,
            fun,
            memberKeyName,
            url,
            params,
            _args13 = arguments;
        return _regenerator["default"].wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                useInvitation = _args13.length > 2 && _args13[2] !== undefined ? _args13[2] : false;

                if (useInvitation) {
                  _context13.next = 9;
                  break;
                }

                oldChatRoomInfo = this.getChatRoomInfo(chatRoomUserName);

                if (oldChatRoomInfo) {
                  _context13.next = 9;
                  break;
                }

                oldChatRoomInfo = this.updateChatRoomInfo(chatRoomUserName);

                if (oldChatRoomInfo) {
                  _context13.next = 8;
                  break;
                }

                (0, _Log.LogError)('You Are Not In A Chat Room Named :' + chatRoomUserName);
                return _context13.abrupt("return");

              case 8:
                useInvitation = oldChatRoomInfo['MemberList'].length > _GlobalInfo["default"].LOGIN_INFO['InviteStartCount'];

              case 9:
                fun = 'addmember', memberKeyName = 'AddMemberList';

                if (useInvitation) {
                  fun = 'invitemember';
                  memberKeyName = 'InviteMemberList';
                }

                url = "".concat(_GlobalInfo["default"].LOGIN_INFO.loginUrl, "/webwxupdatechatroom?fun=").concat(fun, "&pass_ticket=").concat(_GlobalInfo["default"].LOGIN_INFO.pass_ticket);
                params = (_params = {
                  method: 'post',
                  BaseRequest: _GlobalInfo["default"].BaseRequest,
                  ChatRoomName: chatRoomUserName
                }, (0, _defineProperty2["default"])(_params, memberKeyName, memberList.map(function (member) {
                  return member['UserName'];
                }).join(',')), (0, _defineProperty2["default"])(_params, "headers", {
                  cookie: _GlobalInfo["default"].LOGIN_INFO.cookies.getAll((0, _Utils.getUrlDomain)(url))
                }), _params);
                _context13.next = 15;
                return (0, _Fetch["default"])(url, params);

              case 15:
                return _context13.abrupt("return", _context13.sent);

              case 16:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function addMemberIntoChatRoom(_x13, _x14) {
        return _addMemberIntoChatRoom.apply(this, arguments);
      }

      return addMemberIntoChatRoom;
    }()
  }]);
  return Contact;
}();

exports["default"] = Contact;