import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";

import { Log, LogLevelEnum, ClientHTTPConfig } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";
import { PackageRegistryConfig } from "../lib/PackageRegistryConfig";


var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry", () => {
    var packageRegistry_default = new PackageRegistry();
    var packageRegistry_full = new PackageRegistry(new PackageRegistryConfig("http://", undefined, "token1"), log);
    
    it("should return properties", function(){
        chai.expect(packageRegistry_default.getTypeName()).to.eq("github");
        chai.expect(packageRegistry_full.getTypeName()).to.eq("github");
        chai.expect(typeof(packageRegistry_full.getConfig())).to.eq("object");

        chai.expect(packageRegistry_full.parseETag("11")).to.eq("11");
        chai.expect(packageRegistry_full.parseETag("")).to.eq("");
        chai.expect(packageRegistry_full.parseETag(null)).to.eq("");
        chai.expect(packageRegistry_full.parseETag(undefined)).to.eq("");
    })

    it("buildHeaders - default", function(){
        let headers = packageRegistry_default.buildHeaders();
        headers["user-agent"] = "webfaas";
        chai.expect(headers["user-agent"]).to.eq("webfaas");
    })

    it("buildHeaders - full", function(){
        let headers = packageRegistry_full.buildHeaders();
        headers["user-agent"] = "webfaas";
        chai.expect(headers["user-agent"]).to.eq("webfaas");
        chai.expect(headers["authorization"]).to.eq("Bearer token1");
    })
})

describe("Package Registry - getPackage", () => {
    var packageRegistry_default = new PackageRegistry();

    it("getPackage - @webfaaslabs/mathsum 0.0.1", async function(){
        let packageRegistryResponse1 = await packageRegistry_default.getPackage("@webfaaslabs/mathsum", "0.0.1");
        chai.expect(packageRegistryResponse1).to.not.null;
        if (packageRegistryResponse1){
            let packageStore = packageRegistryResponse1.packageStore;
            chai.expect(packageStore).to.not.null;
            if (packageStore){
                chai.expect(packageStore.getEtag()).to.eq('W/"1a467bebcf5b38ffd17eb6dcaf84933f545f163d52e98d0667c22e292135a246"');

                let manifest = packageStore.getManifest();
                chai.expect(manifest).to.not.null;
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }
        }

        //retry with etag
        let packageRegistryResponse2 = await packageRegistry_default.getPackage("@webfaaslabs/mathsum", "0.0.1", 'W/"1a467bebcf5b38ffd17eb6dcaf84933f545f163d52e98d0667c22e292135a246"');
        chai.expect(packageRegistryResponse2).to.not.null;
        chai.expect(packageRegistryResponse2.packageStore).to.null;
        chai.expect(packageRegistryResponse2.etag).to.eq('W/"1a467bebcf5b38ffd17eb6dcaf84933f545f163d52e98d0667c22e292135a246"');
    })

    it("getPackage - notfound***", async function(){
        let packageRegistryResponse = await packageRegistry_default.getPackage("notfound***", "0.0.1");
        chai.expect(packageRegistryResponse.etag).to.eq("");
        chai.expect(packageRegistryResponse.packageStore).to.be.null;
    })

    /*
    it("getPackage - @@@@", async function(){
        try {
            let packageRegistryResponse = await packageRegistry_default.getPackage("@@@@", "@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error).to.eq(405);
        }
    })
    */

    it("getPackage - mock error", async function(){
        var packageRegistry_error = new PackageRegistry();
        packageRegistry_error.buildHeaders = function(){
            throw new Error("simulate error");
        }
        try {
            let packageRegistryResponse = await packageRegistry_error.getPackage("@@@@", "@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error.message).to.eq("simulate error");
        }
    })
})

describe("Package Registry - getManifest", () => {
    var packageRegistry_default = new PackageRegistry();

    it("getManifest - uuid", async function(){
        let packageRegistryResponse1 = await packageRegistry_default.getManifest("@webfaaslabs/mathsum");
        chai.expect(packageRegistryResponse1).to.not.null;
        if (packageRegistryResponse1){
            let packageStore = packageRegistryResponse1.packageStore;
            chai.expect(packageStore).to.not.null;
            if (packageStore){
                chai.expect(packageStore.getEtag()).to.contain('9d159e460b33645b7dd1d0c18cc988b5');

                let manifest = packageStore.getManifest();
                chai.expect(manifest).to.not.null;
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq(undefined);
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }
        }

        //retry with etag
        let packageRegistryResponse2 = await packageRegistry_default.getManifest("@webfaaslabs/mathsum", '"9d159e460b33645b7dd1d0c18cc988b5"');
        chai.expect(packageRegistryResponse2).to.not.null;
        chai.expect(packageRegistryResponse2.packageStore).to.null;
        chai.expect(packageRegistryResponse2.etag).to.contain('9d159e460b33645b7dd1d0c18cc988b5');
    })

    it("getManifest - notfound***", async function(){
        let packageRegistryResponse = await packageRegistry_default.getManifest("notfound***");
        chai.expect(packageRegistryResponse.etag).to.eq("");
        chai.expect(packageRegistryResponse.packageStore).to.be.null;
    })

    /*
    it("getManifest - @@@@", async function(){
        try {
            let packageRegistryResponse = await packageRegistry_default.getManifest("@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error).to.eq(405);
        }
    })
    */

    it("getManifest - mock error", async function(){
        var packageRegistry_error = new PackageRegistry();
        packageRegistry_error.buildHeaders = function(){
            throw new Error("simulate error");
        }
        try {
            let packageRegistryResponse = await packageRegistry_error.getManifest("@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error.message).to.eq("simulate error");
        }
    })
})