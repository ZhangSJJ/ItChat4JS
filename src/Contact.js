/**
 * 联系人相关
 * @time 2019/5/30
 */
import { deepClone, getUrlDomain, isArray } from "./Utils";
import Fetch from "./Fetch";
import { structFriendInfo, updateInfoDict } from "./ConvertData";
import GlobalInfo from './GlobalInfo';
import { LogDebug, LogError } from "./Log";

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
        const nameIsArray = isArray(chatRoomUserName);
        if (!nameIsArray) {
            chatRoomUserName = [chatRoomUserName]
        }
        const filterRet = this.chatRoomList.filter(i => chatRoomUserName.indexOf(i.UserName) !== -1 || chatRoomUserName.indexOf(i.NickName) !== -1 || chatRoomUserName.indexOf(i.RemarkName) !== -1);
        if (nameIsArray) {
            return filterRet;
        }

        return filterRet[0];
    }

    getFriendInfo(userName) {
        const nameIsArray = isArray(userName);
        if (!nameIsArray) {
            userName = [userName]
        }
        const filterRet = this.memberList.filter(i => userName.indexOf(i.UserName) !== -1 || userName.indexOf(i.NickName) !== -1 || userName.indexOf(i.RemarkName) !== -1);
        if (nameIsArray) {
            return filterRet;
        }
        return filterRet[0];
    }

    getMpInfo(userName) {
        const nameIsArray = isArray(userName);
        if (!nameIsArray) {
            userName = [userName]
        }
        const filterRet = this.mpList.filter(i => userName.indexOf(i.UserName) !== -1 || userName.indexOf(i.NickName) !== -1 || userName.indexOf(i.RemarkName) !== -1);
        if (nameIsArray) {
            return filterRet;
        }
        return filterRet[0];
    }

    /**
     * 在所有的list中查找成员
     * 可以通过UserName，NickName，RemarkName 获取好友信息
     * @param name
     * @returns {*}
     */
    getContactInfoByName(name) {
        const fullContact = this.chatRoomList.concat(this.memberList).concat(this.mpList);
        if (!name) {
            return fullContact;
        }
        const nameIsArray = isArray(name);
        if (!nameIsArray) {
            name = [name]
        }
        const filterRet = fullContact.filter(i => name.indexOf(i.UserName) !== -1 || name.indexOf(i.NickName) !== -1 || name.indexOf(i.RemarkName) !== -1);
        if (nameIsArray) {
            return filterRet;
        }
        return filterRet[0];
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

        const chatRoomInfoArr = this.getChatRoomInfo(res.ContactList.map(i => i.UserName));

        return chatRoomInfoArr.length > 1 ? chatRoomInfoArr : chatRoomInfoArr[0]
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
            if (!chatRoom['UserName']) {
                return;
            }
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
                const existsUserNames = memberList.map(i => i.UserName);
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
                    const userInfo = this.getContactInfoByName(username);
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
                            await this.updateChatRoomInfo(username);
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
                                newFriendInfo = structFriendInfo({
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

    /**
     * for adding status should be 2
     * for accepting status should be 3
     * @param userName
     * @param status
     * @param verifyContent
     * @param autoUpdate
     * @returns {Promise.<*>}
     */
    async verifyFriend(userName, status = 2, verifyContent = '', autoUpdate = true) {
        LogDebug('Add a friend or accept a friend');
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxverifyuser`;
        const params = {
            method: 'post',
            r: Date.now(),
            pass_ticket: GlobalInfo.LOGIN_INFO.pass_ticket,
            BaseRequest: GlobalInfo.BaseRequest,
            Opcode: status,
            VerifyUserListSize: 1,
            VerifyUserList: [{
                Value: userName,
                VerifyUserTicket: '',
            }],
            VerifyContent: verifyContent,
            SceneListCount: 1,
            SceneList: [33],
            skey: GlobalInfo.LOGIN_INFO['skey'],
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        const res = await Fetch(url, params);
        LogDebug(res);

        if (autoUpdate) {
            await this.updateFriendInfo(userName)
        }
        return res;
    }


    /**
     * 设置别名(好友)
     * @param userName
     * @param alias
     * @returns {Promise.<void>}
     */
    async setAlias(userName, alias = '') {
        const oldFriendInfo = this.getFriendInfo(userName);
        if (!oldFriendInfo) {
            LogError('You Do Not Have A Friend Named :' + userName);
            return;
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxoplog?lang=zh_CN&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            method: 'post',
            UserName: userName,
            CmdId: 2,
            RemarkName: alias,
            BaseRequest: GlobalInfo.BaseRequest,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        return await Fetch(url, params);
    }

    /**
     * 置顶好友
     * @param userName
     * @param isPinned
     * @returns {Promise.<*>}
     */
    async setPinned(userName, isPinned = true) {
        const oldFriendInfo = this.getContactInfoByName(userName);
        if (!oldFriendInfo) {
            LogError('You Do Not Have A Friend, Chat Room Or Massive Platform Named :' + userName);
            return;
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxoplog?pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            method: 'post',
            UserName: userName,
            CmdId: 3,
            OP: +isPinned,
            BaseRequest: GlobalInfo.BaseRequest,
            RemarkName: oldFriendInfo.RemarkName,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        return await Fetch(url, params);
    }


    /**
     * 创建群聊
     * @param memberList
     * @param topic
     * @returns {Promise.<*>}
     */
    async createChatRoom(memberList, topic = '') {
        if (!memberList || !memberList.length) {
            LogError('None Member To Add To Create A ChatRoom!');
            return;
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxcreatechatroom?pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}&r=${Date.now()}`;
        const params = {
            method: 'post',
            BaseRequest: GlobalInfo.BaseRequest,
            MemberCount: memberList.length,
            MemberList: memberList.map(member => ({ UserName: member['UserName'] })),
            Topic: topic,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        return await Fetch(url, params);
    };

    async setChatRoomName(chatRoomUserName, name) {
        const oldChatRoomInfo = this.getChatRoomInfo(chatRoomUserName);
        if (!oldChatRoomInfo) {
            LogError('You Are Not In A Chat Room Named :' + chatRoomUserName);
            return;
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxupdatechatroom?fun=modtopic&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            method: 'post',
            BaseRequest: GlobalInfo.BaseRequest,
            ChatRoomName: chatRoomUserName,
            NewTopic: name,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        return await Fetch(url, params);
    }

    /**
     * todo 删除群成员总是返回Ret：1不成功（网页版也不成功）
     * @param chatRoomUserName
     * @param memberList
     * @returns {Promise.<*>}
     */
    async deleteMemberFromChatRoom(chatRoomUserName, memberList) {
        if (!isArray(memberList)) {
            memberList = [memberList];
        }
        const oldChatRoomInfo = this.getChatRoomInfo(chatRoomUserName);
        if (!oldChatRoomInfo) {
            LogError('You Are Not In A Chat Room Named :' + chatRoomUserName);
            return;
        }
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxupdatechatroom?fun=delmember&lang=zh_CN&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            method: 'post',
            BaseRequest: GlobalInfo.BaseRequest,
            ChatRoomName: chatRoomUserName,
            DelMemberList: memberList.map(member => member['UserName']).join(','),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        return await Fetch(url, params);
    }

    /**
     * add or invite member into chatroom
     * there are two ways to get members into chatroom: invite or directly add
     * but for chatrooms with more than 40 users, you can only use invite
     * but don't worry we will auto-force userInvitation for you when necessary
     * @param chatRoomUserName
     * @param memberList
     * @param useInvitation
     */
    async addMemberIntoChatRoom(chatRoomUserName, memberList, useInvitation = false) {

        if (!useInvitation) {
            let oldChatRoomInfo = this.getChatRoomInfo(chatRoomUserName);
            if (!oldChatRoomInfo) {
                oldChatRoomInfo = this.updateChatRoomInfo(chatRoomUserName);
                if (!oldChatRoomInfo) {
                    LogError('You Are Not In A Chat Room Named :' + chatRoomUserName);
                    return;
                }
                useInvitation = oldChatRoomInfo['MemberList'].length > GlobalInfo.LOGIN_INFO['InviteStartCount']
            }
        }

        let fun = 'addmember', memberKeyName = 'AddMemberList';
        if (useInvitation) {
            fun = 'invitemember';
            memberKeyName = 'InviteMemberList';
        }

        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxupdatechatroom?fun=${fun}&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            method: 'post',
            BaseRequest: GlobalInfo.BaseRequest,
            ChatRoomName: chatRoomUserName,
            [memberKeyName]: memberList.map(member => member['UserName']).join(','),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        return await Fetch(url, params);
    }

}

