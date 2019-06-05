/**
 * @time 2019/5/29
 */


'use strict';
import { deepClone, isArray, isObject } from "./Utils";

/**
 * jiegouhua
 * @param userInfo
 */

const initFriendInfoTemplate = () => {
    const friendInfoTemplate = { MemberList: [] };
    ['UserName', 'City', 'DisplayName', 'PYQuanPin', 'RemarkPYInitial', 'Province',
        'KeyWord', 'RemarkName', 'PYInitial', 'EncryChatRoomId', 'Alias', 'Signature',
        'NickName', 'RemarkPYQuanPin', 'HeadImgUrl'].forEach(key => (friendInfoTemplate[key] = ''));

    ['UniFriend', 'Sex', 'AppAccountFlag', 'VerifyFlag', 'ChatRoomId', 'HideInputBarFlag',
        'AttrStatus', 'SnsFlag', 'MemberCount', 'OwnerUin', 'ContactFlag', 'Uin',
        'StarFriend', 'Statues'].forEach(key => (friendInfoTemplate[key] = 0));
    return friendInfoTemplate;
};

const friendInfoTemplate = initFriendInfoTemplate();

export const structFriendInfo = (userInfo) => {
    const member = deepClone(friendInfoTemplate);
    const cloneUserInfo = deepClone(userInfo);
    Object.keys(cloneUserInfo).forEach(key => {
        member[key] = userInfo[key]
    });
    return member
};

/**
 * 对象中的数组和对象不更新
 * @param oldInfoDict
 * @param newInfoDict
 */
export const updateInfoDict = (oldInfoDict, newInfoDict) => {
    Object.keys(newInfoDict).forEach(key => {
        const value = newInfoDict[key];
        if (!isArray(value) && !isObject(value) && !!value) {
            oldInfoDict[key] = value;
        }
    })
};