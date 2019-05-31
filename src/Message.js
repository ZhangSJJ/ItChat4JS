/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/5/31
 */
'use strict';

/**
 * 处理message
 * messages types
 * 40 msg， 43 videochat, 50 VOIPMSG, 52 voipnotifymsg，53 webwxvoipnotifymsg, 9999 sysnotice
 */
class Message {
    constructor(store) {
        this.store = store;
        this.typeArr = [40, 43, 50, 52, 53, 9999];
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
                produce_group_chat(core, m)
            } else {
                utils.msg_formatter(m, 'Content')
            }

        });
    }
}