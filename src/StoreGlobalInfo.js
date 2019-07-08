/**
 * @time 2019/7/4
 */

'use strict';
import fs from 'fs';
import GlobalInfo from './GlobalInfo';
import Cookies from "./node-js-cookie";
import { LogDebug } from './Log';

export const saveGlobalInfo = () => {
    const stream = fs.createWriteStream('hot_login_config.js', { encoding: 'utf8' });
    stream.on('error', err => {
        LogDebug('发生异常:' + err);
    });

    stream.on('open', fd => {
        LogDebug('文件已打开:', fd);
    });

    stream.on('finish', () => {
        LogDebug('写入已完成..');
    });

    stream.on('close', () => {
        LogDebug('文件已关闭！');
    });

    stream.write(JSON.stringify(GlobalInfo));

    stream.end();

};
const readGlobalInfo = () => {
    return new Promise(resolve => {
        if (!fs.existsSync('hot_login_config.js')) {
            resolve(null);
        } else {
            let text = '';
            let stream = fs.createReadStream('hot_login_config.js')
            stream.on('data', data => {
                text += data
            });
            stream.on('end', () => {
                resolve(text);
            });
            stream.on('err', err => {
                LogDebug('发生异常:' + err);
                resolve(null);
            });
        }
    })
};

export const readAndMergeGlobalInfo = async () => {
    const fileJsonStr = await readGlobalInfo();
    try {
        if (fileJsonStr) {
            const fileData = JSON.parse(fileJsonStr);
            merge(GlobalInfo, fileData)
            if (GlobalInfo.LOGIN_INFO.cookies && GlobalInfo.LOGIN_INFO.cookies.cookieArr) {
                GlobalInfo.LOGIN_INFO.cookies = new Cookies(GlobalInfo.LOGIN_INFO.cookies.cookieArr);
            }
        }

    } catch (e) {

    }
};

const merge = (oldObj, newObj) => {
    Object.keys(oldObj).forEach(key => {
        newObj[key] && (oldObj[key] = newObj[key]);
    })
};
