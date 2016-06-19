'use strict';
class OtherMod4 {
    constructor(someMod4) {
        console.log('Creating OtherMod4');
        this.someMod = someMod4;
    }

    callMe() {
        this.someMod.callMe();
    }
}

module.exports = OtherMod4;
