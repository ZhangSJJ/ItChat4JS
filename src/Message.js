/**
 * @time 2019/5/31
 */


'use strict'
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import FormData from 'form-data';
import mineType from 'mime-types';

import { convertDate, getUrlDomain, msgFormatter } from "./Utils";
import Fetch from './Fetch';
import GlobalInfo from './GlobalInfo';
import { structFriendInfo } from "./ConvertData";
import { LogInfo, LogError } from "./Log";

const FILENAME_WITH_NO_DIR = 'TEMP-FILENAME';

/**
 * 处理message
 * messages types
 * 40 msg， 43 videochat, 50 VOIPMSG, 52 voipnotifymsg，53 webwxvoipnotifymsg, 9999 sysnotice
 */
export default class Message {
    constructor(props) {
        const { on, emit, getChatRoomInfo, updateChatRoomInfo, getFriendInfo, getMpInfo, updateLocalUin } = props;
        this.on = on;
        this.emit = emit;
        this.getChatRoomInfo = getChatRoomInfo;
        this.updateChatRoomInfo = updateChatRoomInfo;
        this.getFriendInfo = getFriendInfo;
        this.getMpInfo = getMpInfo;
        this.updateLocalUin = updateLocalUin;

        this.uselessMsgType = [40, 43, 50, 52, 53, 9999];

    }

