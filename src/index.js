/**
 * @time 2019/6/5
 */

import EventEmitter from 'events';
import parser from 'fast-xml-parser';
import Fetch, { FetchWithExcept, toBuffer, toJSON } from './Fetch';
import { emojiFormatter, getBaseRequest, getDeviceID, getUrlDomain, isArray, WhileDoing } from './Utils';
import qrCode from './qrcode-terminal';
import Cookies from './node-js-cookie';
import ReturnValueFormat from './ReturnValueFormat';
import { structFriendInfo } from "./ConvertData";
import Contact from "./Contact";
import Message, { sendFile, sendImage, sendVideo, sendTextMsg, revokeMsg, transmitMsg } from './Message';
import GlobalInfo from './GlobalInfo';
import { readAndMergeGlobalInfo, saveGlobalInfo } from "./StoreGlobalInfo";
import { LogError, LogInfo } from "./Log";

class NodeWeChat extends EventEmitter {
    constructor() {
        super();
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.init();
    }

    init() {
        this.contactIns = new Contact();
        const getChatRoomInfo = this.contactIns.getChatRoomInfo.bind(this.contactIns);
        const updateChatRoomInfo = this.contactIns.updateChatRoomInfo.bind(this.contactIns);
        const getFriendInfo = this.contactIns.getFriendInfo.bind(this.contactIns);
        const getMpInfo = this.contactIns.getMpInfo.bind(this.contactIns);
        const updateLocalUin = this.contactIns.updateLocalUin.bind(this.contactIns);


        this.messageIns = new Message({
            on: this.on,
            emit: this.emit,
            getChatRoomInfo,
            updateChatRoomInfo,
            getFriendInfo,
            getMpInfo,
            updateLocalUin,
        });

        this.verifyFriend = this.contactIns.verifyFriend.bind(this.contactIns);
        this.getContactInfoByName = this.contactIns.getContactInfoByName.bind(this.contactIns);
        this.setAlias = this.contactIns.setAlias.bind(this.contactIns);
        this.setPinned = this.contactIns.setPinned.bind(this.contactIns);
        this.createChatRoom = this.contactIns.createChatRoom.bind(this.contactIns);
        this.setChatRoomName = this.contactIns.setChatRoomName.bind(this.contactIns);
        this.deleteMemberFromChatRoom = this.contactIns.deleteMemberFromChatRoom.bind(this.contactIns);
        this.addMemberIntoChatRoom = this.contactIns.addMemberIntoChatRoom.bind(this.contactIns);


    }

    async getUserId() {
        const url = `${getUrlDomain(GlobalInfo.LOGIN_INFO.loginUrl)}/jslogin`;
        const res = await Fetch(url, {
            redirect_uri: encodeURIComponent(`${GlobalInfo.LOGIN_INFO.hostUrl}/webwxnewloginpage`) + `&fun=new&lang=${GlobalInfo.LANG}`,
            appid: GlobalInfo.APP_ID,
            json: false, buffer: true
        });
        const bufferText = res.toString();
        if (bufferText) {
            const reg = /window.QRLogin.code = (\d+); window.QRLogin.uuid = "(\S+?)";/;
            const match = bufferText.match(reg);
            if (match && +match[1] === 200) {
                return match[2];
            } else {
                throw new Error('获取userId失败！')
            }
        } else {
            throw new Error('获取userId失败！')
        }
    };

    drawQRImage(uuid) {
        const url = 'https://login.weixin.qq.com/l/' + uuid;
        qrCode.generate(url);
        LogInfo('Please scan the QR code to log in.')
    };

    async webWxPushLogin() {
        if (!GlobalInfo.LOGIN_INFO.hostUrl || !GlobalInfo.LOGIN_INFO.wxuin) {
            return false;
        }
        const url = `${GlobalInfo.LOGIN_INFO.hostUrl}/webwxpushloginurl?uin=${GlobalInfo.LOGIN_INFO.wxuin}`;
        const pushLoginRes = await Fetch(url, {
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        });
        LogInfo('WeChat Push Login Request Result:' + pushLoginRes.msg);

        if (pushLoginRes.ret === '0') {
            GlobalInfo.LOGIN_INFO.userId = pushLoginRes.uuid;
        }

        return pushLoginRes.ret === '0';
    };

