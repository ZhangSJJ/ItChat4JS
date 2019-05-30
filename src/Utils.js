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


export const deepClone = data => {
    const type = Object.prototype.toString.call(data);
    let result = {};
    if (type === '[object Array]') {
        result = [];
    } else if (type === '[object Object]') {
        result = {};
    } else {
        return data;
    }

    if (type === '[object Array]') {
        data.forEach(item => {
            result.push(deepClone(item));
        })
    }
    if (type === '[object Object]') {
        Object.keys(data).forEach(key => {
            result[key] = deepClone(data[key]);
        })
    }
    return result;
};
