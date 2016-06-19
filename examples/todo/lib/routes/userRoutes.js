"use strict";

module.exports = (userCtrl) => {
    return {
        public: (app) => {
            app.get("/user", (req, res) => {
                res.send(userCtrl.getAll());
            });
        }
    };
};

module.exports.__dependency = {service: ["routes:public"]};