    async checkUserLogin(userId) {
        const now = Date.now();
        const url = `${GlobalInfo.LOGIN_INFO.loginUrl}/login`;
        const params = {
            loginicon: true,
            uuid: userId,
            tip: 0,
            r: ~new Date(),
            json: false,
            buffer: true
        };
        if (GlobalInfo.LOGIN_INFO['logintime']) {
            params._ = ++GlobalInfo.LOGIN_INFO['logintime'];
        } else {
            params._ = now;
        }

        const res = await FetchWithExcept(url, params, null);
        if (!res) {
            return;
        }
        const bufferText = res.toString();

        const reg = /window.code=(\d+);/;
        const match = bufferText.match(reg);
        if (match) {
            const status = +match[1];
            if (status === 200) {
                GlobalInfo.LOGIN_INFO.isLogin = true;
                /***清除循环***/
                this.loginWhileDoing.end();
                /***清除循环***/
                LogInfo('You are login!');
                await this.processLoginInfo(bufferText)
            } else if (status === 201) {
                LogInfo('Please press confirm on your phone.')
            } else if (status === 408) {
                LogInfo('Please wait for a moment...')
            } else {
                LogInfo('WeChat Mobile Client Refuse To Login!');
                return process.exit(0);
            }
        } else {
            LogError('获取登录信息失败！')
        }

        return res;
    };

    async processLoginInfo(resText) {
        const reg = /window.redirect_uri="(\S+)";/;
        const match = resText.match(reg);
        const redirectUrl = match[1];
        GlobalInfo.LOGIN_INFO.redirectUrl = redirectUrl;
        const hostUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf('/'));
        let params = {
            fun: 'new',
            version: 'v2',
            json: false,
            redirect: 'manual',
        }
        if (this.desktopMode) {
            params = {
                ...params,
                mod: 'desktop',
                headers: GlobalInfo.DESKTOP_MODE_HEADER
            }
        }
        let res = await Fetch(redirectUrl, params);
        const cookieArr = (res.headers.raw() || {})['set-cookie'];
        GlobalInfo.LOGIN_INFO.cookies = new Cookies(cookieArr);

        const urlInfo = [["wx2.qq.com", ["login.wx2.qq.com", "file.wx2.qq.com", "webpush.wx2.qq.com"]],
            ["wx8.qq.com", ["login.wx8.qq.com", "file.wx8.qq.com", "webpush.wx8.qq.com"]],
            ["qq.com", ["login.wx.qq.com", "file.wx.qq.com", "webpush.wx.qq.com"]],
            ["web2.wechat.com", ["login.web2.wechat.com", "file.web2.wechat.com", "webpush.web2.wechat.com"]],
            ["wechat.com", ["login.web.wechat.com", "file.web.wechat.com", "webpush.web.wechat.com"]]
        ];

        const urlDetailInfo = urlInfo.find(info => hostUrl.indexOf(info[0]) !== -1)
        if (urlDetailInfo) {
            const [indexUrl, [loginUrl, fileUrl, syncUrl]] = urlDetailInfo;
            GlobalInfo.LOGIN_INFO['loginUrl'] = `https://${loginUrl}/cgi-bin/mmwebwx-bin`;
            GlobalInfo.LOGIN_INFO['fileUrl'] = `https://${fileUrl}/cgi-bin/mmwebwx-bin`;
            GlobalInfo.LOGIN_INFO['syncUrl'] = `https://${syncUrl}/cgi-bin/mmwebwx-bin`;
            GlobalInfo.LOGIN_INFO.hostUrl = hostUrl;
        } else {
            // GlobalInfo.LOGIN_INFO['loginUrl'] = GlobalInfo.LOGIN_INFO['fileUrl'] = GlobalInfo.LOGIN_INFO['syncUrl'] = GlobalInfo.LOGIN_INFO.hostUrl;
        }

