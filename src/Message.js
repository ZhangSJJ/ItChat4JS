/**
 * @time 2019/5/31
 */


'use strict'
import fs from 'fs';
import { convertDate, convertRes, getUrlDomain, msgFormatter } from "./Utils";
import Fetch, { toJSON } from './Fetch';
import ReturnValueFormat from "./ReturnValueFormat";
import GlobalInfo from './GlobalInfo';
import { structFriendInfo } from "./ConvertData";
import { LogDebug, LogError } from "./Log";


/**
 * 处理message
 * messages types
 * 40 msg， 43 videochat, 50 VOIPMSG, 52 voipnotifymsg，53 webwxvoipnotifymsg, 9999 sysnotice
 */
export default class Message {
    constructor(props) {
        const { on, emit, getChatRoomInfo, updateChatRoomInfo, getFriendInfo, getMpInfo } = props;
        this.on = on;
        this.emit = emit;
        this.getChatRoomInfo = getChatRoomInfo;
        this.updateChatRoomInfo = updateChatRoomInfo;
        this.getFriendInfo = getFriendInfo;
        this.getMpInfo = getMpInfo;

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

                let messageType = GlobalInfo.EMIT_NAME.FRIEND;
                // produce basic message
                if (msg.FromUserName.indexOf('@@') !== -1 || msg.ToUserName.indexOf('@@') !== -1) {
                    messageType = GlobalInfo.EMIT_NAME.CHAT_ROOM;
                    await this.produceGroupMsg(msg)
                } else {
                    msgFormatter(msg, 'Content');
                }

                // set user of msg
                if (msg.actualOpposite.indexOf('@@') !== -1 || ['filehelper', 'fmessage'].indexOf(msg.actualOpposite) !== -1) {
                    //群聊或者文件助手
                    msg['User'] = this.getChatRoomInfo(msg.actualOpposite) || structFriendInfo({ 'UserName': msg.actualOpposite });
                } else {
                    //订阅号以及公众号
                    msg['User'] = this.getMpInfo(msg.actualOpposite) || this.getFriendInfo(msg.actualOpposite) || structFriendInfo({ 'UserName': msg.actualOpposite });
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
                        LogDebug('Map...');
                    } else {
                        msgInfo = {
                            Type: 'Text',
                            Text: msg['Content']
                        };
                        LogDebug('Text...');
                    }
                } else if (msg['MsgType'] === 3 || msg['MsgType'] === 47) {//picture
                    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetmsgimg`;
                    const filename = convertDate().replace(/-|:|\s/g, '') + (msg['MsgType'] === 3 ? '.png' : '.gif');
                    const downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                    msgInfo = {
                        Type: 'Picture',
                        FileName: filename,
                        Text: downloadFileFn,
                    };
                    LogDebug('Picture...111');//todo .gif download failed
                } else if (msg['MsgType'] === 34) {//voice
                    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetvoice`;
                    const filename = convertDate().replace(/-|:|\s/g, '') + '.mp3';
                    const downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                    msgInfo = {
                        Type: 'Recording',
                        FileName: filename,
                        Text: downloadFileFn,
                    };
                    LogDebug('Voice...');
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
                    LogDebug('Add Friend Apply...');
                } else if (msg['MsgType'] === 42) {//name card
                    msgInfo = {
                        Type: 'Card',
                        Text: msg['RecommendInfo']
                    };
                    LogDebug('Name Card...');
                } else if ([43, 62].indexOf(msg['MsgType']) !== -1) {//tiny video
                    const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetvideo`;
                    const filename = convertDate().replace(/-|:|\s/g, '') + '.mp4';
                    const downloadFileFn = downloadFile(url, msg['MsgId'], filename, true);

                    msgInfo = {
                        Type: 'Video',
                        FileName: filename,
                        Text: downloadFileFn,
                    };

                    LogDebug('Video...');
                } else if (msg['MsgType'] === 49) {//sharing
                    if (msg['AppMsgType'] === 0) {//chat history
                        msgInfo = {
                            Type: 'Note',
                            Text: msg['Content']
                        };
                        LogDebug('Chat History...')
                    } else if (msg['AppMsgType'] === 6) {
                        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetmedia`;
                        const filename = msg.FileName || convertDate().replace(/-|:|\s/g, '');
                        const downloadFileFn = downloadAttachment(url, msg, filename);
                        msgInfo = {
                            Type: 'Attachment',
                            FileName: filename,
                            Text: downloadFileFn,
                        };
                        LogDebug('Attachment...')
                    } else if (msg['AppMsgType'] === 8) {
                        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/webwxgetmsgimg`;
                        const filename = convertDate().replace(/-|:|\s/g, '') + '.gif';
                        const downloadFileFn = downloadFile(url, msg['MsgId'], filename);
                        msgInfo = {
                            Type: 'Picture',
                            FileName: filename,
                            Text: downloadFileFn,
                        };

                        LogDebug('Picture...222');
                    } else if (msg['AppMsgType'] === 17) {
                        msgInfo = {
                            Type: 'Note',
                            FileName: msg['FileName'],
                        };
                        LogDebug('Note...');
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
                        LogDebug('Note...');
                    } else {
                        msgInfo = {
                            Type: 'Sharing',
                            Text: msg['FileName'],
                        }
                    }
                } else if (msg['MsgType'] === 51) {//phone init

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
                    LogDebug(`Useless message received:${msg['MsgType']}\n${JSON.stringify(msg)}`);
                    msgInfo = {
                        Type: 'Useless',
                        Text: 'UselessMsg',
                    };
                }
            
                msg = { ...msg, ...msgInfo };

                this.reply(msg, messageType);
            }
        );
    }

    reply(msg, messageType) {
        const messageFrom = msg.actualOpposite;
        let retReply = {
            type: 'Text',
            text: msg['Content'],
            msgType: msg['MsgType']
        };
        if (messageType === GlobalInfo.EMIT_NAME.CHAT_ROOM) {
            retReply = {
                ...retReply,
                isAt: msg['IsAt'],
                actualNickName: msg['ActualNickName']
            }
        }
        this.emit(messageType, retReply, messageFrom)
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
    return (path) => {
        path = path || '';
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
        path && !fs.existsSync(path) && fs.mkdirSync(path);

        return new Promise(resolve => {
            Fetch(url, params).then(data => {
                fs.writeFile(path + filename, data, function (err) {
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
    return (path) => {
        path = path || '';

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

        path && !fs.existsSync(path) && fs.mkdirSync(path);

        return new Promise(resolve => {
            Fetch(url, params).then(data => {
                fs.writeFile(path + filename, data, function (err) {
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