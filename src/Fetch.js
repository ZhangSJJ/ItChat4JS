import fetch from 'node-fetch';
import querystring from 'querystring'
import GlobalInfo from "./GlobalInfo";
import { LogError } from "./Log";

const Fetch = (url, options = {}) => {
    const { headers, method = 'GET', json = true, buffer = false, formData = null, timeout, redirect = 'follow', ...restOptions } = options;
    const methodUpCase = method.toUpperCase();

    let finalOptions = {
        redirect,
        method: methodUpCase,
        credentials: 'include',
        headers: {
            'User-Agent': GlobalInfo.USER_AGENT,
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
        },

    };

    if (!!formData) {
        finalOptions.body = formData;
    } else if (!!Object.keys(restOptions).length) {
        if (methodUpCase === 'POST') {
            finalOptions.body = JSON.stringify(restOptions)
        } else if (methodUpCase === 'GET') {
            let prefix = url.includes('?') ? '&' : '?';
            url += prefix + querystring.stringify(restOptions)
        }
    }


    let fetchData = fetch(url, finalOptions);


    if (json) {
        fetchData = fetchData.then(toJSON)
    } else if (buffer) {
        fetchData = fetchData.then(toBuffer)
    }

    /**
     * 设置自动化的超时处理
     */
    if (typeof timeout === 'number') {
        fetchData = timeoutReject(fetchData, timeout)
    }


    return fetchData
};

export const FetchWithExcept = (url, options = {}, exceptRet = {
    BaseResponse: {
        Ret: -1,
        ErrMsg: 'request failed'
    }
}) => {
    return new Promise(resolve => {
        Fetch(url, options).then(res => {
            resolve(res)
        }).catch(e => {
            LogError('Request Fail!' + JSON.stringify(e));
            resolve(exceptRet)
        })
    })
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


export function toBuffer(response) {
    // 如果 response 状态异常，抛出错误
    if (response.status === 301) {
        return response.buffer();
    }
    //附件，图片，音频下载status=200,视频下载：206（header中加入了range）
    if (!response.ok || (response.status !== 200 && response.status !== 206)) {
        return Promise.reject(new Error(response.statusText));
    }
    return response.buffer();
}

export default Fetch;
