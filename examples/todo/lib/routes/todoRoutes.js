"use strict";

module.exports = (todoCtrl) => {
    return {
        public: (app) => {
            app.get("/todo", (req, res) => {
                res.send(todoCtrl.getAll());
            });
        }
    };
};

module.exports.__dependency = {service: ["routes:public"]};
