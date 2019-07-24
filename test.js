import NodeWeChat, {
    sendFile,
    sendImage,
    sendVideo,
    sendTextMsg,
    revokeMsg,
    EMIT_NAME,
    MESSAGE_TYPE,
    createChatRoom
} from './src';
import { uploadFile } from "./src/Message";
import GlobalInfo from "./src/GlobalInfo";


const NodeWeChatIns = new NodeWeChat();

// const arr = [
//     MESSAGE_TYPE.TEXT,
//     MESSAGE_TYPE.PICTURE,
//     MESSAGE_TYPE.SHARING,
//     MESSAGE_TYPE.FRIENDS,
//     MESSAGE_TYPE.VIDEO,
//
// ];
//
// NodeWeChatIns.listen(EMIT_NAME.FRIEND, arr, async (msgInfo, toUserName) => {
//
//     const { text, type, filename, download } = msgInfo;
//     if (type === MESSAGE_TYPE.PICTURE) {
//         await download('download/friend/image');
//         sendImage('download/friend/image/' + filename)
//     } else if (type === MESSAGE_TYPE.FRIENDS) {
//         const { status, verifyContent, autoUpdate: { UserName } } = text;
//         NodeWeChatIns.verifyFriend(UserName, status, verifyContent)
//     } else if (type === MESSAGE_TYPE.TEXT) {
//         sendTextMsg(text)
//         console.log(text, toUserName)
//         // NodeWeChatIns.verifyFriend(uu,2,'zsj')
//     } else if (type === MESSAGE_TYPE.VIDEO) {
//         await download('download/friend/video');
//         sendVideo('download/friend/video/' + filename)
//     }
//
//
// });
//
//
// NodeWeChatIns.listen(EMIT_NAME.CHAT_ROOM, arr, (msgInfo, toUserName) => {
//
//     const { text, type, filename, download, actualNickName } = msgInfo;
//     if (type === MESSAGE_TYPE.PICTURE) {
//         download('download/chatroom/image');
//     } else if (type === MESSAGE_TYPE.TEXT) {
//         console.log(EMIT_NAME.CHAT_ROOM, text, actualNickName, toUserName);
//     } else if (type === MESSAGE_TYPE.VIDEO) {
//         download('download/chatroom/video');
//     }
//
//
// });
//
// NodeWeChatIns.listen(EMIT_NAME.MASSIVE_PLATFORM, arr, (msgInfo, toUserName) => {
//
//     const { text, type, filename, download } = msgInfo;
//     if (type === MESSAGE_TYPE.PICTURE) {
//         download('download/mp/image');
//     } else if (type === MESSAGE_TYPE.TEXT) {
//         console.log(EMIT_NAME.CHAT_ROOM, text, toUserName);
//     } else if (type === MESSAGE_TYPE.VIDEO) {
//         download('download/mp/video');
//     }
//
//
// });


var fs = require('fs');
var fn = async () => {
    await NodeWeChatIns.login();
    // sendVideo('./111.mp4')
    // sendTextMsg('123123123')
    // sendImage('./tt.png')
    // const { MsgID, LocalID } = await sendFile('./txt.txt')
    //
    //
    // const stream = fs.createReadStream('./file/game.zip');
    //
    // const streamInfo = {
    //     fileReadStream: stream,
    //     filename: 'dd.eee',
    //     extName: '.txt'
    // };
    //
    // sendVideo(null, 'filehelper', null, streamInfo)
    //
    // setTimeout(() => {
    //     revokeMsg(MsgID, 'filehelper', LocalID)
    // }, 6000)

    // console.log(NodeWeChatIns.getUserInfoByName('比都个是还不你了对NIAN'))

    // const userInfo1 = NodeWeChatIns.getContactInfoByName(['阿东','阿贵']);
    const userInfo1 = NodeWeChatIns.getContactInfoByName('Kobe Zhang');
    const userInfo2 = NodeWeChatIns.getContactInfoByName('BBB');

    // console.log(userInfo1)
    // console.log(userInfo2)

    const res = await  NodeWeChatIns.addMemberIntoChatRoom(userInfo2.UserName,[userInfo1],true);


    console.log(res)


}
// NodeWeChatIns.run();
fn()



