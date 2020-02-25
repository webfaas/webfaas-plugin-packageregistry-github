import * as chai from "chai";
import * as mocha from "mocha";

import { ClientHTTPConfig } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";
import { PackageRegistryConfig } from "../lib/PackageRegistryConfig";

describe("Package Registry Config", () => {
    it("config1 - should return properties", function(){
        var config_1 = new PackageRegistryConfig("url1", new ClientHTTPConfig(), "token1");
        chai.expect(config_1.url).to.eq("url1");
        chai.expect(config_1.token).to.eq("token1");
        chai.expect(config_1.httpConfig).to.be.an.instanceof(Object);
    })

    it("config2 - should return properties", function(){
        var config_2 = new PackageRegistryConfig();
        config_2.url = "https://";
        
        chai.expect(config_2.url).to.eq("https://");
        chai.expect(config_2.token).to.eq("");
        chai.expect(config_2.httpConfig).to.be.an.instanceof(Object);
    })

    it("config3 - should return properties", function(){
        var config_3 = new PackageRegistryConfig("https://");
        
        chai.expect(config_3.url).to.eq("https://");
        chai.expect(config_3.token).to.eq("");
        chai.expect(config_3.httpConfig).to.be.an.instanceof(Object);
    })
})