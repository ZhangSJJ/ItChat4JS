/**
 * @time 2019/5/27
 */
'use strict';

export class WhileDoing {
    constructor(doingFn, intervalTime = 1000) {
        this.doingFn = doingFn;
        this.intervalTime = intervalTime;
        this.doId = null;
        this.endFlag = false;
    }

    start() {
        const doFn = async () => {
            this.clearId();
            await this.doingFn();
            this.doId = setTimeout(async () => {
                if (this.endFlag) {
                    this.clearId();
                    return;
                }
                await doFn();
            }, this.intervalTime)
        };
        doFn();
    }

    end() {
        this.endFlag = true;
    }

    clearId() {
        this.doId && clearTimeout(this.doId);
        this.doId = null;
    }
}

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

export const isArray = data => {
    return Object.prototype.toString.call(data) === '[object Array]';
};

export const isObject = data => {
    return Object.prototype.toString.call(data) === '[object Object]';
};

export const escape = (str = '') => {
    str = '' + str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};

export const unescape = (str = '') => {
    str = '' + str;
    return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
};

export const msgFormatter = (data, key) => {
    //todo
    // emoji_formatter(data, key)
    data[key] = (data[key] + '').replace('<br/>', '\n');
    data[key] = unescape(data[key]);
};



