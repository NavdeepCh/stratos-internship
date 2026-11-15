// Cloudflare Worker: Firestore-verified registration notifications (no D1).
// Secrets: GOOGLE_SERVICE_ACCOUNT_JSON, BREVO_API_KEY.
// Optional variable: NOTIFY_TO_EMAIL (defaults to the mailbox below).
const PROJECT = 'stratos-global-edu';
const APP = 'stratos-global-edu';
const DATABASE = '(default)';
const ALLOWED_ORIGIN = 'https://stratos-internship.pages.dev';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DATABASE}/documents`;
const ORDERS = `artifacts/${APP}/public/data/orders`;
const MARKERS = 'stratosNotificationReceipts';
const encoder = new TextEncoder();
const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decodeBase64url = str => Uint8Array.from(atob(str.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(str.length/4)*4,'=')), c=>c.charCodeAt(0));
const json = (obj,status=200,origin=null) => new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}});
const field = (doc,key) => doc.fields?.[key]?.stringValue ?? '';
const pemToBytes = pem => Uint8Array.from(atob(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'')),c=>c.charCodeAt(0));
async function signJwt(account,scope){
  const now=Math.floor(Date.now()/1000);
  const head=base64url(encoder.encode(JSON.stringify({alg:'RS256',typ:'JWT'})));
  const body=base64url(encoder.encode(JSON.stringify({iss:account.client_email,scope,aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3500})));
  const key=await crypto.subtle.importKey('pkcs8',pemToBytes(account.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  return `${head}.${body}.${base64url(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,encoder.encode(`${head}.${body}`)))}`;
}
async function googleToken(env){
  const account=JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  if(account.project_id!==PROJECT) throw Error('Service account project mismatch');
  const assertion=await signJwt(account,'https://www.googleapis.com/auth/datastore');
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
  if(!r.ok) throw Error(`Google OAuth HTTP ${r.status}`);
  return (await r.json()).access_token;
}
async function verifyFirebaseIdToken(token){
  if(typeof token!=='string'||token.length>10000) throw Error('Invalid token');
  const parts=token.split('.');
  if(parts.length!==3) throw Error('Invalid token');
  const header=JSON.parse(new TextDecoder().decode(decodeBase64url(parts[0])));
  const payload=JSON.parse(new TextDecoder().decode(decodeBase64url(parts[1])));
  const now=Math.floor(Date.now()/1000);
  if(header.alg!=='RS256'||!header.kid||payload.aud!==PROJECT||payload.iss!==`https://securetoken.google.com/${PROJECT}`||typeof payload.sub!=='string'||!payload.sub||payload.exp<=now||payload.iat>now+60||payload.auth_time>now+60) throw Error('Invalid Firebase token claims');
  const keysResponse=await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if(!keysResponse.ok) throw Error('Unable to verify Firebase token');
  const cert=(await keysResponse.json())[header.kid];
  if(!cert) throw Error('Unknown Firebase signing key');
  // Convert Google's X.509 certificate into a CryptoKey via a JWK exposed by the Firebase JWKS endpoint.
  const jwksResponse=await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  if(!jwksResponse.ok) throw Error('Unable to retrieve Firebase verification keys');
  const jwk=(await jwksResponse.json()).keys.find(k=>k.kid===header.kid);
  if(!jwk) throw Error('Firebase signing key not found');
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decodeBase64url(parts[2]),encoder.encode(`${parts[0]}.${parts[1]}`));
  if(!valid) throw Error('Invalid Firebase signature');
  return payload;
}
async function firestore(path,accessToken,options={}){
  return fetch(`${ROOT}/${path}`,{...options,headers:{Authorization:`Bearer ${accessToken}`,...(options.headers||{})}});
}
async function notify(request,env,origin){
  if(!env.BREVO_API_KEY||!env.GOOGLE_SERVICE_ACCOUNT_JSON) return json({error:'Worker secrets not configured'},500,origin);
  const match=/^Bearer (.+)$/.exec(request.headers.get('Authorization')||'');
  if(!match) return json({error:'Firebase authentication required'},401,origin);
  let user;
  try {user=await verifyFirebaseIdToken(match[1]);}
  catch(e){console.warn('Firebase authentication rejected:',e.message);return json({error:'Invalid Firebase authentication'},401,origin);}
  let body;
  try {body=await request.json();}catch{return json({error:'Invalid JSON'},400,origin);}
  const orderId=body?.orderId;
  if(typeof orderId!=='string'||!/^[a-zA-Z0-9]{8,100}$/.test(orderId)) return json({error:'Invalid order ID'},400,origin);
  const token=await googleToken(env);
  const orderResponse=await firestore(`${ORDERS}/${orderId}`,token);
  if(orderResponse.status===404) return json({error:'Order not found'},404,origin);
  if(!orderResponse.ok) throw Error(`Firestore order read HTTP ${orderResponse.status}`);
  const order=await orderResponse.json();
  if(field(order,'userId')!==user.sub) return json({error:'Order ownership mismatch'},403,origin);
  if(!field(order,'email')||!field(order,'fullName')) return json({error:'Incomplete order'},422,origin);
  // One marker per order. Atomic create prevents concurrent duplicate sends.
  const markerUrl=`${ROOT}/${MARKERS}?documentId=${encodeURIComponent(orderId)}`;
  const marker=await fetch(markerUrl,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{orderId:{stringValue:orderId},status:{stringValue:'processing'},createdAt:{timestampValue:new Date().toISOString()}}})});
  if(marker.status===409) return json({status:'already_processed'},200,origin);
  if(!marker.ok) throw Error(`Notification marker creation HTTP ${marker.status}`);
  let accepted=false;
  try {
    const details=[['Order ID',orderId],['Name',field(order,'fullName')],['Email',field(order,'email')],['Phone',field(order,'phone')],['Track',field(order,'track')],['Sub-domain',field(order,'subDomain')],['Tier',field(order,'tier')],['Start',field(order,'startDate')],['End',field(order,'endDate')],['Payment',field(order,'paymentStatus')||'Pending']];
    const content='New Stratos internship registration\n\n'+details.map(([k,v])=>`${k}: ${v}`).join('\n')+'\n\nPayment is not confirmed by this notification.';
    const brevo=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'Content-Type':'application/json','api-key':env.BREVO_API_KEY},body:JSON.stringify({sender:{name:'Stratos Global Edu',email:'ravipullala22@gmail.com'},to:[{email:env.NOTIFY_TO_EMAIL||'stratosedu.notifications@proton.me'}],subject:`New Stratos registration: ${orderId}`,textContent:content})});
    if(!brevo.ok){console.error('Brevo rejected notification:',brevo.status,(await brevo.text()).slice(0,500));return json({error:'Email provider rejected notification'},502,origin);}
    accepted=true;
    console.info('Brevo accepted notification for order',orderId);
    return json({status:'accepted',orderId},200,origin);
  } finally {
    if(!accepted){
      // Allow another attempt if Brevo explicitly failed. A crash after acceptance may still need manual reconciliation.
      const cleanup=await firestore(`${MARKERS}/${orderId}`,token,{method:'DELETE'});
      if(!cleanup.ok) console.error('Unable to release notification marker',cleanup.status);
    }
  }
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(request.method==='GET'&&url.pathname==='/') return new Response('Stratos Notification Worker is running',{status:200});
    if(url.pathname!=='/registration-notification') return json({error:'Not found'},404);
    const origin=request.headers.get('Origin');
    if(origin&&origin!==ALLOWED_ORIGIN) return json({error:'Origin not allowed'},403);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'3600','Vary':'Origin'}});
    if(request.method!=='POST') return json({error:'Method not allowed'},405,origin);
    try{return await notify(request,env,origin);}catch(e){console.error('Notification failure:',e.message);return json({error:'Notification processing failed'},500,origin);}
  }
};
