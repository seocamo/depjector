'use strict';
class OtherMod3 {
    constructor(someMod3) {
        console.log('Creating OtherMod3');
        this.someMod = someMod3;
    }

    callMe() {
        this.someMod.callMe();
    }
}

module.exports = OtherMod3;
