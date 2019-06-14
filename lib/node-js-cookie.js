var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/*!
 * copy code from js-cookie
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
var Cookie =
/*#__PURE__*/
function () {
  function Cookie(cookieStr) {
    (0, _classCallCheck2["default"])(this, Cookie);

    //cookie "xxx=xxx; path=/; expires=Fri, 13 May 2022 05:27:48 GMT; domain=xxx"
    if (!cookieStr || typeof cookieStr !== 'string') {
      throw new Error('new Cookie must transmit a string');
    }

    this.cookieStr = cookieStr;
    this.initCookie();
  }

  (0, _createClass2["default"])(Cookie, [{
    key: "initCookie",
    value: function initCookie() {
      var _this = this;

      var arr = this.cookieStr.split(';');
      this.cookie = arr.splice(0, 1).join('');

      var _this$cookie$split = this.cookie.split('='),
          _this$cookie$split2 = (0, _slicedToArray2["default"])(_this$cookie$split, 2),
          key = _this$cookie$split2[0],
          value = _this$cookie$split2[1];

      this.key = key && key.trim();
      this.value = value && value.trim();
      arr.forEach(function (cookieStr) {
        var _cookieStr$split = cookieStr.split('='),
            _cookieStr$split2 = (0, _slicedToArray2["default"])(_cookieStr$split, 2),
            key = _cookieStr$split2[0],
            value = _cookieStr$split2[1];

        key = key && key.trim();
        value = value && value.trim();

        if (key === 'Secure') {
          _this.isSecure = true;
        } else {
          _this[key.toLowerCase()] = value;
        }
      });
    }
  }, {
    key: "getValue",
    value: function getValue(domain) {
      if (!domain && this.domain) {
        return '';
      }

      var isHttps = domain.startsWith('https');

      if (!isHttps && this.isSecure) {
        return '';
      }

      var now = Date.now();

      if (this.expires) {
        var expires = new Date(this.expires).getTime();

        if (now >= expires) {
          return '';
        }
      }

      if (this.domain && domain.indexOf(this.domain) === -1) {
        return '';
      }

      return this.cookie || '';
    }
  }]);
  return Cookie;
}();

var Cookies =
/*#__PURE__*/
function () {
  function Cookies() {
    var _this2 = this;

    var cookieArr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    (0, _classCallCheck2["default"])(this, Cookies);
    this.cookies = {};
    cookieArr.forEach(function (str) {
      var cookie = new Cookie(str);
      _this2.cookies[cookie.key] = cookie;
    });
  }

  (0, _createClass2["default"])(Cookies, [{
    key: "get",
    value: function get(key, domain) {
      if (!key || !this.cookies[key]) {
        return '';
      }

      return this.cookies[key].getValue(domain);
    }
  }, {
    key: "getValue",
    value: function getValue(key, domain) {
      if (!key || !this.cookies[key]) {
        return '';
      }

      return this.cookies[key].getValue(domain).split('=')[1];
    }
  }, {
    key: "getAll",
    value: function getAll(domain) {
      var _this3 = this;

      var keys = Object.keys(this.cookies);

      if (!keys || !keys.length) {
        return '';
      }

      var cookieArr = keys.map(function (key) {
        var cookie = _this3.cookies[key];
        return cookie.getValue(domain);
      }).filter(function (i) {
        return !!i;
      });
      return cookieArr.join(';');
    }
  }, {
    key: "set",
    value: function set(key, value, attributes) {
      attributes = (0, _objectSpread2["default"])({
        path: '/'
      }, attributes);
      var isSecure = attributes.secure;

      if (typeof attributes.expires === 'number') {
        var expires = new Date();
        expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
        attributes.expires = expires;
      } // We're using "expires" because "max-age" is not supported by IE


      attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';
      var cookieStr = '';
      Object.keys(attributes).forEach(function (key) {
        cookieStr += ';' + key + '=' + attributes[key];
      });

      if (isSecure) {
        cookieStr += ';' + 'Secure';
      }

      this.cookies[key] = new Cookie(key + '=' + value + cookieStr);
    }
  }, {
    key: "updateCookies",
    value: function updateCookies() {
      var _this4 = this;

      var cookieArr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      cookieArr.forEach(function (str) {
        var cookie = new Cookie(str); //直接更新，不考虑不同path和domain

        _this4.cookies[cookie.key] = cookie;
      });
    }
  }]);
  return Cookies;
}();

exports["default"] = Cookies;