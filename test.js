/**
 * @time 2019/6/15
 */
'use strict';

import NodeWeChat from './src';

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

NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.CHAT_ROOM, async (replayInfo, toUserName) => {
    console.log('charroom', '====================')
    console.log(replayInfo, toUserName)

    const { text } = replayInfo
    if (text === 'zsj') {
        NodeWeChatIns.sendMsg(1, 'zsssssssj', toUserName)
    }

});