"use strict";
module.exports = function(someMod1) {
    console.log(someMod1);
};

module.exports.__dependency = {
    args: ['arrow5']
};