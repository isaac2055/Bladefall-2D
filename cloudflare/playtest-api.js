// API-only deployment of the existing Worker. The class, namespace and singleton
// identity are unchanged, so this neither forks nor duplicates stored scores.
import worker from './worker.js';
export {PlaytestStore} from './worker.js';
const paths=new Set(['/api/playtest','/.netlify/functions/playtest','/api/feedback-export','/api/workshop']);
export default {
 fetch(request,env,ctx){
  if(!paths.has(new URL(request.url).pathname))return new Response('Not found',{status:404});
  return worker.fetch(request,env,ctx);
 }
};
