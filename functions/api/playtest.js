import {forwardPlaytest} from '../../cloudflare/pages-api.mjs';
export const onRequest=({request,env})=>forwardPlaytest(request,env);