    async produceGroupMsg(msg) {
        const reg = /(@[0-9a-z]*?):<br\/>(.*)$/;
        const match = (msg.Content || '').match(reg);
        let chatRoomUserName = msg['FromUserName'];
        let actualUserName = '';
        let msgContent = msg['Content'];
        if (match) {
            actualUserName = match[1];
            msgContent = match[2];
            chatRoomUserName = msg['FromUserName'];
        } else if (msg['FromUserName'] === GlobalInfo.LOGIN_INFO.selfUserInfo.UserName) {
            actualUserName = GlobalInfo.LOGIN_INFO.selfUserInfo.UserName;
            chatRoomUserName = msg['ToUserName'];
        } else {
            msg['ActualUserName'] = GlobalInfo.LOGIN_INFO.selfUserInfo.UserName;
            msg['ActualNickName'] = GlobalInfo.LOGIN_INFO.selfUserInfo.NickName;
            msg['IsAt'] = false;
            msgFormatter(msg, 'Content');
            return
        }


        let chatRoom = this.getChatRoomInfo(chatRoomUserName) || {};
        let member = (chatRoom.MemberList || []).find(i => i.UserName === actualUserName);
        if (!member) {
            await this.updateChatRoomInfo(chatRoomUserName);
            chatRoom = this.getChatRoomInfo(chatRoomUserName) || {};
            member = (chatRoom.MemberList || []).find(i => i.UserName === actualUserName);
        }
        if (!member) {
            LogInfo('Chat Room Member Fetch Failed With ' + actualUserName);
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
        msg['Content'] = msgContent;
        msgFormatter(msg, 'Content');
    }

    produceMsg(msgList = []) {
        msgList.forEach(async msg => {
                // get actual opposite
                if (msg.FromUserName === GlobalInfo.LOGIN_INFO.selfUserInfo.UserName) {
                    msg.actualOpposite = msg.ToUserName;
                } else {
                    msg.actualOpposite = msg.FromUserName;
                }

                // produce basic message
                if (msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1) {
                    await this.produceGroupMsg(msg)
                } else {
                    msgFormatter(msg, 'Content');
                }

                // set user of msg
                const defaultUseInfo = structFriendInfo({ 'UserName': msg.actualOpposite });
                if (msg.actualOpposite.indexOf('@@') !== -1) {
                    //群聊
                    defaultUseInfo.myDefinedUserType = GlobalInfo.EMIT_NAME.CHAT_ROOM;
                    msg['User'] = this.getChatRoomInfo(msg.actualOpposite) || defaultUseInfo;
                } else if (['filehelper', 'fmessage'].indexOf(msg.actualOpposite) !== -1) {
                    //文件助手等
                    defaultUseInfo.myDefinedUserType = GlobalInfo.EMIT_NAME.FRIEND;
                    msg['User'] = defaultUseInfo;
                } else {
                    //订阅号以及公众号
                    defaultUseInfo.myDefinedUserType = GlobalInfo.EMIT_NAME.FRIEND;
                    msg['User'] = this.getMpInfo(msg.actualOpposite) || this.getFriendInfo(msg.actualOpposite) || defaultUseInfo;
                }

                // 处理消息
                let msgInfo = {};
                if (msg['MsgType'] === 1) {// 可能为地图或者文本
                    if (!!msg['Url']) {
                        const reg = /(.+?\(.+?\))/;
                        let data = 'Map';
                        const match = (msg.Content || '').match(reg);
                        if (match && match[1]) {
                            data = match[1]
                        }
                        msgInfo = {
                            Type: 'Map',
                            Text: data,
                        };
                        LogInfo('Map...');
                    } else {
                        msgInfo = {
                            Type: 'Text',
                            Text: msg['Content']
                        };
                        LogInfo('Text...');
                    }
                } else if (msg['MsgType'] === 3 || msg['MsgType'] === 47) {//picture
                    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetmsgimg`;
                    const filename = convertDate().replace(/-|:|\s/g, '') + (msg['MsgType'] === 3 ? '.png' : '.gif');
                    const downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                    msgInfo = {
                        Type: 'Picture',
                        FileName: filename,
                        Download: downloadFileFn,
                    };
                    LogInfo('Picture...111');//todo .gif download failed
                } else if (msg['MsgType'] === 34) {//voice
                    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetvoice`;
                    const filename = convertDate().replace(/-|:|\s/g, '') + '.mp3';
                    const downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                    msgInfo = {
                        Type: 'Recording',
                        FileName: filename,
                        Download: downloadFileFn,
                    };
                    LogInfo('Voice...');
                } else if (msg['MsgType'] === 37) {//friends
                    msg['User']['UserName'] = msg['RecommendInfo']['UserName'];
                    msgInfo = {
                        Type: 'Friends',
                        Text: {
                            status: msg['Status'],
                            userName: msg['RecommendInfo']['UserName'],
                            verifyContent: msg['Ticket'],
                            autoUpdate: msg['RecommendInfo'],
                        },
                    };
                    msg['User'].verifyDict = msgInfo['Text'];
                    LogInfo('Add Friend Apply...');
                } else if (msg['MsgType'] === 42) {//name card
                    msgInfo = {
                        Type: 'Card',
                        Text: msg['RecommendInfo']
                    };
                    LogInfo('Name Card...');
                } else if ([43, 62].indexOf(msg['MsgType']) !== -1) {//tiny video
                    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetvideo`;
                    const filename = convertDate().replace(/-|:|\s/g, '') + '.mp4';
                    const downloadFileFn = downloadFile(url, msg['MsgId'], filename, true);

                    msgInfo = {
                        Type: 'Video',
                        FileName: filename,
                        Download: downloadFileFn,
                    };

                    LogInfo('Video...');
                } else if (msg['MsgType'] === 49) {//sharing
                    if (msg['AppMsgType'] === 0) {//chat history
                        msgInfo = {
                            Type: 'Note',
                            Text: msg['Content']
                        };
                        LogInfo('Chat History...')
                    } else if (msg['AppMsgType'] === 6) {
                        const url = `${GlobalInfo.LOGIN_INFO.fileUrl}/webwxgetmedia`;
                        const filename = msg.FileName || convertDate().replace(/-|:|\s/g, '');
                        const downloadFileFn = downloadAttachment(url, msg, filename);
                        msgInfo = {
                            Type: 'Attachment',
                            FileName: filename,
                            Download: downloadFileFn,
                        };
                        LogInfo('Attachment...')
                    } else if (msg['AppMsgType'] === 8) {
                        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetmsgimg`;
                        const filename = convertDate().replace(/-|:|\s/g, '') + '.gif';
                        const downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                        msgInfo = {
                            Type: 'Picture',
                            FileName: filename,
                            Download: downloadFileFn,
                        };

                        LogInfo('Picture...222');
                    } else if (msg['AppMsgType'] === 17) {
                        msgInfo = {
                            Type: 'Note',
                            FileName: msg['FileName'],
                        };
                        LogInfo('Note...');
                    } else if (msg['AppMsgType'] === 2000) {
                        const reg = '\[CDATA\[(.+?)\][\s\S]+?\[CDATA\[(.+?)\]';
                        const match = (msg.Content || '').match(reg);
                        let text = 'You may found detailed info in Content key.';
                        if (match && match[2]) {
                            text = match[2].split('\u3002')[0]
                        }

                        msgInfo = {
                            Type: 'Note',
                            Text: text,
                        };
                        LogInfo('Note...');
                    } else {
                        msgInfo = {
                            Type: 'Sharing',
                            Text: msg['FileName'],
                        }
                    }
                } else if (msg['MsgType'] === 51) {//phone init
                    msgInfo = this.updateLocalUin(msg)
                } else if (msg['MsgType'] === 10000) {
                    msgInfo = {
                        Type: 'Note',
                        Text: msg['Content'],
                    }
                } else if (msg['MsgType'] === 10002) {
                    const reg = '\[CDATA\[(.+?)\]\]';
                    const match = (msg.Content || '').match(reg);
                    let text = 'System message';
                    if (match && match[1]) {
                        text = match[1].replace('\\', '')
                    }
                    msgInfo = {
                        Type: 'Note',
                        Text: text,
                    };

                } else if (this.uselessMsgType.indexOf(msg['MsgType']) !== -1) {
                    msgInfo = {
                        Type: 'Useless',
                        Text: 'UselessMsg',
                    };

                } else {
                    LogInfo(`Useless message received:${msg['MsgType']}\n${JSON.stringify(msg)}`);
                    msgInfo = {
                        Type: 'Useless',
                        Text: 'UselessMsg',
                    };
                }

                msg = { ...msg, ...msgInfo };


                this.reply(msg);

                // LogInfo(msg['User'].myDefinedUserType + ',' + msg['MsgType'] + ',' + JSON.stringify(msgInfo))

            }
        );
    }

