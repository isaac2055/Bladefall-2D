// Pages owns the public URL; the private service binding owns API execution and storage.
// Forward the original request so same-origin checks, APK CORS and owner tokens
// are handled by the existing service, without URL/header or body rewriting.
export async function forwardPlaytest(request,env){
 if(!env.PLAYTEST_API?.fetch)return Response.json({error:'api-not-connected'},{status:503,headers:{'Cache-Control':'no-store'}});
 try{return await env.PLAYTEST_API.fetch(request);}
 catch{return Response.json({error:'api-unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
