import { EmojiCodeMap, MissMatchEmoji } from "./ConstValues";

/**
 * @time 2019/5/27
 */

export class WhileDoing {
    constructor(doingFn, intervalTime = 1000) {
        this.doingFn = doingFn;
        this.intervalTime = intervalTime;
        this.doId = null;
        this.endFlag = false;
    }

    async start() {
        const doFn = async () => {
            this.clearId();
            await this.doingFn();
            const promise = new Promise(resolve => {
                this.doId = setTimeout(async () => {
                    if (this.endFlag) {
                        this.clearId();
                        resolve();
                        return;
                    }
                    await doFn();
                    resolve();
                }, this.intervalTime)
            });
            await promise;
        };
        await doFn();
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

export const emojiFormatter = (data, key) => {
    if (!data[key]) {
        return;
    }
    const regA = /\<span class="emoji emoji(.{1,10})"\>\<\/span\>/g;
    const reg = /\<span class="emoji emoji(.{1,10})"\>\<\/span\>/;

    (data[key].match(regA) || []).forEach(str => {
        const match = str.match(reg);
        if (match && match[0] && match[1]) {
            let emojiCode = MissMatchEmoji[match[1]] || match[1];
            !!emojiCode && EmojiCodeMap[emojiCode] && (data[key] = data[key].replace(match[0], EmojiCodeMap[emojiCode]))
        }
    })
};

export const msgFormatter = (data, key) => {
    emojiFormatter(data, key);
    data[key] = (data[key] + '').replace('<br/>', '\n');
    data[key] = unescape(data[key]);
};

/**
 * 将时间转换为 yyyy-MM-dd HH:mm:ss 格式的字符串
 * @param date
 * @returns {string}
 */
export const convertDate = (date) => {
    date = date || new Date();
    return [date.getFullYear(), '-', ('00' + (date.getMonth() + 1)).slice(-2), '-', ('00' + date.getDate()).slice(-2), ' ', ('00' + date.getHours()).slice(-2), ':', ('00' + date.getMinutes()).slice(-2), ':', ('00' + date.getSeconds()).slice(-2)].join('')
};

export const getDeviceID = () => {
    return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
};
