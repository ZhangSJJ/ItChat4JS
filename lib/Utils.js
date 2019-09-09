var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeviceID = exports.convertDate = exports.msgFormatter = exports.emojiFormatter = exports.unescape = exports.escape = exports.isObject = exports.isArray = exports.deepClone = exports.getUrlDomain = exports.WhileDoing = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _ConstValues = require("./ConstValues");

/**
 * @time 2019/5/27
 */
var WhileDoing =
/*#__PURE__*/
function () {
  function WhileDoing(doingFn) {
    var intervalTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
    (0, _classCallCheck2["default"])(this, WhileDoing);
    this.doingFn = doingFn;
    this.intervalTime = intervalTime;
    this.doId = null;
    this.endFlag = false;
  }

  (0, _createClass2["default"])(WhileDoing, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var _this = this;

        var doFn;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                doFn =
                /*#__PURE__*/
                function () {
                  var _ref = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee2() {
                    var promise;
                    return _regenerator["default"].wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _this.clearId();

                            _context2.next = 3;
                            return _this.doingFn();

                          case 3:
                            promise = new Promise(function (resolve) {
                              _this.doId = setTimeout(
                              /*#__PURE__*/
                              (0, _asyncToGenerator2["default"])(
                              /*#__PURE__*/
                              _regenerator["default"].mark(function _callee() {
                                return _regenerator["default"].wrap(function _callee$(_context) {
                                  while (1) {
                                    switch (_context.prev = _context.next) {
                                      case 0:
                                        if (!_this.endFlag) {
                                          _context.next = 4;
                                          break;
                                        }

                                        _this.clearId();

                                        resolve();
                                        return _context.abrupt("return");

                                      case 4:
                                        _context.next = 6;
                                        return doFn();

                                      case 6:
                                        resolve();

                                      case 7:
                                      case "end":
                                        return _context.stop();
                                    }
                                  }
                                }, _callee);
                              })), _this.intervalTime);
                            });
                            _context2.next = 6;
                            return promise;

                          case 6:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function doFn() {
                    return _ref.apply(this, arguments);
                  };
                }();

                _context3.next = 3;
                return doFn();

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function start() {
        return _start.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "end",
    value: function end() {
      this.endFlag = true;
    }
  }, {
    key: "clearId",
    value: function clearId() {
      this.doId && clearTimeout(this.doId);
      this.doId = null;
    }
  }]);
  return WhileDoing;
}();

exports.WhileDoing = WhileDoing;

var getUrlDomain = function getUrlDomain(url) {
  if (!url) {
    return '';
  }

  var urlArr = url.split('//');
  var protocol = urlArr[0];

  if (!urlArr[1]) {
    return protocol + '//';
  }

  var hostname = urlArr[1].split('/')[0];

  if (!hostname) {
    return protocol + '//';
  }

  return [protocol, hostname].join('//');
};

exports.getUrlDomain = getUrlDomain;

var deepClone = function deepClone(data) {
  var type = Object.prototype.toString.call(data);
  var result = {};

  if (type === '[object Array]') {
    result = [];
  } else if (type === '[object Object]') {
    result = {};
  } else {
    return data;
  }

  if (type === '[object Array]') {
    data.forEach(function (item) {
      result.push(deepClone(item));
    });
  }

  if (type === '[object Object]') {
    Object.keys(data).forEach(function (key) {
      result[key] = deepClone(data[key]);
    });
  }

  return result;
};

exports.deepClone = deepClone;

var isArray = function isArray(data) {
  return Object.prototype.toString.call(data) === '[object Array]';
};

exports.isArray = isArray;

var isObject = function isObject(data) {
  return Object.prototype.toString.call(data) === '[object Object]';
};

exports.isObject = isObject;

var escape = function escape() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  str = '' + str;
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};

exports.escape = escape;

var unescape = function unescape() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  str = '' + str;
  return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
};

exports.unescape = unescape;

var emojiFormatter = function emojiFormatter(data, key) {
  if (!data[key]) {
    return;
  }

  var regA = /\<span class="emoji emoji(.{1,10})"\>\<\/span\>/g;
  var reg = /\<span class="emoji emoji(.{1,10})"\>\<\/span\>/;
  (data[key].match(regA) || []).forEach(function (str) {
    var match = str.match(reg);

    if (match && match[0] && match[1]) {
      var emojiCode = _ConstValues.MissMatchEmoji[match[1]] || match[1];
      !!emojiCode && _ConstValues.EmojiCodeMap[emojiCode] && (data[key] = data[key].replace(match[0], _ConstValues.EmojiCodeMap[emojiCode]));
    }
  });
};

exports.emojiFormatter = emojiFormatter;

var msgFormatter = function msgFormatter(data, key) {
  emojiFormatter(data, key);
  data[key] = (data[key] + '').replace('<br/>', '\n');
  data[key] = unescape(data[key]);
};
/**
 * 将时间转换为 yyyy-MM-dd HH:mm:ss 格式的字符串
 * @param date
 * @returns {string}
 */


exports.msgFormatter = msgFormatter;

var convertDate = function convertDate(date) {
  date = date || new Date();
  return [date.getFullYear(), '-', ('00' + (date.getMonth() + 1)).slice(-2), '-', ('00' + date.getDate()).slice(-2), ' ', ('00' + date.getHours()).slice(-2), ':', ('00' + date.getMinutes()).slice(-2), ':', ('00' + date.getSeconds()).slice(-2)].join('');
};

exports.convertDate = convertDate;

var getDeviceID = function getDeviceID() {
  return "e" + ("" + Math.random().toFixed(15)).substring(2, 17);
};

exports.getDeviceID = getDeviceID;