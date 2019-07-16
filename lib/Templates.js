var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapUserDict = exports.MassivePlatform = exports.User = void 0;

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

/**
 * @time 2019/6/4
 */
var Chatoom = function Chatoom() {
  (0, _classCallCheck2["default"])(this, Chatoom);
};

var ContactList =
/*#__PURE__*/
function () {
  function ContactList() {
    (0, _classCallCheck2["default"])(this, ContactList);
    this.list = []; // this.contactInitFn = None
    // this.contactClass = User
  }

  (0, _createClass2["default"])(ContactList, [{
    key: "getValue",
    value: function getValue() {
      return this.list;
    }
  }]);
  return ContactList;
}();

var User =
/*#__PURE__*/
function () {
  function User() {
    var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, User);
    this.user = user;
    this.verifyDict = {};
    this.contactListIns = new ContactList();
    this.user['MemberList'] = this.contactListIns.getValue();
  }

  (0, _createClass2["default"])(User, [{
    key: "getValue",
    value: function getValue() {
      return this.user;
    }
  }]);
  return User;
}();

exports.User = User;

var MassivePlatform =
/*#__PURE__*/
function () {
  function MassivePlatform() {
    var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, MassivePlatform);
    this.user = user;
    this.contactListIns = new ContactList();
    this.user['MemberList'] = this.contactListIns.getValue();
  }

  (0, _createClass2["default"])(MassivePlatform, [{
    key: "getValue",
    value: function getValue() {
      return this.user;
    }
  }]);
  return MassivePlatform;
}();

exports.MassivePlatform = MassivePlatform;

var wrapUserDict = function wrapUserDict(user) {
  var userName = user.UserName;
  var ret = new MassivePlatform(user);

  if (userName.indexOf('@@')) {//todo
    // ret = Chatroom(user)
  } else if (((user.VerifyFlag || 8) & 8) === 0) {
    ret = new User(user);
  }

  return ret;
};

exports.wrapUserDict = wrapUserDict;