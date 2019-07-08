var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogMark = exports.LogFatal = exports.LogError = exports.LogWarn = exports.LogInfo = exports.LogDebug = exports.LogTrace = void 0;

var _log4js = _interopRequireDefault(require("log4js"));

var createLog = function createLog(level) {
  var logger = _log4js["default"].getLogger("NodeWeChat-".concat(level.toUpperCase()));

  logger.level = level;
  var isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? function () {} : logger[level].bind(logger);
};

var LogTrace = createLog('trace');
exports.LogTrace = LogTrace;
var LogDebug = createLog('debug');
exports.LogDebug = LogDebug;
var LogInfo = createLog('info');
exports.LogInfo = LogInfo;
var LogWarn = createLog('warn');
exports.LogWarn = LogWarn;
var LogError = createLog('error');
exports.LogError = LogError;
var LogFatal = createLog('fatal');
exports.LogFatal = LogFatal;
var LogMark = createLog('mark');
exports.LogMark = LogMark;