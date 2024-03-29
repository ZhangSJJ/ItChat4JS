/**
 * @time 2019/6/15
 */
'use strict';
const VERSION = '1.3.10';

const LANG = 'zh_CN';

const APP_ID = 'wx782c26e4c19acffb';

// 桌面版本微信登录额外添加的header
const DESKTOP_MODE_HEADER = {
    extspam:
        "Gp8ICJkIEpkICggwMDAwMDAwMRAGGoAI1GiJSIpeO1RZTq9QBKsRbPJdi84ropi16EYI10WB6g74sGmRwSNXjPQnYUKYotKkvLGpshucCaeWZMOylnc6o2AgDX9grhQQx7fm2DJRTyuNhUlwmEoWhjoG3F0ySAWUsEbH3bJMsEBwoB//0qmFJob74ffdaslqL+IrSy7LJ76/G5TkvNC+J0VQkpH1u3iJJs0uUYyLDzdBIQ6Ogd8LDQ3VKnJLm4g/uDLe+G7zzzkOPzCjXL+70naaQ9medzqmh+/SmaQ6uFWLDQLcRln++wBwoEibNpG4uOJvqXy+ql50DjlNchSuqLmeadFoo9/mDT0q3G7o/80P15ostktjb7h9bfNc+nZVSnUEJXbCjTeqS5UYuxn+HTS5nZsPVxJA2O5GdKCYK4x8lTTKShRstqPfbQpplfllx2fwXcSljuYi3YipPyS3GCAqf5A7aYYwJ7AvGqUiR2SsVQ9Nbp8MGHET1GxhifC692APj6SJxZD3i1drSYZPMMsS9rKAJTGz2FEupohtpf2tgXm6c16nDk/cw+C7K7me5j5PLHv55DFCS84b06AytZPdkFZLj7FHOkcFGJXitHkX5cgww7vuf6F3p0yM/W73SoXTx6GX4G6Hg2rYx3O/9VU2Uq8lvURB4qIbD9XQpzmyiFMaytMnqxcZJcoXCtfkTJ6pI7a92JpRUvdSitg967VUDUAQnCXCM/m0snRkR9LtoXAO1FUGpwlp1EfIdCZFPKNnXMeqev0j9W9ZrkEs9ZWcUEexSj5z+dKYQBhIICviYUQHVqBTZSNy22PlUIeDeIs11j7q4t8rD8LPvzAKWVqXE+5lS1JPZkjg4y5hfX1Dod3t96clFfwsvDP6xBSe1NBcoKbkyGxYK0UvPGtKQEE0Se2zAymYDv41klYE9s+rxp8e94/H8XhrL9oGm8KWb2RmYnAE7ry9gd6e8ZuBRIsISlJAE/e8y8xFmP031S6Lnaet6YXPsFpuFsdQs535IjcFd75hh6DNMBYhSfjv456cvhsb99+fRw/KVZLC3yzNSCbLSyo9d9BI45Plma6V8akURQA/qsaAzU0VyTIqZJkPDTzhuCl92vD2AD/QOhx6iwRSVPAxcRFZcWjgc2wCKh+uCYkTVbNQpB9B90YlNmI3fWTuUOUjwOzQRxJZj11NsimjOJ50qQwTTFj6qQvQ1a/I+MkTx5UO+yNHl718JWcR3AXGmv/aa9rD1eNP8ioTGlOZwPgmr2sor2iBpKTOrB83QgZXP+xRYkb4zVC+LoAXEoIa1+zArywlgREer7DLePukkU6wHTkuSaF+ge5Of1bXuU4i938WJHj0t3D8uQxkJvoFi/EYN/7u2P1zGRLV4dHVUsZMGCCtnO6BBigFMAA=",
    "client-version": "2.0.0",
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';

const BaseRequest = {
    Skey: '',
    Sid: '',
    Uin: '',
    DeviceID: ''
};
const LOGIN_INFO = {
    logintime: '',
    hostUrl: 'https://wx.qq.com/cgi-bin/mmwebwx-bin',
    loginUrl: 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin',
    fileUrl: 'https://file.wx.qq.com/cgi-bin/mmwebwx-bin',
    syncUrl: 'https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin',
    userId: '',

    skey: '',
    wxsid: '',
    wxuin: '',
    pass_ticket: '',
    syncKey: '',
    syncCheckKey: '',
    syncKeyStr: '',
    selfUserInfo: {},

};

const EMIT_NAME = {
    FRIEND: 'FRIEND',
    CHAT_ROOM: 'CHAT_ROOM',
    MASSIVE_PLATFORM: 'MASSIVE_PLATFORM'
};
const MESSAGE_TYPE = {
    TEXT: 'Text',
    MAP: 'Map',
    CARD: 'Card',
    NOTE: 'Note',
    SHARING: 'Sharing',
    PICTURE: 'Picture',
    RECORDING: 'Recording',
    VOICE: 'Recording',
    ATTACHMENT: 'Attachment',
    VIDEO: 'Video',
    FRIENDS: 'Friends',
    SYSTEM: 'System',
};

export default {
    VERSION,
    APP_ID,
    USER_AGENT,
    BaseRequest,
    LOGIN_INFO,
    EMIT_NAME,
    MESSAGE_TYPE,
    LANG,
    DESKTOP_MODE_HEADER
};
