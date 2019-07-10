/**
 * @time 2019/7/8
 */
'use strict';

import log4js from 'log4js';

const createLog = (level) => {
    const logger = log4js.getLogger(`NodeWeChat-${level.toUpperCase()}`);
    logger.level = level;

    return logger[level].bind(logger);
};

const isProduction = process.env.NODE_ENV === 'production';

export const LogTrace = createLog('trace');
export const LogDebug = isProduction ? () => {
} : createLog('debug');
export const LogInfo = createLog('info');
export const LogWarn = createLog('warn');
export const LogError = createLog('error');
export const LogFatal = createLog('fatal');
export const LogMark = createLog('mark');


