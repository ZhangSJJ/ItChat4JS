/**
 * @author shangjiezhang@ctrip.com
 * @time 2019/6/15
 */
'use strict';

const NodeWeChat = require('./lib/index');
const NodeWeChatIns = new NodeWeChat();
NodeWeChatIns.run();
NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.FRIEND, (replayInfo, toUserName) => {
    console.log('friend', '====================')
    console.log(replayInfo, toUserName)
    const { text } = replayInfo
    if (text === 'zsj') {
        NodeWeChatIns.sendMsg(1, 'zsssssssj', toUserName)
    }

});

NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.CHAT_ROOM, (replayInfo, toUserName) => {
    console.log('charroom', '====================')
    console.log(replayInfo, toUserName)

    const { text } = replayInfo
    if (text === 'zsj') {
        NodeWeChatIns.sendMsg(1, 'zsssssssj', toUserName)
    }

});