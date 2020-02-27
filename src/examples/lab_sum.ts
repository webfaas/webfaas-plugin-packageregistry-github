"use strict";

import { ModuleManager } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";

var moduleManager = new ModuleManager();
moduleManager.getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("github", "", new PackageRegistry());

(async function(){
    try {
        var moduleObj: any = await moduleManager.getModuleManagerImport().import("@webfaaslabs/mathsum", "0.0.1", undefined, "github");
        
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