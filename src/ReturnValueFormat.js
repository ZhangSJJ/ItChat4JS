/**
 * 请求返回值格式化
 * @time 2019/5/30
 */

const TRANSLATE = 'Chinese';
const TRANSLATION = {
    Chinese: {
        '-1000': '返回值不带BaseResponse',
        '-1001': '无法找到对应的成员',
        '-1002': '文件位置错误',
        '-1003': '服务器拒绝连接',
        '-1004': '服务器返回异常值',
        '-1005': '参数错误',
        '-1006': '无效操作',
        '0': '请求成功',
    }
};

export default class ReturnValueFormat {
    constructor(resDict = {}) {
        this.values = {};
        Object.keys(resDict).forEach(key => this.values[key] = resDict[key]);
        this.init()
    }

    init() {
        if (!this.values['BaseResponse']) {
            this.values['BaseResponse'] = {
                'ErrMsg': 'no BaseResponse in raw response',
                'Ret': -1000,
            }
        }
        if (!TRANSLATE) {
            return;
        }


        this.values['BaseResponse']['RawMsg'] = this.values['BaseResponse']['RawMsg'] || '';
        const ret = this.values['BaseResponse']['Ret']
        this.values['BaseResponse']['ErrMsg'] = this.values['BaseResponse']['ErrMsg'] || 'No ErrMsg';
        if (TRANSLATION[TRANSLATE][ret]) {
            this.values['BaseResponse']['ErrMsg'] = TRANSLATION[TRANSLATE][ret];
        }
        this.values['BaseResponse']['RawMsg'] = this.values['BaseResponse']['RawMsg'] || this.values['BaseResponse']['ErrMsg']
    }

    bool() {
        return +this.values['BaseResponse']['Ret'] === 0
    }

    value() {
        return this.values;
    }
}