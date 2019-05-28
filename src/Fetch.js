import fetch from 'node-fetch';
import querystring from 'querystring'
import { USER_AGENT } from "./Config";

const Fetch = (url, options = {}) => {
    const { headers, method = 'GET', json, timeout, ...restOptions } = options;
    const methodUpCase = method.toUpperCase();

    let finalOptions = {
        method: methodUpCase,
        credentials: 'include',
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/json',
            ...headers
        },

    };

    if (!!Object.keys(restOptions).length) {
        if (methodUpCase === 'POST') {
            finalOptions.body = JSON.stringify(restOptions)
        } else if (methodUpCase === 'GET') {
            let prefix = url.includes('?') ? '&' : '?';
            url += prefix + querystring.stringify(restOptions)
        }
    }


    let fetchData = fetch(url, finalOptions);

    /**
     * 拓展字段，如果手动设置 options.json 为 false
     * 不自动 JSON.parse
     */
    if (json !== false) {
        fetchData = fetchData.then(toJSON)
    }

    /**
     * 设置自动化的超时处理
     */
    if (typeof timeout === 'number') {
        fetchData = timeoutReject(fetchData, timeout)
    }


    return fetchData
};

function timeoutReject(promise, time = 0) {
    let timeoutReject = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error(`Timeout Error:${time}ms`)), time);
    });
    return Promise.race([promise, timeoutReject]);
}

export function toJSON(response) {
    // 如果 response 状态异常，抛出错误
    if (!response.ok || response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
    }
    return response.json();
}


export default Fetch;
