import { IncomingHttpHeaders } from "http";

import { Log } from "@webfaas/webfaas-core";
import { IManifest } from "@webfaas/webfaas-core";
import { IPackageRegistry, IPackageRegistryResponse } from "@webfaas/webfaas-core";
import { PackageStoreUtil, PackageStore, IPackageStoreItemData } from "@webfaas/webfaas-core";
import { ClientHTTP, ModuleNameUtil, IClientHTTPResponse } from "@webfaas/webfaas-core";

import { PackageRegistryConfig } from "./PackageRegistryConfig";

//doc api
//https://developer.github.com/v3/
//https://developer.github.com/v3/repos/contents/#get-archive-link

export class PackageRegistry implements IPackageRegistry {
    private config: PackageRegistryConfig;
    private clientHTTP: ClientHTTP;
    private log: Log;
    
    constructor(config?: PackageRegistryConfig, log?: Log){
        this.config = config || new PackageRegistryConfig();
        this.log = log || new Log();

        this.clientHTTP = new ClientHTTP(this.config.httpConfig, this.log);
    }

    /**
     * build headers
     */
    buildHeaders(): IncomingHttpHeaders{
        var headers: IncomingHttpHeaders = {};

        headers["user-agent"] = "webfaas";
        if (this.config.token){
            headers["authorization"] = "Bearer " + this.config.token;
        }
        headers["accept"] = "application/vnd.github.v3+json";
        return headers;
    }

    /**
     * return eTag
     * @param value 
     */
    parseETag(value: any): string{
        if (value){
            return value.toString();
        }
        else{
            return "";
        }
    }

    /**
     * return type name
     */
    getTypeName(): string{
        return "github";
    }

    /**
     * return config
     */
    getConfig(): PackageRegistryConfig{
        return this.config;
    }

    /**
     * return manifest in IPackageRegistryResponse
     * @param name manifest name
     * @param etag manifest etag
     */
    getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse>{
        return new Promise(async (resolve, reject) => {
            try {
                var headers: IncomingHttpHeaders = this.buildHeaders();
                var manifestResponseObj = {} as IPackageRegistryResponse;
                
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                //ex: https://api.github.com/repos/webfaaslabs/mathsum/tags
                
                var url = this.config.url + "/repos/" + name.replace("@", "") + "/tags";

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url, "GET", undefined, headers);

                if (respHTTP.statusCode === 200){
                    var header_etag: string = this.parseETag(respHTTP.headers["etag"]);
                    var listTags: any = JSON.parse(respHTTP.data.toString());
                    var versions = {} as any;
                    for (var i = 0; i < listTags.length; i++){
                        var itemTag: any = listTags[i];
                        versions[itemTag.name] = {name:name,"version":itemTag.name, description: itemTag.commit.sha};
                    }

                    var manifestObj = {} as IManifest;
                    manifestObj.name = name;
                    manifestObj.versions = versions;
                    var packageBuffer: Buffer = Buffer.from(JSON.stringify(manifestObj));

                    manifestResponseObj.packageStore = PackageStoreUtil.buildPackageStoreFromListBuffer(name, "", header_etag, [packageBuffer], ["package.json"]);

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = etag || "";

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = "";

                    resolve(manifestResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    /**
     * return package in IPackageRegistryResponse
     * @param name package name
     * @param version package version
     * @param etag package etag
     */
    getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                var headers: IncomingHttpHeaders = this.buildHeaders();
                var packageResponseObj = {} as IPackageRegistryResponse;
                
                //ex: https://api.github.com/repos/webfaaslabs/mathsum/tarball/0.0.1
                
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                var versionDownload = version;
                if (versionDownload.indexOf("0.0.0-") > -1){
                    versionDownload = versionDownload.split("-")[1];
                }
                var url = this.config.url + "/repos/" + name.replace("@", "") + "/tarball/" + versionDownload;

                var respHTTP: IClientHTTPResponse;
                
                respHTTP = await this.clientHTTP.request(url, "GET", undefined, headers);

                if ((respHTTP.statusCode === 302) && (respHTTP.headers.location)){ //redirect
                    respHTTP = await this.clientHTTP.request(respHTTP.headers.location, "GET", undefined, headers);
                }

                var header_etag: string = this.parseETag(respHTTP.headers["etag"]);
                
                if ((respHTTP.statusCode === 200) && (header_etag === etag)){
                    //github not support tarball etag ????
                    //SIMULATE NOT MODIFIED
                    respHTTP.statusCode = 304;
                }
                
                if (respHTTP.statusCode === 200){
                    /*
                    var bufferDecompressed: Buffer = PackageStoreUtil.unzipSync(respHTTP.data);
                    var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageStoreUtil.converBufferTarFormatToMapPackageItemDataMap(bufferDecompressed);
                    manifestResponseObj.packageStore = new PackageStore(name, version, resp_header_etag, bufferDecompressed, dataPackageItemDataMap);
                    */

                   packageResponseObj.packageStore = PackageStoreUtil.buildPackageStoreFromTarGzBuffer(name, version, header_etag, respHTTP.data);

                    resolve(packageResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    packageResponseObj.packageStore = null;
                    packageResponseObj.etag = etag || "";

                    resolve(packageResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    packageResponseObj.packageStore = null;
                    packageResponseObj.etag = "";

                    resolve(packageResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    start(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

    stop(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.clientHTTP){
                this.clientHTTP.destroy();
            }
            resolve();
        })
    }
}