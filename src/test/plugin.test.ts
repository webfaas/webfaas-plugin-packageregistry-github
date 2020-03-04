import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";

import { Core, LogLevelEnum } from "@webfaas/webfaas-core";

import WebFassPlugin from "../lib/WebFassPlugin";
import { Config } from "@webfaas/webfaas-core/lib/Config/Config";

describe("Plugin", () => {
    it("start and stop - new", async function(){
        let core = new Core();
        let plugin = new WebFassPlugin(core);
        chai.expect(typeof(plugin)).to.eq("object");
        core.getLog().changeCurrentLevel(LogLevelEnum.OFF);
        await plugin.startPlugin(core);
        await plugin.stopPlugin(core);
        await plugin.stopPlugin(core); //retry stop

        //config
        let configData = {
            "registry":{
                "github": [
                    {
                        "name": "github2",
                        "url": "https://api.github.com",
                        "http": {
                            "timeout": 100
                        }
                    }
                ]
            }
        }
        let core2 = new Core( new Config(configData) );
        let plugin2 = new WebFassPlugin(core2);
        core2.getLog().changeCurrentLevel(LogLevelEnum.OFF);
        chai.expect(core2.getPackageRegistryManager().getRegistryItem("github2")).to.not.null;
        chai.expect(core2.getPackageRegistryManager().getRegistryItem("github2")?.name).to.eq("github2");
    })
})