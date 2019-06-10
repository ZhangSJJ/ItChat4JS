/**
 * @time 2019/5/31
 */


'use strict';
import { getUrlDomain, msgFormatter } from "./Utils";
import Fetch, { toJSON } from './Fetch';
import ReturnValueFormat from "./ReturnValueFormat";

/**
 * 处理message
 * messages types
 * 40 msg， 43 videochat, 50 VOIPMSG, 52 voipnotifymsg，53 webwxvoipnotifymsg, 9999 sysnotice
 */
export default class Message {
    constructor(props) {
        const { store, friendReplyInfo, groupReplyInfo } = props;
        this.messageList = [];
        this.store = store;
        this.typeArr = [40, 43, 50, 52, 53, 9999];
        this.groupMsgList = [];
        this.friendMsgList = [];
        this.friendReplyInfo = friendReplyInfo;
        this.groupReplyInfo = groupReplyInfo;
    }


    produceMsg(msgList = []) {
        msgList.forEach(msg => {
            //  get actual opposite
            if (msg.FromUserName === this.store.storageClass.userName) {
                this.actualOpposite = msg.ToUserName;
            } else {
                this.actualOpposite = msg.FromUserName;
            }

            // produce basic message
            if (msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1) {
                //todo
                // produce_group_chat(core, m)
            } else {
                msgFormatter(msg, 'Content')
            }

        });
    }

    appendMsg(message) {
        this.messageList.push(message);
    }

    startReplying() {

    }

    async sendMsg(msgType, content, toUserName) {
        const url = `${this.store.loginUrl}/webwxsendmsg`;
        const params = {
            method: 'post',
            BaseRequest: {
                ...this.store.BaseRequest,
                DeviceID: 'e' + ((Math.random() + '').substring(2, 17))
            },
            Msg: {
                Type: msgType,
                Content: content,
                FromUserName: this.store.storageClass.userName,
                ToUserName: toUserName || this.store.storageClass.userName,
                LocalID: Date.now() * 1e4 + '',
                ClientMsgId: Date.now() * 1e4 + '',
            },
            Scene: 0,
            headers: {
                cookie: this.store.cookies.getAll(getUrlDomain(url))
            }
        };

        console.log(JSON.stringify(params))
        const res = await Fetch(url, params);
        // const returnValue = new ReturnValueFormat(res);

        console.log(res)
    }
}