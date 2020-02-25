# WebFaas - Plugin - PackageRegistry - GitHub V3

WebFaaS Plugin for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

### Config - Simple
```json
{
    "registry.github": [
        {
            "name": "[registry name]",
            "url": "[url npm]"
        }
    ]
}
```

### Config - Complete
```json
{
    "registry.github": [
        {
            "name": "[registry name]",
            "url": "[url npm]",
            "token": "[token npm]",
            "slaveName": "[registry slave name]",
            "http": {
                "keepAlive": "true",
                "rejectUnauthorized": "true",
                "timeout":  100000,
                "maxSockets": 2,
                "key": "./crt/key.pem",
                "cert": "./crt/public.pem",
                "ca": "./crt/ca.pem"
            }
        }
    ]
}
```

### Example
```javascript
"use strict";

import { ModuleManager } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("github", "", new PackageRegistry());

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("@webfaaslabs/mathsum", "0.0.1", undefined, "github");
        
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("2 + 3 => ", moduleObj(2,3));
        }
        else{
            console.log("module not loaded");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@webfaas/webfaas-plugin-packageregistry-github.svg
[npm-url]: https://npmjs.org/package/@webfaas/webfaas-plugin-packageregistry-github

[travis-image]: https://img.shields.io/travis/webfaas/webfaas-plugin-packageregistry-github/master.svg?label=linux
[travis-url]: https://travis-ci.org/webfaas/webfaas-plugin-packageregistry-github

[coveralls-image]: https://img.shields.io/coveralls/github/webfaas/webfaas-plugin-packageregistry-github/master.svg
[coveralls-url]: https://coveralls.io/github/webfaas/webfaas-plugin-packageregistry-github?branch=master