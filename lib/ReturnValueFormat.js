var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/**
 * 请求返回值格式化
 * @time 2019/5/30
 */
var TRANSLATE = 'Chinese';
var TRANSLATION = {
  Chinese: {
    '-1000': '返回值不带BaseResponse',
    '-1001': '无法找到对应的成员',
    '-1002': '文件位置错误',
    '-1003': '服务器拒绝连接',
    '-1004': '服务器返回异常值',
    '-1005': '参数错误',
    '-1006': '无效操作',
    '0': '请求成功'
  }
};

var ReturnValueFormat = /*#__PURE__*/function () {
  function ReturnValueFormat() {
    var _this = this;

    var resDict = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, ReturnValueFormat);
    this.values = {};
    Object.keys(resDict).forEach(function (key) {
      return _this.values[key] = resDict[key];
    });
    this.init();
  }

  (0, _createClass2["default"])(ReturnValueFormat, [{
    key: "init",
    value: function init() {
      if (!this.values['BaseResponse']) {
        this.values['BaseResponse'] = {
          'ErrMsg': 'no BaseResponse in raw response',
          'Ret': -1000
        };
      }

      if (!TRANSLATE) {
        return;
      }

      this.values['BaseResponse']['RawMsg'] = this.values['BaseResponse']['RawMsg'] || '';
      var ret = this.values['BaseResponse']['Ret'];
      this.values['BaseResponse']['ErrMsg'] = this.values['BaseResponse']['ErrMsg'] || 'No ErrMsg';

      if (TRANSLATION[TRANSLATE][ret]) {
        this.values['BaseResponse']['ErrMsg'] = TRANSLATION[TRANSLATE][ret];
      }

      this.values['BaseResponse']['RawMsg'] = this.values['BaseResponse']['RawMsg'] || this.values['BaseResponse']['ErrMsg'];
    }
  }, {
    key: "bool",
    value: function bool() {
      return +this.values['BaseResponse']['Ret'] === 0;
    }
  }, {
    key: "value",
    value: function value() {
      return this.values;
    }
  }]);
  return ReturnValueFormat;
}();

exports["default"] = ReturnValueFormat;