/**
 * 联系人相关
 * @time 2019/5/30
 */
import { deepClone, getUrlDomain, isArray } from "./Utils";
import Fetch from "./Fetch";
import { structFriendInfo, updateInfoDict } from "./ConvertData";
import GlobalInfo from './GlobalInfo';
import { LogDebug } from "./Log";

export default class Contact {
    constructor() {
        this.chatRoomList = [];//群列表
        this.memberList = [];//好友列表
        this.mpList = [];//订阅号以及公众号
    }

    async getContact(update = false) {

        let tempMemberList = [];

        if (!update) {
            return deepClone(this.chatRoomList);
        }

        let Seq = 0;
        const batchFetchContact = async () => {
            const res = await this.getContactList(Seq);
            const { MemberList } = res;
            tempMemberList = tempMemberList.concat(MemberList || []);
            if (res.Seq !== 0) {
                await batchFetchContact();
            }
        };
        await batchFetchContact()
        const chatRoomArr = [], otherList = [];
        tempMemberList.forEach(item => {
            if (item.Sex !== 0) {
                otherList.push(item)
            } else if (item.UserName.indexOf('@@') !== -1) {
                chatRoomArr.push(item)
            } else if (item.UserName.indexOf('@') !== -1) {
                otherList.push(item)
            }
        });

        if (!!chatRoomArr.length) {
            this.updateLocalChatRoom(chatRoomArr)
        }

        if (!!otherList.length) {
            this.updateLocalFriends(otherList)
        }

        return deepClone(chatRoomArr);

    }

    getChatRoomInfo(chatRoomUserName) {
        return this.chatRoomList.find(i => i.UserName === chatRoomUserName);
    }

    getFriendInfo(userName) {
        return this.memberList.find(i => i.UserName === userName);
    }

    getMpInfo(userName) {
        return this.mpList.find(i => i.UserName === userName);
    }

    /**
     * 在所有的list中查找成员
     */
    getUseInfo(userName) {
        const fullContact = this.chatRoomList.concat(this.memberList).concat(this.mpList);
        return fullContact.find(i => i.UserName === userName);
    }

