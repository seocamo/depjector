'use strict';
class OtherMod1 {
    constructor(someMod1) {
        console.log('Creating OtherMod1');
        this.someMod = someMod1;
    }

    callMe() {
        this.someMod.callMe();
    }
}

module.exports = OtherMod1;
