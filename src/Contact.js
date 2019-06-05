/**
 * 联系人相关
 * @time 2019/5/30
 */


'use strict';
import { deepClone, getUrlDomain } from "./Utils";
import Fetch from "./Fetch";
import { updateInfoDict } from "./ConvertData";

export default class Contact {
    constructor(store) {
        this.store = store;
        this.chatroomList = [];//群列表
        this.memberList = [];//好友列表
        this.mpList = [];
    }

    async getContact(update = false) {
        if (!update) {
            return deepClone(this.chatroomList);
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
        const chatroomArr = [], otherList = [];
        this.memberList.forEach(item => {
            if (item.Sex !== 0) {
                otherList.push(item)
            } else if (item.UserName.indexOf('@@') !== -1) {
                chatroomArr.push(item)
            } else if (item.UserName.indexOf('@') !== -1) {
                otherList.push(item)
            }
        });

        if (!!chatroomArr.length) {
            this.updateLocalChatroom(chatroomArr)
        }

        if (!!otherList.length) {
            this.updateLocalFriends(otherList)
        }

        return deepClone(chatroomArr);

    }

    async getContactList(seq = 0) {
        const url = `${this.store.loginUrl}/webwxgetcontact?r=${Date.now()}&seq=${seq}&skey=${this.store.loginInfo['skey']}`;
        return Fetch(url, {
            headers: {
                cookie: this.store.cookies.getAll(getUrlDomain(url))
            },
        });
    }

    updateLocalChatroom(roomList = []) {
        roomList.forEach(chatroom => {
            let oldChatroom = this.chatroomList.find(i => i.UserName === chatroom['UserName']);
            //更新chatroom的信息（除了MemberList）
            if (oldChatroom) {
                updateInfoDict(oldChatroom, chatroom);
                chatroom.MemberList = chatroom.MemberList || [];
                oldChatroom.MemberList = oldChatroom.MemberList || [];
                const memberList = chatroom.MemberList;
                const oldMemberList = oldChatroom.MemberList;

                //更新chatroom的MemberList中的每一个member信息
                memberList.forEach(member => {
                    const oldMember = oldMemberList.find(i => i.UserName = member.UserName);
                    if (oldMember) {
                        updateInfoDict(oldMember, member);
                    } else {
                        oldMemberList.push(member);
                    }
                })
            } else {
                this.chatroomList.push(chatroom);
                oldChatroom = chatroom;
            }

            const memberList = chatroom.MemberList || [];
            const oldMemberList = oldChatroom.MemberList || [];
            //更新MemberList信息（删除某些不存在的member）
            if (!!memberList.length && memberList.length !== oldMemberList.length) {
                const existsUserNames = (memberList).map(i => i.UserName);
                oldMemberList.forEach(item => {
                    if (existsUserNames.indexOf(item.UserName) === -1) {
                        item.isDelete = true;
                    }
                });
                oldChatroom.MemberList = oldMemberList.filter(i => !i.isDelete)
            }
            //update OwnerUin
            if (oldChatroom.ChatRoomOwner && !!oldMemberList.length) {
                const owner = oldMemberList.find(i => i.UserName === oldChatroom.ChatRoomOwner);
                oldChatroom.OwnerUin = (owner || {}).Uin || 0;
            }
            //update IsAdmin
            if (!!oldChatroom.OwnerUin) {
                oldChatroom.IsAdmin = oldChatroom.OwnerUin === this.store.loginInfo['wxuin']
            }
            //update Self
            const newSelf = oldMemberList.find(i => i.UserName === this.store.storageClass.userName);
            oldChatroom['Self'] = newSelf || deepClone(this.store.loginInfo['User'])
        });

        const Text = roomList.map(i => i.UserName);
        return {
            Type: 'System',
            Text,
            SystemInfo: 'chatrooms',
            FromUserName: this.store.storageClass.userName,
            ToUserName: this.store.storageClass.userName,
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