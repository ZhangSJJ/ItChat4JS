var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertDate = exports.convertRes = exports.msgFormatter = exports.unescape = exports.escape = exports.isObject = exports.isArray = exports.deepClone = exports.getUrlDomain = exports.WhileDoing = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

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
    value: function start() {
      var _this = this;

      var doFn =
      /*#__PURE__*/
      function () {
        var _ref = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee2() {
          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _this.clearId();

                  _context2.next = 3;
                  return _this.doingFn();

                case 3:
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
                              _context.next = 3;
                              break;
                            }

                            _this.clearId();

                            return _context.abrupt("return");

                          case 3:
                            _context.next = 5;
                            return doFn();

                          case 5:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  })), _this.intervalTime);

                case 4:
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

      doFn();
    }
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

var msgFormatter = function msgFormatter(data, key) {
  //todo
  // emoji_formatter(data, key)
  data[key] = (data[key] + '').replace('<br/>', '\n');
  data[key] = unescape(data[key]);
};

exports.msgFormatter = msgFormatter;

var convertRes = function convertRes(res) {
  if (res && res.body && res.body._readableState && res.body._readableState.buffer && res.body._readableState.buffer.head && res.body._readableState.buffer.head.data) {
    var buffer = new Buffer(res.body._readableState.buffer.head.data);
    return buffer.toString();
  } else {
    return null;
  }
};

exports.convertRes = convertRes;

var convertDate = function convertDate(date) {
  date = date || new Date();
  var year = date.getFullYear(),
      month = date.getMonth() + 1,
      day = date.getDate(),
      h = date.getHours(),
      m = date.getMinutes(),
      s = date.getSeconds();
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
};

exports.convertDate = convertDate;