    async updateChatRoomInfo(userName) {
        if (!isArray(userName)) {
            userName = [userName];
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxbatchgetcontact?type=ex&r=${Date.now()}`;
        const params = {
            method: 'POST',
            BaseRequest: GlobalInfo.BaseRequest,
            Count: userName.length,
            List: userName.map(i => ({ ChatRoomId: '', UserName: i })),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        const res = await Fetch(url, params);
        if (res.BaseResponse && res.BaseResponse.Ret === 0) {
            this.updateLocalChatRoom(res.ContactList);
        }
    }

    async updateFriendInfo(userName) {
        if (!isArray(userName)) {
            userName = [userName];
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxbatchgetcontact?type=ex&r=${Date.now()}`;
        const params = {
            method: 'POST',
            BaseRequest: GlobalInfo.BaseRequest,
            Count: userName.length,
            List: userName.map(i => ({ EncryChatRoomId: '', UserName: i })),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        const res = await Fetch(url, params);
        if (res.BaseResponse && res.BaseResponse.Ret === 0) {
            this.updateLocalFriends(res.ContactList);
        }
    }

    async getContactList(seq = 0) {
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetcontact?r=${Date.now()}&seq=${seq}&skey=${GlobalInfo.LOGIN_INFO['skey']}`;
        return Fetch(url, {
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            },
        });
    }

    updateLocalChatRoom(roomList = []) {
        roomList.forEach(chatRoom => {
            let oldChatRoom = this.chatRoomList.find(i => i.UserName === chatRoom['UserName']);
            //更新chatRoom的信息（除了MemberList）
            if (oldChatRoom) {
                updateInfoDict(oldChatRoom, chatRoom);
                chatRoom.MemberList = chatRoom.MemberList || [];
                oldChatRoom.MemberList = oldChatRoom.MemberList || [];
                const memberList = chatRoom.MemberList;
                const oldMemberList = oldChatRoom.MemberList;
                //更新chatRoom的MemberList中的每一个member信息
                memberList.forEach(member => {
                    const oldMember = oldMemberList.find(i => i.UserName === member.UserName);
                    if (oldMember) {
                        updateInfoDict(oldMember, member);
                    } else {
                        oldMemberList.push(member);
                    }
                });
            } else {
                chatRoom.myDefinedUserType = GlobalInfo.EMIT_NAME.CHAT_ROOM;
                this.chatRoomList.push(chatRoom);
                oldChatRoom = chatRoom;
            }

            const memberList = chatRoom.MemberList || [];
            const oldMemberList = oldChatRoom.MemberList || [];
            //更新MemberList信息（删除某些不存在的member）
            if (!!memberList.length && memberList.length !== oldMemberList.length) {
                const existsUserNames = (memberList).map(i => i.UserName);
                oldMemberList.forEach(item => {
                    if (existsUserNames.indexOf(item.UserName) === -1) {
                        item.isDelete = true;
                    }
                });
                oldChatRoom.MemberList = oldMemberList.filter(i => !i.isDelete)
            }
            //update OwnerUin
            if (oldChatRoom.ChatRoomOwner && !!oldMemberList.length) {
                const owner = oldMemberList.find(i => i.UserName === oldChatRoom.ChatRoomOwner);
                oldChatRoom.OwnerUin = (owner || {}).Uin || 0;
            }
            //update IsAdmin
            if (!!oldChatRoom.OwnerUin) {
                oldChatRoom.IsAdmin = oldChatRoom.OwnerUin === GlobalInfo.LOGIN_INFO['wxuin']
            }
            //update Self
            const newSelf = oldMemberList.find(i => i.UserName === GlobalInfo.LOGIN_INFO.selfUserInfo.UserName);
            oldChatRoom['Self'] = newSelf || deepClone(GlobalInfo.LOGIN_INFO.selfUserInfo)
        });

        const Text = roomList.map(i => i.UserName);
        return {
            Type: 'System',
            Text,
            SystemInfo: 'chatrooms',
            FromUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            ToUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
        }
    }

    updateLocalFriends(friendList = []) {
        const fullList = this.memberList.concat(this.mpList);
        friendList.forEach(friend => {
            let oldInfoDict = fullList.find(i => i.UserName === friend['UserName']);
            if (!oldInfoDict) {
                oldInfoDict = deepClone(friend);
                if ((oldInfoDict['VerifyFlag'] & 8) === 0) {
                    oldInfoDict.myDefinedUserType = GlobalInfo.EMIT_NAME.FRIEND;
                    this.memberList.push(oldInfoDict)
                } else {
                    oldInfoDict.myDefinedUserType = GlobalInfo.EMIT_NAME.MASSIVE_PLATFORM;
                    this.mpList.push(oldInfoDict)
                }
            } else {
                updateInfoDict(oldInfoDict, friend)
            }
        })
    }

    updateLocalUin(msg) {
        const usernameChangedList = [];
        let ret = {
            'Type': 'System',
            'Text': usernameChangedList,
            'SystemInfo': 'uins',
        };
        msg = msg || { Content: '' };
        const reg = '<username>([^<]*?)<';
        const match = msg['Content'].match(reg);
        if (match && match[1]) {
            const uins = match[1].split(',');
            const usernames = msg['StatusNotifyUserName'].split(',');
            if (!!uins.length && !!usernames.length && uins.length === usernames.length) {
                uins.forEach(async (uin, index) => {
                    const username = usernames[index];
                    if (username.indexOf('@') === -1) {
                        return;
                    }
                    const userInfo = this.getUseInfo(username);
                    if (userInfo) {
                        if ((userInfo['Uin'] || 0) === 0) {
                            userInfo['Uin'] = uin;
                            usernameChangedList.push(username);
                            LogDebug('Uin fetched: ' + username + ', ' + uin);
                        } else if (userInfo['Uin'] !== uin) {
                            LogDebug('Uin changed: ' + userInfo['Uin'] + ', ' + uin);
                        }
                    } else {
                        if (username.indexOf('@@') !== -1) {
                            await updateChatRoomInfo(username);
                            let newChatRoomInfo = this.getChatRoomInfo(username);
                            if (!newChatRoomInfo) {
                                newChatRoomInfo = structFriendInfo({
                                    'UserName': username,
                                    'Uin': uin,
                                    'Self': deepClone(GlobalInfo.LOGIN_INFO.selfUserInfo)
                                });
                                this.chatRoomList.push(newChatRoomInfo)
                            } else {
                                newChatRoomInfo['Uin'] = uin
                            }
                        } else if (username.indexOf('@') !== -1) {
                            await this.updateFriendInfo(username)
                            let newFriendInfo = this.getFriendInfo(username);
                            if (!newFriendInfo) {
                                newFriendInfo.structFriendInfo({
                                    'UserName': username,
                                    'Uin': uin,
                                });
                                this.memberList.push(newFriendInfo);
                            } else {
                                newFriendInfo['Uin'] = uin;
                            }

                        }
                        usernameChangedList.push(username);
                        LogDebug('Uin fetched: ' + username + ',  ' + uin)
                    }
                })
            } else {
                LogDebug('Wrong length of uins & usernames: ' + uins.length + ',' + usernames.length);
            }
        } else {
            LogDebug('No uins in 51 message');
            LogDebug(msg['Content'])
        }

        return ret;
    }
}