    reply(msg) {
        const messageFrom = msg.actualOpposite;
        const emitName = msg['User'].myDefinedUserType;


        let retReply = {
            type: msg['Type'],
            text: msg['Text'],
            filename: msg['FileName'],
            download: msg['Download'],
            content: msg['Content'],
            oriContent: msg['OriContent']
        };
        if (emitName === GlobalInfo.EMIT_NAME.CHAT_ROOM) {
            retReply = {
                ...retReply,
                isAt: msg['IsAt'],
                actualNickName: msg['ActualNickName']
            }
        }

        emitName && this.emit(emitName, retReply, msg['User'] || { UserName: messageFrom })
    }

}

/**
 * 返回一个下载函数，是否需要下载由用户决定
 * @param url
 * @param msgId
 * @param filename
 * @param isVideo
 * @returns {function(*=)}
 */

const downloadFile = (url, msgId, filename, isVideo = false) => {
    return (path, name, buffer = false) => {
        path = path || '';
        name = name || filename;
        const params = {
            msgid: msgId,
            skey: GlobalInfo.LOGIN_INFO['skey'],
            json: false,
            buffer: true,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url)),
            }
        };
        params.headers['Content-Type'] = 'application/octet-stream';
        if (isVideo) {
            params.headers['Range'] = 'bytes=0-';
        }
        const realPath = makeDirs(path);

        return new Promise(resolve => {
            Fetch(url, params).then(data => {
                if (buffer) {
                    if (data instanceof Uint8Array) {
                        data = Buffer.from(data);
                    }
                    resolve(data);
                    return;
                }
                fs.writeFile(realPath + name, data, function (err) {
                    if (err) {
                        LogError('File Download Error:' + err);
                        resolve('File Download Error!')
                    } else {
                        resolve('File Download Success!')
                    }
                });
            });
        });
    }
};


