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
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function registrationHtml(order,orderId){
  return `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#171b19">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;border:1px solid #d9ddd5;overflow:hidden">
  <tr><td style="background:#202723;padding:22px;color:#fff;font-weight:800">STRATOS GLOBAL EDUCATION</td></tr>
  <tr><td style="padding:28px"><h1 style="font-size:22px;margin:0 0 12px">📝 Registration Received</h1>
  <p>Hello ${escapeHtml(field(order,'fullName')||'Student')},</p><p>We received your internship registration. Payment is currently <strong>⏳ Payment Pending</strong>.</p>
  <div style="background:#f5f5f0;border-radius:12px;padding:16px;font-size:14px;line-height:1.8"><strong>Registration ID:</strong> ${escapeHtml(orderId)}<br><strong>Domain:</strong> ${escapeHtml(field(order,'track')||field(order,'domain'))}<br><strong>Tier:</strong> ${escapeHtml(field(order,'tier'))}</div>
  <p style="font-size:13px;color:#6b716c">Complete the payment to confirm your registration.</p></td></tr></table></td></tr></table></body></html>`;
}

function paymentHtml(order,orderId){
  const amount=Number(field(order,'paymentAmount')||0)/100;
  const date=field(order,'paymentVerifiedAt')||new Date().toISOString();
  return `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#171b19">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;border:1px solid #d9ddd5;overflow:hidden">
  <tr><td style="background:#202723;padding:22px;color:#c9f36a;font-weight:800">STRATOS GLOBAL EDUCATION</td></tr>
  <tr><td style="padding:28px"><h1 style="font-size:22px;margin:0 0 12px">✅ PAYMENT SUCCESSFULLY VERIFIED</h1>
  <p>Hello ${escapeHtml(field(order,'fullName')||'Student')},</p><p>Your payment has been successfully verified and your internship registration is confirmed.</p>
  <h2 style="font-size:14px;margin:24px 0 8px">REGISTRATION DETAILS</h2><div style="background:#f5f5f0;border-radius:12px;padding:16px;font-size:14px;line-height:1.9">
  <strong>Registration ID:</strong> ${escapeHtml(orderId)}<br><strong>Internship Category:</strong> ${escapeHtml(field(order,'category')||'Internship')}<br><strong>Selected Domain:</strong> ${escapeHtml(field(order,'track')||field(order,'domain'))}<br><strong>Specialization:</strong> ${escapeHtml(field(order,'subDomain'))}<br><strong>Selected Tier:</strong> ${escapeHtml(field(order,'tier'))}</div>
  <h2 style="font-size:14px;margin:24px 0 8px">PAYMENT DETAILS</h2><div style="background:#edf8dd;border:1px solid #c9f36a;border-radius:12px;padding:16px;font-size:14px;line-height:1.9">
  <strong>Payment Status:</strong> ✅ PAID<br><strong>Payment Verification:</strong> ✅ VERIFIED<br><strong>Amount Paid:</strong> ₹${escapeHtml(amount.toFixed(2))}<br><strong>Payment Method:</strong> ${escapeHtml(field(order,'paymentMethod'))}<br><strong>Razorpay Payment ID:</strong> ${escapeHtml(field(order,'gatewayPaymentId'))}<br><strong>Payment Date:</strong> ${escapeHtml(date)}</div>
  <h2 style="font-size:14px;margin:24px 0 8px">NEXT STEPS</h2><p>Sign in to your Stratos student dashboard to access your registered internship and complete the required activities.</p>
  <p><strong>VIEW MY INTERNSHIPS</strong></p><p>Thank you for choosing Stratos Global Education.<br><strong>Stratos Support Team</strong></p></td></tr></table></td></tr></table></body></html>`;
}

async function notify(request,env,origin){
  if(!env.BREVO_API_KEY||!env.GOOGLE_SERVICE_ACCOUNT_JSON) return json({error:'Worker secrets not configured'},500,origin);
  const match=/^Bearer (.+)$/.exec(request.headers.get('Authorization')||'');
  if(!match) return json({error:'Firebase authentication required'},401,origin);
  let user;
  try {user=await verifyFirebaseIdToken(match[1]);}
  catch(e){return json({error:'Invalid Firebase authentication'},401,origin);}
  let body;
  try {body=await request.json();}catch{return json({error:'Invalid JSON'},400,origin);}
  const orderId=body?.orderId;
  const event=body?.event==='payment'?'payment':'registration';
  if(typeof orderId!=='string'||!/^SGE-\d{2}-INT-\d{6}$/.test(orderId)) return json({error:'Invalid registration ID'},400,origin);
  const token=await googleToken(env);
  const orderResponse=await firestore(`${ORDERS}/${orderId}`,token);
  if(orderResponse.status===404) return json({error:'Order not found'},404,origin);
  if(!orderResponse.ok) throw Error(`Firestore order read HTTP ${orderResponse.status}`);
  const order=await orderResponse.json();
  if(field(order,'userId')!==user.sub) return json({error:'Order ownership mismatch'},403,origin);
  if(!field(order,'email')||!field(order,'fullName')) return json({error:'Incomplete order'},422,origin);
  if(event==='payment'&&(field(order,'paymentStatus')!=='Paid'||field(order,'paymentVerified')!=='true')) return json({error:'Payment is not verified'},409,origin);

  const markerId=`${orderId}:${event}`;
  const markerResponse=await firestore(`${MARKERS}/${markerId}`,token,{method:'GET'});
  if(markerResponse.ok) return json({status:'already_processed',orderId,event},200,origin);
  const markerCreate=await firestore(`${MARKERS}/${markerId}`,token,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{orderId:{stringValue:orderId},event:{stringValue:event},status:{stringValue:'processing'},createdAt:{timestampValue:new Date().toISOString()}}})});
  if(!markerCreate.ok) throw Error(`Notification marker creation HTTP ${markerCreate.status}`);

  const studentEmail=field(order,'email');
  const subject=event==='payment'?`✅ Payment Confirmed | Stratos — ${orderId}`:`📝 Registration Received | Stratos — ${orderId}`;
  const html=event==='payment'?paymentHtml(order,orderId):registrationHtml(order,orderId);
  const brevo=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'Content-Type':'application/json','api-key':env.BREVO_API_KEY},body:JSON.stringify({sender:{name:'Stratos Global Edu',email:'ravipullala22@gmail.com'},to:[{email:studentEmail},{email:env.NOTIFY_TO_EMAIL||'stratosedu.notifications@proton.me'}],subject,htmlContent:html})});
  if(!brevo.ok){
    await firestore(`${MARKERS}/${markerId}`,token,{method:'DELETE'});
    return json({error:'Email provider rejected notification'},502,origin);
  }
  return json({status:'accepted',orderId,event},200,origin);
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
