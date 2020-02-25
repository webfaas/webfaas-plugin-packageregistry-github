import { ClientHTTPConfig } from "@webfaas/webfaas-core";

export class PackageRegistryConfig  {
    url: string
    token: string
    httpConfig: ClientHTTPConfig

    constructor(url?: string, httpConfig?: ClientHTTPConfig, token?: string){
        if (url){
            this.url = url;
        }
        else{
            this.url = "https://api.github.com";
        }

        if (httpConfig){
            this.httpConfig = httpConfig;
        }
        else{
            this.httpConfig = new ClientHTTPConfig();
        }

        if (token){
            this.token = token;
        }
        else{
            this.token = "";
        }
    }
}