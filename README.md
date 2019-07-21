# ItChat4JS
ItChat4JS -- 用NodeJs扩展个人微信号的能力

[ItChat]是一个非常优秀的开源微信个人号接口，使用Python语言开发，提供了简单易用的API，可以很方便地对个人微信号进行扩展，实现自动回复，微信挂机机器人等。
通过阅读和学习ItChat python源码，通过NodeJs完成了一个JS版本，由于主要灵感来源于itchat项目，所以这个项目的就暂时定名为ItChat4JS吧。

## 安装
可以通过本命令安装ItChat4JS：

```javascript
npm install itchat4js
```
## 简单入门实例

有了ItChat4JS，如果你想要给文件传输助手发一条信息，只需要这样：

```javascript
import ItChat4JS, { sendTextMsg } from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();

    await sendTextMsg('Hello FileHelper', 'filehelper');
};

doFn();

```

如果你想要回复发给自己的文本消息，只需要这样：

```javascript
import ItChat4JS, { sendTextMsg, EMIT_NAME, MESSAGE_TYPE  } from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

itChat4JsIns.listen(EMIT_NAME.FRIEND, MESSAGE_TYPE.TEXT, async (msgInfo, toUserName) => {
    const { text } = msgInfo;
    sendTextMsg(text, toUserName)
});

itChat4JsIns.run();

```
## 消息来源分类

```javascript
import { EMIT_NAME } from 'itchat4js';
console.log('消息来源分类', EMIT_NAME)
```
FRIEND：来自于微信好友的消息
CHAT_ROOM：来自于群聊的消息
MASSIVE_PLATFORM：来自于公众号、订阅号的消息

## 消息类型分类

```javascript
import { MESSAGE_TYPE } from 'itchat4js';
console.log('消息类型分类', MESSAGE_TYPE)
```
TEXT：文本消息
MAP：地图、位置消息
CARD：名片
NOTE：笔记
SHARING：分享
PICTURE：图片
RECORDING：
VOICE：语音
ATTACHMENT：附件文件
VIDEO：视频
FRIENDS：添加好友申请
SYSTEM：系统消息

## 各类型消息的注册

```javascript
import ItChat4JS, { sendTextMsg, EMIT_NAME, MESSAGE_TYPE  } from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const msgArr = [
    MESSAGE_TYPE.TEXT,
    MESSAGE_TYPE.PICTURE,
    MESSAGE_TYPE.FRIENDS,
    MESSAGE_TYPE.VIDEO,
];

itChat4JsIns.listen(EMIT_NAME.FRIEND, msgArr, async (msgInfo, toUserName) => {
    const { text, type, download } = msgInfo;
    if (type === MESSAGE_TYPE.PICTURE) {
        await download('download/friend/image');
    } else if (type === MESSAGE_TYPE.FRIENDS) {
        const { status, verifyContent, autoUpdate: { UserName } } = text;
        itChat4JsIns.verifyFriend(UserName, status, verifyContent)
    } else if (type === MESSAGE_TYPE.TEXT) {
        console.log(text)
    } else if (type === MESSAGE_TYPE.VIDEO) {
        await download('download/friend/video');
    }
});

itChat4JsIns.run();

```
## 常用的方法及使用

### 实例方法
####  1.登录  async itChat4JsIns.login()

异步方法，用户扫码登录，receiving：是否自动接收消息，默认false

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
};

doFn();

```

####  2.监听消息  listen(emitName, msgType, callback)

emitName：消息来源，参见EMIT_NAME
msgType： 消息类型，MESSAGE_TYPE。可以是string也可以是Array，也可以undefined或null
callback：处理消息的实际操作

callback参数：msgInfo, toUserName
msgInfo：经过处理之后的消息信息，包含：
text：文本内容
type：消息信息
filename：文件名
async download(path='', filename='', toStream=false)：下载
download 异步下载，可以指定下载路径和文件名。path不传，会以项目根路径为目录下载，filename不传会自动生成，下载之后不保存，以stream的形式返回，默认值false（目前还不支持）


```javascript
import ItChat4JS, { sendTextMsg, EMIT_NAME, MESSAGE_TYPE  } from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

itChat4JsIns.listen(EMIT_NAME.FRIEND, MESSAGE_TYPE.TEXT, async (msgInfo, toUserName) => {
    const { text } = msgInfo;
    sendTextMsg(text, toUserName)
});

itChat4JsIns.run();
```
####  3.好友添加及验证  async verifyFriend(userName, status = 2, verifyContent = '', autoUpdate = true)

userName：申请加好友的UserName
status： 操作类型，默认值为2。2：添加好友，3：验证好友申请
verifyContent：添加和被添加的验证内容
autoUpdate：是否更新本地好友信息，默认值为true

```javascript
import ItChat4JS, { sendTextMsg, EMIT_NAME, MESSAGE_TYPE  } from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

