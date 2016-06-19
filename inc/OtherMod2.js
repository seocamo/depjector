'use strict';
class OtherMod2 {
    constructor(someMod2) {
        console.log('Creating OtherMod2');
        this.someMod = someMod2;
    }

    callMe() {
        this.someMod.callMe();
    }
}

module.exports = OtherMod2;
