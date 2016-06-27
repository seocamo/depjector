#depjector

this is a dependency injector for node 4.x <

##Installation
use npm for the installation, simple do
```
npm install depjector --save
```

*i am still testing in a bigger app, to find bugs/changes to fix before going up to 1.0*

##Dependencies and services
in depjector there is 2 kinds of Dependencies, the first is a normal commonJS module, the second one is a service, this is also a normal module, but it get a parameter that tell depjector that it is a service.

you can added settings for depjector in the form of a extra property to the module.exports object with the name __dependency.

ex.
```javascript
const MyDependency = function(dep1, dep2) {
    return {
        one: () => {
        ...
        },
        
        two: () => {
        ...
        },
        
        public: (app) => {
        }
    };
}

module.exports = MyDependency;

// the extra property
module.exports.__dependency = {
    // if you need to rename the dependency name
    name: "overwriteTheName",
    // the services this module supports
    service: ["service:one", "service:two", "routes:public"],
    // overwrite the dependencies if you want to name the parameters some thing else.
    args: ["overwriteDependency1", "dep2"],
    // if a module is finally it will be use raw as the dependency, good for config or other objects like db connection.
    finally: false
};
```

services is useful, because all the modules with the same service will be call in serial and this is useful for ex. express.js's routes, you can call a service with the express app object and get all the routes fill out without require files. 
this is also useful if you want to add a plugin to you app, just down in the files, and all the files is load next time you restart the app and all the new routes is added. 

##API

###create the object

```javascript
const Depjector = require("depjector");
const depjector = new Depjector();
```

###index dependency
you can use indexPath, indexDependencies, indexDependency to add dependencies to the store, then use one of the get methods to get them back out.
all the index methods is returning promises

indexPath is use for index all in a folder, it take a path(string) as parameter
```javascript
depjector.indexPath("./lib").then((countOfLoadedDependencies) => {
});
```

indexDependencies take a array of dependencies, and loop them and call indexDependency with each.
```javascript
depjector.indexDependencies([
    {path: "./lib/some.js"},
    {name: "more", path:"./justIn.js"},
    {path: "./services/routes.js", service: ["routes:public"]}
]).then(() => {
});
```

indexDependency is use for adding a dependency to the dependency store
```javascript
depjector.indexDependency({name: "more", path:"./justIn.js"}).then(() => {
});
```

###get dependency
getDependency, executeService

getDependency is creating a object of the type of the dependency and return it, if the dependency has it's own dependencies then they will be auto injected.
```javascript
const more = depjector.getDependency("more");
```

executeService runs service with the name in the first parameter and pass the rest in to the service, it return the results from all the module created for this call.
```javascript
const results = depjector.executeService("routes:public", arg1, arg2);
```


##TODO

* better docs
* fix bug in the unittests, so i can get 100% coverage (it is now but the modules i am using got a bug)