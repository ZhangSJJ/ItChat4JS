/**
 * @time 2019/6/4
 */
'use strict';

class Chatoom {
    constructor() {

    }
}

class ContactList {
    constructor() {
        this.list = [];
        // this.contactInitFn = None
        // this.contactClass = User
    }

    getValue() {
        return this.list;
    }
}

export class User {
    constructor(user = {}) {
        this.user = user;
        this.verifyDict = {};
        this.contactListIns = new ContactList();
        this.user['MemberList'] = this.contactListIns.getValue();
    }

    getValue() {
        return this.user;
    }
}

export class MassivePlatform {
    constructor(user = {}) {
        this.user = user;
        this.contactListIns = new ContactList();
        this.user['MemberList'] = this.contactListIns.getValue();
    }

    getValue() {
        return this.user;
    }
}

export const wrapUserDict = (user) => {
    const userName = user.UserName;
    let ret = new MassivePlatform(user);
    if (userName.indexOf('@@')) {
        //todo
        // ret = Chatroom(user)
    } else if ((user.VerifyFlag || 8) & 8 === 0) {
        ret = new User(user)
    }

    return ret;
};




