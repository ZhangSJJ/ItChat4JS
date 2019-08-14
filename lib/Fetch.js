var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toJSON = toJSON;
exports.toBuffer = toBuffer;
exports["default"] = exports.FetchWithExcept = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _querystring = _interopRequireDefault(require("querystring"));

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _Log = require("./Log");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Fetch = function Fetch(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var headers = options.headers,
      _options$method = options.method,
      method = _options$method === void 0 ? 'GET' : _options$method,
      _options$json = options.json,
      json = _options$json === void 0 ? true : _options$json,
      _options$buffer = options.buffer,
      buffer = _options$buffer === void 0 ? false : _options$buffer,
      _options$formData = options.formData,
      formData = _options$formData === void 0 ? null : _options$formData,
      timeout = options.timeout,
      _options$redirect = options.redirect,
      redirect = _options$redirect === void 0 ? 'follow' : _options$redirect,
      restOptions = (0, _objectWithoutProperties2["default"])(options, ["headers", "method", "json", "buffer", "formData", "timeout", "redirect"]);
  var methodUpCase = method.toUpperCase();
  var finalOptions = {
    redirect: redirect,
    method: methodUpCase,
    credentials: 'include',
    headers: _objectSpread({
      'User-Agent': _GlobalInfo["default"].USER_AGENT,
      'Content-Type': 'application/json;charset=UTF-8'
    }, headers)
  };

  if (!!formData) {
    finalOptions.body = formData;
  } else if (!!Object.keys(restOptions).length) {
    if (methodUpCase === 'POST') {
      finalOptions.body = JSON.stringify(restOptions);
    } else if (methodUpCase === 'GET') {
      var prefix = url.includes('?') ? '&' : '?';
      url += prefix + _querystring["default"].stringify(restOptions);
    }
  }

  var fetchData = (0, _nodeFetch["default"])(url, finalOptions);

  if (json) {
    fetchData = fetchData.then(toJSON);
  } else if (buffer) {
    fetchData = fetchData.then(toBuffer);
  }
  /**
   * 设置自动化的超时处理
   */


  if (typeof timeout === 'number') {
    fetchData = timeoutReject(fetchData, timeout);
  }

  return fetchData;
};

var FetchWithExcept = function FetchWithExcept(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var exceptRet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    BaseResponse: {
      Ret: -1,
      ErrMsg: 'request failed'
    }
  };
  return new Promise(function (resolve) {
    Fetch(url, options).then(function (res) {
      resolve(res);
    })["catch"](function (e) {
      (0, _Log.LogError)('Request Fail!' + JSON.stringify(e));
      resolve(exceptRet);
    });
  });
};

exports.FetchWithExcept = FetchWithExcept;

function timeoutReject(promise) {
  var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var timeoutReject = new Promise(function (resolve, reject) {
    setTimeout(function () {
      return reject(new Error("Timeout Error:".concat(time, "ms")));
    }, time);
  });
  return Promise.race([promise, timeoutReject]);
}

function toJSON(response) {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText));
  }

  return response.json();
}

function toBuffer(response) {
  // 如果 response 状态异常，抛出错误
  if (response.status === 301) {
    return response.buffer();
  } //附件，图片，音频下载status=200,视频下载：206（header中加入了range）


  if (!response.ok || response.status !== 200 && response.status !== 206) {
    return Promise.reject(new Error(response.statusText));
  }

  return response.buffer();
}

var _default = Fetch;
exports["default"] = _default;