"use strict";
module.exports = function(someMod3) {
    return {
        public: (app) => {
            app.add();
            console.log('app3 service', app);
        }
    };
}

module.exports.__dependency = {
    service:['routes:public']
};