const downloadAttachment = (url, msg, filename) => {
    return (path, name, buffer = false) => {
        path = path || '';
        name = name || filename;
        const webwxDataTicket = GlobalInfo.LOGIN_INFO.cookies.getValue('webwx_data_ticket', getUrlDomain(url));

        const params = {
            sender: msg['FromUserName'],
            mediaid: msg['MediaId'],
            filename: msg['FileName'],
            fromuser: GlobalInfo.LOGIN_INFO['wxuin'],
            pass_ticket: 'undefined',
            webwx_data_ticket: webwxDataTicket,
            json: false,
            buffer: true,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url)),
                'Content-Type': 'application/octet-stream'
            }
        };

        const realPath = makeDirs(path);

        return new Promise(resolve => {
            Fetch(url, params).then(data => {
                if (buffer) {
                    if (data instanceof Uint8Array) {
                        data = Buffer.from(data);
                    }
                    resolve(data);
                    return;
                }
                fs.writeFile(realPath + name, data, function (err) {
                    if (err) {
                        LogError('File Download Error:' + err);
                        resolve('File Download Error!')
                    } else {
                        resolve('File Download Success!')
                    }
                });
            });
        });
    }
};

const makeDirs = (pathStr) => {
    if (!pathStr) {
        return '';
    }
    const sep = path.sep;
    pathStr = path.dirname(pathStr + sep + 'dir');
    //解决path.dirname('aa/bb/cc')和path.dirname('aa/bb/cc/')都返回aa/bb/
    //path.dirname('aa/bb/cc')和path.dirname('aa/bb/cc/')--->aa/bb/cc 或 aa/bb/cc/

    let pathTemp = '';
    pathStr.split(/[/\\]/).forEach(dirName => {
        if (!dirName) {
            return;
        }
        if (pathTemp) {
            pathTemp = path.join(pathTemp, dirName);
        } else {
            pathTemp = dirName;
        }
        if (!fs.existsSync(pathTemp)) {
            fs.mkdirSync(pathTemp);
        }
    });
    const isAbsolute = path.isAbsolute(pathStr);
    return (isAbsolute ? sep : '') + pathTemp + sep;
};


const sendMsg = async ({ url, msgType, content, toUserName = 'filehelper', mediaId }) => {
    const params = {
        method: 'post',
        BaseRequest: {
            ...GlobalInfo.BaseRequest,
            DeviceID: 'e' + ((Math.random() + '').substring(2, 17))
        },
        Msg: {
            Type: msgType,
            FromUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            ToUserName: toUserName || GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            LocalID: Date.now() * 1e4 + '',
            ClientMsgId: Date.now() * 1e4 + '',
        },
        Scene: 0,
        headers: {
            cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
        }
    };

    if (!!content) {
        params.Msg.Content = content;
    }
    if (!!mediaId) {
        params.Msg.MediaId = mediaId;
    }

    const res = await Fetch(url, params);
    LogInfo(res);
    return res;
};


export const sendTextMsg = async (msg, toUserName) => {
    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendmsg`;
    LogInfo('Request to send a text message to ' + toUserName + ': ' + msg);
    return await sendMsg({
        url, msgType: 1, content: msg, toUserName
    })

};

export const sendFile = async (fileDir, toUserName = 'filehelper', mediaId, streamInfo = {}) => {
    LogInfo(`Request to send a file(mediaId: ${mediaId}) to ${toUserName}: ${fileDir}`);
    let { fileReadStream, filename, extName } = streamInfo;
    const preparedFile = await prepareFile(fileDir, fileReadStream);
    if (!preparedFile) {
        LogError('File Analysis Failed...');
        return;
    }
    const { fileSize } = preparedFile;
    if (!mediaId) {
        const uploadRes = await uploadFile({ fileDir, toUserName, preparedFile });
        if (!uploadRes.BaseResponse || uploadRes.BaseResponse.Ret !== 0 || !uploadRes['MediaId']) {
            LogError(`Request to upload a file: ${fileDir} failed`);
            return;
        }
        mediaId = uploadRes['MediaId'];
    }
    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendappmsg?fun=async&f=json`;
    extName = (extName || '').slice(1);
    if (!!fileDir) {
        filename = path.basename(fileDir);
        extName = path.extname(fileDir).slice(1);
    }

    const content = `<appmsg appid='wxeb7ec651dd0aefa9' sdkver=''><title>${filename}</title><des></des><action></action><type>6</type><content></content><url></url><lowurl></lowurl><appattach><totallen>${fileSize}</totallen><attachid>${mediaId}</attachid><fileext>${extName}</fileext></appattach><extinfo></extinfo></appmsg>`;
    return await sendMsg({
        url, msgType: 6, content, toUserName, mediaId
    });
};


