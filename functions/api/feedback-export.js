import {forwardPlaytest} from '../../cloudflare/pages-api.mjs';
// The existing Worker requires its private FEEDBACK_EXPORT_TOKEN for this route.
export const onRequest=({request,env})=>forwardPlaytest(request,env);
