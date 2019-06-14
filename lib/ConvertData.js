Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateInfoDict = exports.structFriendInfo = void 0;

var _Utils = require("./Utils");

/**
 * @time 2019/5/29
 */

/**
 * jiegouhua
 * @param userInfo
 */
var initFriendInfoTemplate = function initFriendInfoTemplate() {
  var friendInfoTemplate = {
    MemberList: []
  };
  ['UserName', 'City', 'DisplayName', 'PYQuanPin', 'RemarkPYInitial', 'Province', 'KeyWord', 'RemarkName', 'PYInitial', 'EncryChatRoomId', 'Alias', 'Signature', 'NickName', 'RemarkPYQuanPin', 'HeadImgUrl'].forEach(function (key) {
    return friendInfoTemplate[key] = '';
  });
  ['UniFriend', 'Sex', 'AppAccountFlag', 'VerifyFlag', 'ChatRoomId', 'HideInputBarFlag', 'AttrStatus', 'SnsFlag', 'MemberCount', 'OwnerUin', 'ContactFlag', 'Uin', 'StarFriend', 'Statues'].forEach(function (key) {
    return friendInfoTemplate[key] = 0;
  });
  return friendInfoTemplate;
};

var friendInfoTemplate = initFriendInfoTemplate();

var structFriendInfo = function structFriendInfo(userInfo) {
  var member = (0, _Utils.deepClone)(friendInfoTemplate);
  var cloneUserInfo = (0, _Utils.deepClone)(userInfo);
  Object.keys(cloneUserInfo).forEach(function (key) {
    member[key] = userInfo[key];
  });
  return member;
};
/**
 * 对象中的数组和对象不更新
 * @param oldInfoDict
 * @param newInfoDict
 */


exports.structFriendInfo = structFriendInfo;

var updateInfoDict = function updateInfoDict(oldInfoDict, newInfoDict) {
  Object.keys(newInfoDict).forEach(function (key) {
    var value = newInfoDict[key];

    if (!(0, _Utils.isArray)(value) && !(0, _Utils.isObject)(value) && !!value) {
      oldInfoDict[key] = value;
    }
  });
};

exports.updateInfoDict = updateInfoDict;