export const sendImage = async (fileDir, toUserName = 'filehelper', mediaId, streamInfo = {}) => {
    LogInfo(`Request to send a image(mediaId: ${mediaId}) to ${toUserName}: ${fileDir}`);
    const { fileReadStream, extName } = streamInfo;
    const preparedFile = await prepareFile(fileDir, fileReadStream);

    if (!preparedFile) {
        LogError('File Analysis Failed...');
        return;
    }
    if (!mediaId) {
        const isGif = extName === '.gif' || (fileDir && path.extname(fileDir) === '.gif');
        const uploadRes = await uploadFile({ fileDir, toUserName, isPicture: !isGif, preparedFile });
        if (!uploadRes.BaseResponse || uploadRes.BaseResponse.Ret !== 0 || !uploadRes['MediaId']) {
            LogError(`Request to upload a image: ${fileDir} failed`);
            return;
        }
        mediaId = uploadRes['MediaId'];
    }
    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendmsgimg?fun=async&f=json`;

    return await sendMsg({
        url, msgType: 3, toUserName, mediaId
    });

};
export const sendVideo = async (fileDir, toUserName = 'filehelper', mediaId, streamInfo = {}) => {
    LogInfo(`Request to send a video(mediaId: ${mediaId}) to ${toUserName}: ${fileDir}`);
    const { fileReadStream } = streamInfo;
    const preparedFile = await prepareFile(fileDir, fileReadStream);
    if (!preparedFile) {
        LogError('File Analysis Failed...');
        return;
    }
    if (!mediaId) {
        const uploadRes = await uploadFile({ fileDir, toUserName, isVideo: true, preparedFile });
        if (!uploadRes.BaseResponse || uploadRes.BaseResponse.Ret !== 0 || !uploadRes['MediaId']) {
            LogError(`Request to upload a video: ${fileDir} failed`);
            return;
        }
        mediaId = uploadRes['MediaId'];
    }

    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendvideomsg?fun=async&f=json&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;

    return await sendMsg({
        url, msgType: 43, toUserName, mediaId
    });
};

/**
 * 转发消息(网页版只支持文本，图片，视频)
 * @param content
 * @param msgType
 * @param toUserName
 * @returns {Promise<*>}
 */
export const transmitMsg = async (content, msgType, toUserName) => {
    let url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendmsg`, type;
    if (msgType === GlobalInfo.MESSAGE_TYPE.TEXT) {
        type = 1;
    } else if (msgType === GlobalInfo.MESSAGE_TYPE.PICTURE) {
        url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendmsgimg?fun=async&f=json`;
        type = 3;
    } else if (msgType === GlobalInfo.MESSAGE_TYPE.VIDEO) {
        url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxsendvideomsg?fun=async&f=json&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        type = 43;
    } else if (msgType === GlobalInfo.MESSAGE_TYPE.MAP) {
        type = 48;
    }
    if (!!url && !!type) {
        return sendMsg({
            url,
            msgType: type,
            content,
            toUserName
        })
    }
    return Promise.resolve().then(() => ({ BaseResponse: { Ret: -1 } }));
};

export const revokeMsg = async (msgId, toUserName, localId) => {
    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxrevokemsg`;
    const params = {
        method: 'post',
        BaseRequest: GlobalInfo.BaseRequest,
        ClientMsgId: localId || (Date.now() + ''),
        SvrMsgId: msgId,
        ToUserName: toUserName,
        headers: {
            cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
        }
    };

    const res = await Fetch(url, params);
    LogInfo(res);
    return res;
};

/**
 * 解析文件，获得文件MD5，buffer，fileSize
 * @param fileDir
 * @param fileStream
 * @returns {Promise}
 */
export const prepareFile = (fileDir, fileStream) => {
    return new Promise((resolve) => {
        if (!fileDir && !fileStream) {
            resolve(null);
        }
        let md5sum = crypto.createHash('md5');
        const stream = fileStream || fs.createReadStream(fileDir);

        const handleData = (buffer) => {
            const fileSize = buffer.length;
            const chunks = Math.floor((fileSize - 1) / 524288) + 1;
            const bufferArr = Array.from({ length: chunks }).map((v, index) => {
                return buffer.slice(index * 524288, (index + 1) * 524288)
            });
            md5sum.update(buffer.toString());
            const fileMd5 = md5sum.digest('hex');
            return {
                fileMd5, bufferArr, fileSize
            };
        };

        if (fileStream instanceof Uint8Array) {
            const buffer = Buffer.from(fileStream);
            resolve(handleData(buffer));
            return;
        }

        const bufferArr = [];

        stream.on('data', function (chunk) {
            bufferArr.push(chunk);
        });
        stream.on('end', function () {
            const buffer = Buffer.concat(bufferArr);
            resolve(handleData(buffer));
        });
        stream.on('err', err => {
            LogError('解析文件发生异常:' + err);
            resolve(null);
        });
    })
};

/**
 * @param fileDir
 * @param isPicture
 * @param isVideo
 * @param toUserName
 * @param preparedFile
 * @returns {Promise.<*>}
 */
export const uploadFile = async ({ fileDir, isPicture = false, isVideo = false, toUserName = 'filehelper', preparedFile }) => {
    LogInfo(`Request to upload a ${isPicture ? 'picture' : (isVideo ? 'video' : 'file')}: ${fileDir}`);
    preparedFile = preparedFile || await prepareFile(fileDir);

    const { fileMd5, bufferArr, fileSize } = preparedFile;

    if (!preparedFile || !bufferArr || !bufferArr.length) {
        LogError('File Analysis Failed...');
        return;
    }

    let fileSymbol = 'doc';
    if (isPicture) {
        fileSymbol = 'pic';
    } else if (isVideo) {
        fileSymbol = 'video';
    }

    let fileName = FILENAME_WITH_NO_DIR;
    let fileType = 'application/octet-stream';
    if (!!fileDir) {
        fileName = path.basename(fileDir);
        fileType = mineType.lookup(fileDir);
    }


    const promiseArr = bufferArr.map((buffer, index) => {
        return uploadChunk({
            buffer,
            fileMd5,
            fileSymbol,
            totalFileSize: fileSize,
            fileName,
            fileType,
            toUserName,
            chunks: bufferArr.length,
            chunk: index
        });
    });

    return promiseArr.reduce((result, next) => {
        return result.then(() => next())
    }, Promise.resolve())
};


const uploadChunk = ({ buffer, fileMd5, fileSymbol, totalFileSize, fileName, fileType, toUserName, chunks, chunk }) => {
    const url = `${GlobalInfo.LOGIN_INFO.fileUrl || GlobalInfo.LOGIN_INFO.loginUrl}/webwxuploadmedia?f=json`;
    const uploadMediaRequest = {
        UploadType: 2,
        BaseRequest: GlobalInfo.BaseRequest,
        ClientMediaId: Date.now(),
        TotalLen: totalFileSize,
        StartPos: 0,
        DataLen: totalFileSize,
        MediaType: 4,
        FromUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
        ToUserName: toUserName,
        FileMd5: fileMd5
    };

    const webwxDataTicket = GlobalInfo.LOGIN_INFO.cookies.getValue('webwx_data_ticket', getUrlDomain(url));

    const dataJson = {
        id: 'WU_FILE_0',
        name: fileName,
        type: fileType,
        lastModifiedDate: (new Date()).toString(),
        size: totalFileSize,
        mediatype: fileSymbol,
        uploadmediarequest: JSON.stringify(uploadMediaRequest),
        webwx_data_ticket: webwxDataTicket,
        pass_ticket: GlobalInfo.LOGIN_INFO.pass_ticket,
    };

    return () => {
        //必须返回一个函数，延迟promise执行
        LogInfo(`Request to upload a chunk ${fileSymbol}, chunks: ${chunks}, chunk: ${chunk} to: ${toUserName}`);
        const formData = new FormData();
        formData.append('filename', buffer, {
            filename: fileName,
            contentType: fileType,
        });

        if (chunks > 1) {
            dataJson.chunks = chunks;
            dataJson.chunk = chunk;
        }

        Object.keys(dataJson).forEach(key => {
            formData.append(key, dataJson[key]);
        });

        return Fetch(url, {
            method: 'POST',
            formData,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url)),
                'Content-Type': 'multipart/form-data',
                ...(formData.getHeaders() || {})
            }
        });
    }
};
