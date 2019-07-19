import NodeWeChat, { sendFile, sendImage, sendVideo, sendTextMsg, revokeMsg, EMIT_NAME, MESSAGE_TYPE } from './src';

const NodeWeChatIns = new NodeWeChat();
NodeWeChatIns.run();
const arr = [
    MESSAGE_TYPE.TEXT,
    MESSAGE_TYPE.PICTURE,
    MESSAGE_TYPE.SHARING,
    MESSAGE_TYPE.FRIENDS,
    MESSAGE_TYPE.VIDEO,

];

NodeWeChatIns.listen(EMIT_NAME.FRIEND, arr, (msgInfo, toUserName) => {

    const { text, type, filename, download } = msgInfo;
    if (type === MESSAGE_TYPE.PICTURE) {
        download('download/friend/image');
    } else if (type === MESSAGE_TYPE.FRIENDS) {
        const { status, verifyContent, autoUpdate: { UserName } } = text;
        NodeWeChatIns.verifyFriend(UserName, status, verifyContent)
    } else if (type === MESSAGE_TYPE.TEXT) {
        // const uu = '@26f8ddca0d4d0b0c18ccf9d5be97b36cf600d13f44dfd88808470dad28c2f29b';
        console.log(EMIT_NAME.FRIEND, text, toUserName);
        sendImage('./tt.png')
        // NodeWeChatIns.verifyFriend(uu,2,'zsj')
    } else if (type === MESSAGE_TYPE.VIDEO) {
        download('download/friend/video');
    }


});

// NodeWeChatIns.listen( EMIT_NAME.CHAT_ROOM, arr, (msgInfo, toUserName) => {
//
//     const { text, type, filename, download, actualNickName } = msgInfo;
//     if (type ===  MESSAGE_TYPE.PICTURE) {
//         download('download/chatroom/image');
//     } else if (type ===  MESSAGE_TYPE.TEXT) {
//         console.log( EMIT_NAME.CHAT_ROOM, text, actualNickName, toUserName);
//     } else if (type ===  MESSAGE_TYPE.VIDEO) {
//         download('download/chatroom/video');
//     }
//
//
// });
//
// NodeWeChatIns.listen( EMIT_NAME.MASSIVE_PLATFORM, arr, (msgInfo, toUserName) => {
//
//     const { text, type, filename, download } = msgInfo;
//     if (type ===  MESSAGE_TYPE.PICTURE) {
//         download('download/mp/image');
//     } else if (type ===  MESSAGE_TYPE.TEXT) {
//         console.log( EMIT_NAME.CHAT_ROOM, text, toUserName);
//     } else if (type ===  MESSAGE_TYPE.VIDEO) {
//         download('download/mp/video');
//     }
//
//
// });


// NodeWeChatIns.run();
//
//
// NodeWeChatIns.listen( EMIT_NAME.FRIEND, arr, (msgInfo, toUserName) => {
//
//     const { text, type, filename, download } = msgInfo;
//     if (type ===  MESSAGE_TYPE.TEXT) {
//
//         console.log( EMIT_NAME.FRIEND, text, toUserName);
//         uploadFile('./timg.gif')
//
//
//     }
//
//
// });

// var fs = require('fs');
// var fn = async () => {
//     await  NodeWeChatIns.login();
//     sendVideo('./111.mp4')
//     sendTextMsg('123123123')
//     sendImage('./tt.png')
//     const { MsgID, LocalID } = await sendFile('./txt.txt')
//
//
//     const stream = fs.createReadStream('./111.mp4');
//
//     const streamInfo = {
//         fileReadStream: stream,
//         filename: 'dd.eee',
//         extName: '.txt'
//     };
//
//     sendVideo(null, 'filehelper', null, streamInfo)
//
//     setTimeout(() => {
//         revokeMsg(MsgID, 'filehelper', LocalID)
//     }, 6000)
// }
//
// fn()