itChat4JsIns.listen(EMIT_NAME.FRIEND, MESSAGE_TYPE.FRIENDS, async (msgInfo, toUserName) => {
   const { status, verifyContent, autoUpdate: { UserName } } = text;
   itChat4JsIns.verifyFriend(UserName, status, verifyContent)
});

itChat4JsIns.run();
```
####  4.通过UserName或者NickName获取好友信息  getContactInfoByName(name)

name：UserName或者NickName

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();

    console.log(itChat4JsIns.getContactInfoByName('xxx'));
};

doFn()
```

### 静态方法
####  1.发送文件  async sendFile(fileDir, toUserName, mediaId, streamInfo = {})

异步方法，向指定好友发送文件。一般需要两步：1、上传，2、发送消息

两种方式发送：1、传入文件路径，自动上传和发送。2、传入stream信息，自动上传和发送

fileDir：发送的文件所在路径
toUserName：发送的好友UserName
mediaId：上传文件之后返回的MediaId
streamInfo：文件流信息,包含：fileReadStream文件流，filename文件名，extName文件扩展名

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    await sendFile('./file/txt.txt', 'filehelper');
};

doFn();

```
或者

```javascript
import ItChat4JS from 'itchat4js';

import fs from 'fs';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    const stream = fs.createReadStream('./file/txt.txt');
    const streamInfo = {
        fileReadStream: stream,
        filename: 'txt.txt',
        extName: '.txt'
    };
    sendFile(null, 'filehelper', null, streamInfo)
};

doFn()

```

####  2.发送图片  async sendImage(fileDir, toUserName, mediaId, streamInfo = {})

异步方法，向指定好友发送图片。一般需要两步：1、上传，2、发送消息

两种方式发送：1、传入文件路径，自动上传和发送。2、传入stream信息，自动上传和发送

fileDir：发送的文件所在路径
toUserName：发送的好友UserName
mediaId：上传文件之后返回的MediaId
streamInfo：文件流信息,包含：fileReadStream文件流，filename文件名，extName文件扩展名

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    await sendImage('./file/img.png', 'filehelper');
};

doFn();

```
或者

```javascript
import ItChat4JS from 'itchat4js';

import fs from 'fs';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    const stream = fs.createReadStream('./file/img.png');
    const streamInfo = {
        fileReadStream: stream,
        filename: 'img.png',
        extName: '.png'
    };
    sendImage(null, 'filehelper', null, streamInfo)
};

doFn()

```

####  3.发送视频  async sendVideo(fileDir, toUserName, mediaId, streamInfo = {})

异步方法，向指定好友发送视频。一般需要两步：1、上传，2、发送消息

两种方式发送：1、传入文件路径，自动上传和发送。2、传入stream信息，自动上传和发送

fileDir：发送的文件所在路径
toUserName：发送的好友UserName
mediaId：上传文件之后返回的MediaId
streamInfo：文件流信息,包含：fileReadStream文件流，filename文件名，extName文件扩展名

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    await sendVideo('./file/video.mp4', 'filehelper');
};

doFn();

```
或者

```javascript
import ItChat4JS from 'itchat4js';

import fs from 'fs';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    const stream = fs.createReadStream('./file/video.mp4');
    const streamInfo = {
        fileReadStream: stream,
        filename: 'video.mp4',
        extName: '.mp4'
    };
    sendVideo(null, 'filehelper', null, streamInfo)
};

doFn()

```

####  4.发送文本  async sendTextMsg(msg, toUserName)

msg：文本内容
toUserName：发送的好友UserName

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    await sendTextMsg('Hello File Helper', 'filehelper');
};

doFn();

```

####  4.撤回发送的消息  async revokeMsg(msgId, toUserName, localId)

```javascript
import ItChat4JS from 'itchat4js';

const itChat4JsIns = new ItChat4JS();

const doFn = async () => {
    await itChat4JsIns.login();
    const {MsgID, LocalID} =  await sendTextMsg('Hello File Helper', 'filehelper');
    revokeMsg(res.MsgID, username, res.LocalID);
};

doFn();
```

## Demo 
稍等片刻，正在整理中...

## 类似项目

[itchat](https://github.com/littlecodersh/ItChat) ：优秀的、基于Python的微信个人号API，同时也是本项目的灵感之源。

[WeixinBot](https://github.com/Urinx/WeixinBot): 网页版微信API，包含终端版微信及微信机器人


## 致谢：

感谢ItChat的开源，感谢ItChat作者

[LittleCoder][littlecodersh]: 构架及维护Python2 Python3版本。

[tempdban][tempdban]: 协议、构架及日常维护。

[Chyroc][Chyroc]: 完成第一版本的Python3构架。


## 问题和建议

本项目长期更新、维护，功能不断扩展与完善中，欢迎star。

项目使用过程中遇到问题，或者有好的建议，欢迎随时反馈。

任何问题或者建议都可以在Issue中提出来，也可以添加作者微信号kobezsj进行讨论。


[ItChat]: https://github.com/littlecodersh/ItChat
