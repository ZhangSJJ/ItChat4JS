import NodeWeChat from './src';

const NodeWeChatIns = new NodeWeChat();
// NodeWeChatIns.login();
//
//
// NodeWeChatIns.listen(NodeWeChat.EMIT_NAME.FRIEND,[NodeWeChat.MESSAGE_TYPE.TEXT,NodeWeChat.MESSAGE_TYPE.PICTURE], (replayInfo, toUserName) => {
//
//     console.log(replayInfo, toUserName)
//
//
// });

const fn =async ()=>{
    await NodeWeChatIns.login();
    NodeWeChatIns.sendMsg(1, 'zsssssssj', 'filehelper')
};

fn()

// NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.FRIEND, (replayInfo, toUserName) => {
//     console.log('friend', '====================')
//     console.log(replayInfo, toUserName)
//     const { text } = replayInfo
//     if (text === 'zsj') {
//         NodeWeChatIns.sendMsg(1, 'zsssssssj', toUserName)
//     }
//
// });
//
// NodeWeChatIns.on(NodeWeChat.MESSAGE_TYPE.CHAT_ROOM, async (replayInfo, toUserName) => {
//     console.log('charroom', '====================')
//     console.log(replayInfo, toUserName)
//
//     const { text } = replayInfo
//     if (text === 'zsj') {
//         NodeWeChatIns.sendMsg(1, 'zsssssssj', 'fmessage')
//     }
//
// });