/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/5/27
 */
'use strict';
export const whileDoing = (doingFn, intervalTime = 1000) => {
    return setInterval(async () => {
        await doingFn();
    }, intervalTime);
};