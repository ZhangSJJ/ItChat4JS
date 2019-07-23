import NodeWeChat, { sendFile, sendImage, sendVideo, sendTextMsg, revokeMsg, EMIT_NAME, MESSAGE_TYPE } from './src';
import { uploadFile } from "./src/Message";


const NodeWeChatIns = new NodeWeChat();
// NodeWeChatIns.run();
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
    // const stream = fs.createReadStream('./111.mp4');
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

    const userInfo = NodeWeChatIns.getContactInfoByName('Kobe Zhang');

    // console.log(userInfo)
    try {
        const res = await  sendFile('./tt.png', userInfo.UserName)
        console.log(res)
    } catch (e) {
        console.log('err', e)
    }

    // const ss = await uploadChunksssss({
    //     fileDir: './tt.png'
    // })
    // console.log(ss,'============')

}

fn()

const prepareFile = (fileDir, fileStream) => {
    return new Promise((resolve) => {
        if (!fileDir && !fileStream) {
            resolve(null);
        }

        const stream = fileStream || fs.createReadStream(fileDir);
        const bufferArr = [];
        let fileSize = 0;

        stream.on('data', function (chunk) {

            bufferArr.push(chunk);
            fileSize += chunk.length;
        });
        stream.on('end', function () {

            const buffer = Buffer.concat(bufferArr);

            const chunks = Math.floor((fileSize - 1) / 524288) + 1;
            console.log(chunks);

            const bufferArr111 = Array.from({ length: chunks }).map((v, index) => {
                return buffer.slice(index * 524288, (index + 1) * 524288)
            });

            const temp = Buffer.concat(bufferArr111)


            console.log(temp.length, buffer.length, fileSize, bufferArr111.length, bufferArr111)

            resolve({ buffer: bufferArr111, fileSize })
        });
        stream.on('err', err => {

            resolve(null);
        });
    })
};



