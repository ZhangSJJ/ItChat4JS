var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readAndMergeGlobalInfo = exports.saveGlobalInfo = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _GlobalInfo = _interopRequireDefault(require("./GlobalInfo"));

var _nodeJsCookie = _interopRequireDefault(require("./node-js-cookie"));

var _Log = require("./Log");

var saveGlobalInfo = function saveGlobalInfo() {
  var stream = _fs["default"].createWriteStream('hot_login_config.js', {
    encoding: 'utf8'
  });

  stream.on('error', function (err) {
    (0, _Log.LogInfo)('发生异常:' + err);
  });
  stream.on('open', function (fd) {
    (0, _Log.LogInfo)('文件已打开:', fd);
  });
  stream.on('finish', function () {
    (0, _Log.LogInfo)('写入已完成..');
  });
  stream.on('close', function () {
    (0, _Log.LogInfo)('文件已关闭！');
  });
  stream.write(JSON.stringify(_GlobalInfo["default"]));
  stream.end();
};

exports.saveGlobalInfo = saveGlobalInfo;

var readGlobalInfo = function readGlobalInfo() {
  return new Promise(function (resolve) {
    if (!_fs["default"].existsSync('hot_login_config.js')) {
      resolve(null);
    } else {
      var text = '';

      var stream = _fs["default"].createReadStream('hot_login_config.js');

      stream.on('data', function (data) {
        text += data;
      });
      stream.on('end', function () {
        resolve(text);
      });
      stream.on('err', function (err) {
        (0, _Log.LogError)('发生异常:' + err);
        resolve(null);
      });
    }
  });
};

var readAndMergeGlobalInfo =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    var fileJsonStr, fileData;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return readGlobalInfo();

          case 2:
            fileJsonStr = _context.sent;

            try {
              if (fileJsonStr) {
                fileData = JSON.parse(fileJsonStr);
                merge(_GlobalInfo["default"], fileData);

                if (_GlobalInfo["default"].LOGIN_INFO.cookies && _GlobalInfo["default"].LOGIN_INFO.cookies.cookieArr) {
                  _GlobalInfo["default"].LOGIN_INFO.cookies = new _nodeJsCookie["default"](_GlobalInfo["default"].LOGIN_INFO.cookies.cookieArr);
                }
              }
            } catch (e) {}

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function readAndMergeGlobalInfo() {
    return _ref.apply(this, arguments);
  };
}();

exports.readAndMergeGlobalInfo = readAndMergeGlobalInfo;

var merge = function merge(oldObj, newObj) {
  Object.keys(oldObj).forEach(function (key) {
    newObj[key] && (oldObj[key] = newObj[key]);
  });
};