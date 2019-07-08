var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toJSON = toJSON;
exports.toBuffer = toBuffer;
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _querystring = _interopRequireDefault(require("querystring"));

var _GlobalInfo = require("./GlobalInfo");

var Fetch = function Fetch(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var headers = options.headers,
      _options$method = options.method,
      method = _options$method === void 0 ? 'GET' : _options$method,
      _options$json = options.json,
      json = _options$json === void 0 ? true : _options$json,
      _options$buffer = options.buffer,
      buffer = _options$buffer === void 0 ? false : _options$buffer,
      timeout = options.timeout,
      _options$redirect = options.redirect,
      redirect = _options$redirect === void 0 ? 'follow' : _options$redirect,
      restOptions = (0, _objectWithoutProperties2["default"])(options, ["headers", "method", "json", "buffer", "timeout", "redirect"]);
  var methodUpCase = method.toUpperCase();
  var finalOptions = {
    redirect: redirect,
    method: methodUpCase,
    credentials: 'include',
    headers: (0, _objectSpread2["default"])({
      'User-Agent': _GlobalInfo.USER_AGENT,
      'Content-Type': 'application/json;charset=UTF-8'
    }, headers)
  };

  if (!!Object.keys(restOptions).length) {
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
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText));
  }

  return response.buffer();
}

var _default = Fetch;
exports["default"] = _default;