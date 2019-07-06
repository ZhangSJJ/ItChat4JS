/**
 * @time 2019/5/31
 */

'use strict'
import { getUrlDomain, msgFormatter } from "./Utils";
import Fetch, { toJSON } from './Fetch';
import ReturnValueFormat from "./ReturnValueFormat";
import GlobalInfo from './GlobalInfo';


/**
 * 处理message
 * messages types
 * 40 msg， 43 videochat, 50 VOIPMSG, 52 voipnotifymsg，53 webwxvoipnotifymsg, 9999 sysnotice
 */
export default class Message {
    constructor(props) {
        const { on, emit, getChatRoomInfo, updateChatRoomInfo } = props;
        this.on = on;
        this.emit = emit;
        this.getChatRoomInfo = getChatRoomInfo;
        this.updateChatRoomInfo = updateChatRoomInfo;

        this.typeArr = [40, 43, 50, 52, 53, 9999];

    }

    async produceGroupMsg(msg) {
        const reg = '(@[0-9a-z]*?):<br/>(.*)$';
        const match = (msg.Content || '').match(reg);
        const chatRoomUserName = msg['FromUserName'];
        if (match) {
            const actualUserName = match[1];
            let chatRoom = this.getChatRoomInfo(chatRoomUserName);
            let member = (chatRoom.MemberList || []).find(i => i.UserName === actualUserName);
            if (!member) {
                await this.updateChatRoomInfo(chatRoomUserName);
                chatRoom = this.getChatRoomInfo(chatRoomUserName);
                member = (chatRoom.MemberList || []).find(i => i.UserName === actualUserName);
            }
            if (!member) {
                // logger.debug('chatroom member fetch failed with %s' % actualUserName);
                console.log('chatroom member fetch failed with %s' % actualUserName);
                msg['ActualNickName'] = '';
                msg['IsAt'] = false;
            } else {
                msg['ActualNickName'] = member['DisplayName'] || member['NickName'] || '';
                const chatRoomSelfUserInfo = chatRoom['Self'];
                const hasSpecialStr = msg.Content.indexOf('\u2005') !== -1;
                const atFlag = `@${chatRoomSelfUserInfo['DisplayName'] || GlobalInfo.LOGIN_INFO.selfUserInfo.NickName || ''}` + (hasSpecialStr ? '\u2005' : ' ');
                msg['IsAt'] = msg.Content.indexOf(atFlag) !== -1;
            }
            msg['ActualUserName'] = actualUserName;
            msgFormatter(msg, 'Content');
        }
    }

    produceMsg(msgList = []) {
        msgList.forEach(async msg => {
            //  get actual opposite
            if (msg.FromUserName === GlobalInfo.LOGIN_INFO.selfUserInfo.UserName) {
                msg.actualOpposite = msg.ToUserName;
            } else {
                msg.actualOpposite = msg.FromUserName;
            }

            let messageType = GlobalInfo.EMIT_NAME.FRIEND;
            // produce basic message
            if (msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1) {
                messageType = GlobalInfo.EMIT_NAME.CHAT_ROOM;
                await this.produceGroupMsg(msg)
            } else {
                msgFormatter(msg, 'Content');

            }
            this.reply(msg, messageType);
        });
    }

    reply(msg, messageType) {
        const messageFrom = msg.actualOpposite;
        let retReply = {
            type: 'Text',
            text: msg['Content'],
            isAt: msg['IsAt']
        };
        this.emit(messageType, retReply, messageFrom)
    }

}