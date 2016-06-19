"use strict";
module.exports = function(someMod4) {
    return {
        public: (app) => {
            app.add();
            console.log('app4 service', app);
        }
    };
}
module.exports.__dependency = {
    service:['routes:public']
}