        res = await toBuffer(res);
        const bufferText = res.toString();
        const { ret, skey, wxsid, wxuin, pass_ticket } = ((parser.parse(bufferText)) || {}).error || {};
        if (ret === 0 && !!skey && !!wxsid && !!wxuin && !!pass_ticket) {
            GlobalInfo.LOGIN_INFO.skey = GlobalInfo.BaseRequest.Skey = skey;
            GlobalInfo.LOGIN_INFO.wxsid = GlobalInfo.BaseRequest.Sid = wxsid;
            GlobalInfo.LOGIN_INFO.wxuin = GlobalInfo.BaseRequest.Uin = wxuin;
            GlobalInfo.LOGIN_INFO.pass_ticket = pass_ticket;

            await this.webInit();
            await this.contactIns.getContact(true);

            //登录态存储
            saveGlobalInfo();

            this.startReceiving();
        } else {
            LogInfo(`Your wechat account may be LIMITED to log in WEB wechat, error info:${bufferText}`);
            return process.exit(0);
        }

    };

    startReceiving() {
        if (!this.autoReceiving) {
            return;
        }
        this.getMsgWhileDoing && this.getMsgWhileDoing.end();
        const doingFn = async () => {
            const selector = await this.syncCheck();
            LogInfo('selector: ' + selector);
            if (!selector || selector === '0') {
                return;
            }
            const msgInfo = await this.getMsg();
            if (!msgInfo) {
                return;
            }
            const { msgList, modContactList, delContactList } = msgInfo;
            this.messageIns.produceMsg(msgList)
            this.contactIns.updateContactList(modContactList);
            this.contactIns.deleteContactList(delContactList);
        };

        this.getMsgWhileDoing = new WhileDoing(doingFn);
        this.getMsgWhileDoing.start();

    };

    async syncCheck() {
        const url = `${GlobalInfo.LOGIN_INFO['syncUrl'] || GlobalInfo.LOGIN_INFO.hostUrl}/synccheck`;
        const params = {
            r: Date.now(),
            skey: GlobalInfo.LOGIN_INFO['skey'],
            sid: GlobalInfo.LOGIN_INFO['wxsid'],
            uin: GlobalInfo.LOGIN_INFO['wxuin'],
            deviceid: getDeviceID(),
            synckey: GlobalInfo.LOGIN_INFO.syncKeyStr,
            _: ++GlobalInfo.LOGIN_INFO['logintime'],
            json: false,
            buffer: true,
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        const res = await FetchWithExcept(url, params, 'window.synccheck={retcode:"0",selector:"0"}');
        const bufferText = res.toString();
        const reg = /window.synccheck={retcode:"(\d+)",selector:"(\d+)"}/;
        const match = bufferText.match(reg);

        if (match && match[1] === '0') {
            return match[2];
        }

        if (!match || ['1100', '1101', '1102'].indexOf(match[1]) === -1) {
            LogError('SyncCheck Net Error...' + (match ? match[1] : ''));
            return '0';
        }

        LogInfo('User Log Out...' + match[1]);
        this.getMsgWhileDoing.end();
        await this.login({ receiving: true, desktopMode: this.desktopMode });
    };

    async getMsg() {
        LogInfo('Getting Message...');
        const url = `${GlobalInfo.LOGIN_INFO.hostUrl}/webwxsync?sid=${GlobalInfo.LOGIN_INFO.wxsid}&skey=${GlobalInfo.LOGIN_INFO.skey}&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            BaseRequest: getBaseRequest(),
            method: 'post',
            json: false,//为了拿headers更新cookie
            SyncKey: GlobalInfo.LOGIN_INFO.syncKey,
            rr: ~new Date(),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };

        let res = await FetchWithExcept(url, params, { BaseResponse: { Ret: -1 } });
        //更新cookie
        if (res.headers && res.headers.raw && (typeof res.headers.raw) === 'function') {
            const cookieArr = (res.headers.raw() || {})['set-cookie'];
            GlobalInfo.LOGIN_INFO.cookies.updateCookies(cookieArr);
        }

        res = await toJSON(res).catch(e => {
            LogError(JSON.stringify('ToJSON Error：' + e));
        });

        this.setSyncKey(res && res.SyncKey)
        this.setSyncCheckKey(res && res.SyncCheckKey)

        if (!res || res.BaseResponse.Ret !== 0) {
            return;
        }

        GlobalInfo.LOGIN_INFO.syncKeyStr = ((GlobalInfo.LOGIN_INFO.syncCheckKey || GlobalInfo.LOGIN_INFO.syncKey).List || [])
            .map(item => item.Key + '_' + item.Val).join('|');

        return {
            msgList: res.AddMsgList,
            modContactList: res.ModContactList,
            delContactList: res.DelContactList
        }
    };

    async showMobileLogin() {
        const url = `${GlobalInfo.LOGIN_INFO.hostUrl}/webwxstatusnotify?lang=${GlobalInfo.LANG}&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;

        if (!GlobalInfo.LOGIN_INFO.cookies || !GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))) {
            return false;
        }

        const params = {
            method: 'post',
            BaseRequest: getBaseRequest(),
            Code: 3,
            FromUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            ToUserName: GlobalInfo.LOGIN_INFO.selfUserInfo.UserName,
            ClientMsgId: Date.now(),
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);
        const formatRes = new ReturnValueFormat(res);
        return formatRes.value().BaseResponse && formatRes.value().BaseResponse.Ret === 0;
    };

    async webInit() {
        let url = `${GlobalInfo.LOGIN_INFO.hostUrl}/webwxinit?r=${~new Date()}&lang=${GlobalInfo.LANG}&pass_ticket=${GlobalInfo.LOGIN_INFO.pass_ticket}`;
        const params = {
            BaseRequest: getBaseRequest(),
            method: 'post',
            headers: {
                cookie: GlobalInfo.LOGIN_INFO.cookies.getAll(getUrlDomain(url))
            }
        };
        const res = await Fetch(url, params);
        this.setSyncKey(res.SyncKey)
        GlobalInfo.LOGIN_INFO.skey = GlobalInfo.BaseRequest.Skey = res.SKey;

        GlobalInfo.LOGIN_INFO.syncKeyStr = (res.SyncKey.List || []).map(item => item.Key + '_' + item.Val).join('|');
        GlobalInfo.LOGIN_INFO['logintime'] = Date.now();


        GlobalInfo.LOGIN_INFO['InviteStartCount'] = res.InviteStartCount;
        emojiFormatter(res.User, 'NickName');
        GlobalInfo.LOGIN_INFO.selfUserInfo = structFriendInfo(res.User);
        // this.contactIns.memberList.push(GlobalInfo.LOGIN_INFO.selfUserInfo);

        // # deal with contact list returned when init
        this.contactIns.updateContactList(res.ContactList);
    };

    async run(options) {
        await this.login({ ...options, receiving: true });
    }

    async login({ receiving = false, desktopMode = false } = {}) {
        this.autoReceiving = receiving; // 监听消息
        this.desktopMode = desktopMode; // 桌面版本微信 hack某些微信号天生无法网页登录的缺陷
        await readAndMergeGlobalInfo();
        //清空可能上次登录获取的联系人列表
        this.contactIns.clearContactList();
        const isLogin = await this.showMobileLogin();
        if (isLogin) {
            await this.contactIns.getContact(true);
            this.startReceiving();
        } else {
            //首先唤起手机微信网页登陆
            if (!await this.webWxPushLogin()) {
                GlobalInfo.LOGIN_INFO.userId = await this.getUserId();
                this.drawQRImage(GlobalInfo.LOGIN_INFO.userId);
            }
            this.loginWhileDoing = new WhileDoing(async () => {
                await this.checkUserLogin(GlobalInfo.LOGIN_INFO.userId);
            });
            await this.loginWhileDoing.start();
        }
    }

    listen(emitName, msgType, callback) {
        if (!msgType) {
            msgType = [];
        }
        if (!isArray(msgType)) {
            msgType = [msgType];
        }
        this.on(emitName, (msgInfo, messageFrom) => {
            if (!msgType.length || msgType.indexOf(msgInfo.type) !== -1) {
                callback && callback(msgInfo, messageFrom);
            }
        })
    }

    setSyncKey(syncKey) {
        if (syncKey && syncKey.Count > 0) {
            GlobalInfo.LOGIN_INFO.syncKey = syncKey;
        } else {
            LogError("JS Function: setSyncKey. Error. no synckey");
        }
    }

    setSyncCheckKey(syncCheckKey) {
        if (syncCheckKey && syncCheckKey.Count > 0) {
            GlobalInfo.LOGIN_INFO.syncCheckKey = syncCheckKey;
        } else {
            LogError("JS Function: setSyncCheckKey. Error. no synccheckkey");
        }
    }
}

const EMIT_NAME = GlobalInfo.EMIT_NAME;
const MESSAGE_TYPE = GlobalInfo.MESSAGE_TYPE;


export {
    sendFile,
    sendImage,
    sendVideo,
    sendTextMsg,
    revokeMsg,
    transmitMsg,
    EMIT_NAME,
    MESSAGE_TYPE
}

export default NodeWeChat;
