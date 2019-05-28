import fetch from 'node-fetch';

const Fetch = (url, options = {}) => {
    const { method, ...restOptions } = options;

    let finalOptions = {
        method: method || 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...restOptions.headers
        },

    };
    if (Object.keys(restOptions).length) {
        finalOptions.body = JSON.stringify(restOptions)
    }
    /**
     * 浏览器端的 fetch 有 credentials: 'include'，会自动带上 cookie
     * 服务端得手动设置，可以从 context 对象里取 cookie
     */

    let fetchData = fetch(url, finalOptions)

    /**
     * 拓展字段，如果手动设置 options.json 为 false
     * 不自动 JSON.parse
     */
    // if (restOptions.json !== false) {
    //     fetchData = fetchData.then(toJSON)
    // }

    /**
     * 设置自动化的超时处理
     */
    if (typeof restOptions.timeout === 'number') {
        fetchData = timeoutReject(fetchData, restOptions.timeout)
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
