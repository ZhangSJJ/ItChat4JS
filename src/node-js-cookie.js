/*!
 * copy code from js-cookie
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */

class Cookie {
    constructor(cookieStr) {
        //cookie "xxx=xxx; path=/; expires=Fri, 13 May 2022 05:27:48 GMT; domain=xxx"
        if (!cookieStr || typeof cookieStr !== 'string') {
            throw new Error('new Cookie must transmit a string');
        }
        this.cookieStr = cookieStr;
        this.initCookie();

    }

    initCookie() {
        const arr = this.cookieStr.split(';');
        this.cookie = arr.splice(0, 1).join('');
        let [key, value] = this.cookie.split('=');
        this.key = key && key.trim();
        this.value = value && value.trim();

        arr.forEach(cookieStr => {
            let [key, value] = cookieStr.split('=');
            key = key && key.trim();
            value = value && value.trim();
            if (key === 'Secure') {
                this.isSecure = true;
            } else {
                this[key.toLowerCase()] = value
            }

        })
    }

    getValue(domain) {
        if (!domain && this.domain) {
            return '';
        }
        const isHttps = domain.startsWith('https');
        if (!isHttps && this.isSecure) {
            return '';
        }
        const now = Date.now();
        if (this.expires) {
            const expires = (new Date(this.expires)).getTime();
            if (now >= expires) {
                return '';
            }
        }
        if (this.domain && domain.indexOf(this.domain) === -1) {
            return '';
        }

        return this.cookie || ''
    }
}

export default class Cookies {
    constructor(cookieArr = []) {
        this.cookies = {};
        cookieArr.forEach(str => {
            const cookie = new Cookie(str);
            this.cookies[cookie.key] = cookie;
        });
    }

    get(key, domain) {
        if (!key || !this.cookies[key]) {
            return '';
        }
        return this.cookies[key].getValue(domain)
    }

    getValue(key, domain) {
        if (!key || !this.cookies[key]) {
            return '';
        }
        return this.cookies[key].getValue(domain).split('=')[1]
    }

    getAll(domain) {
        const keys = Object.keys(this.cookies);
        if (!keys || !keys.length) {
            return '';
        }
        const cookieArr = keys.map(key => {
            const cookie = this.cookies[key];
            return cookie.getValue(domain)
        }).filter(i => !!i);

        return cookieArr.join(';')
    }

    set(key, value, attributes) {
        attributes = {
            path: '/',
            ...attributes,
        };
        const isSecure = attributes.secure;
        if (typeof attributes.expires === 'number') {
            const expires = new Date();
            expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
            attributes.expires = expires;
        }

        // We're using "expires" because "max-age" is not supported by IE
        attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';
        let cookieStr = '';
        Object.keys(attributes).forEach(key => {
            cookieStr += ';' + key + '=' + attributes[key];
        });

        if (isSecure) {
            cookieStr += ';' + 'Secure';
        }
        this.cookies[key] = new Cookie(key + '=' + value + cookieStr)
    }
}

