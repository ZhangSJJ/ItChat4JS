/**
 * 联系人相关
 * @time 2019/5/30
 */
import { deepClone, getUrlDomain, isArray } from "./Utils";
import Fetch from "./Fetch";
import { updateInfoDict } from "./ConvertData";
import GlobalInfo from './GlobalInfo';

export default class Contact {
    constructor() {
        this.chatRoomList = [];//群列表
        this.memberList = [];//好友列表
        this.mpList = [];//订阅号以及公众号
    }

    async getContact(update = false) {
        if (!update) {
            return deepClone(this.chatRoomList);
        }

        let Seq = 0;
        const batchFetchContact = async () => {
            const res = await this.getContactList(Seq);
            const { MemberList } = res;
            this.memberList = this.memberList.concat(MemberList || []);
            if (res.Seq !== 0) {
                await batchFetchContact();
            }
        };
        await batchFetchContact()
        const chatRoomArr = [], otherList = [];
        this.memberList.forEach(item => {
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
        return this.chatRoomList.find(i => i.UserName === chatRoomUserName) || {}
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
            oldChatRoom['Self'] = newSelf || deepClone(GlobalInfo.LOGIN_INFO['User'])
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
                if (oldInfoDict['VerifyFlag'] & 8 === 0) {
                    this.memberList.push(oldInfoDict)
                } else {
                    this.mpList.push(oldInfoDict)
                }
            } else {
                updateInfoDict(oldInfoDict, friend)
            }
        })
    }
}