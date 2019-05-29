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

export const getUrlDomain = (url) => {
    if (!url) {
        return '';
    }
    const urlArr = url.split('//');
    const protocol = urlArr[0];
    if (!urlArr[1]) {
        return protocol + '//';
    }
    const hostname = urlArr[1].split('/')[0];
    if (!hostname) {
        return protocol + '//';
    }
    return [protocol, hostname].join('//');
};