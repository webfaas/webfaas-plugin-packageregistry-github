import { Core, IPlugin } from "@webfaas/webfaas-core";

import WebFassPlugin from "./WebFassPlugin";

export default function(core: Core): IPlugin{
    if (core.getVersionObj().major !== "0"){
        throw new Error("plugin only supports version 0.x of webfaas-core");
    }
    return new WebFassPlugin(core);
}