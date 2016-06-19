'use strict';
class OtherMod {
    constructor(someMod) {
        console.log('Creating OtherMod');
        this.someMod = someMod;
    }

    callMe() {
        this.someMod.callMe();
    }
}

module.exports = OtherMod;
