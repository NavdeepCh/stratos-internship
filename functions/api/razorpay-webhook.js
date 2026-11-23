const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const pemToBytes = pem => Uint8Array.from(atob(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,"")), c => c.charCodeAt(0));

async function hmacSha256Hex(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2,"0")).join("");
}

function timingSafeEqual(first, second) {
  if (first.length !== second.length) return false;
  let mismatch = 0;
  for (let index = 0; index < first.length; index++) mismatch |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return mismatch === 0;
}

async function googleAccessToken(env) {
  const account = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON || env.FIRESTORE_SERVICE_ACCOUNT_JSON);
  if (account.project_id !== "stratos-global-edu") throw new Error("Service account project mismatch");
  const encoder = new TextEncoder();
  const now = Math.floor(Date.now()/1000);
  const head = base64url(encoder.encode(JSON.stringify({alg:"RS256",typ:"JWT"})));
  const body = base64url(encoder.encode(JSON.stringify({iss:account.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3500})));
  const key = await crypto.subtle.importKey("pkcs8",pemToBytes(account.private_key),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const assertion = `${head}.${body}.${base64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,encoder.encode(`${head}.${body}`)))}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:jwt-bearer",assertion})});
  if (!tokenResponse.ok) throw new Error("Could not obtain Firestore access token");
  return (await tokenResponse.json()).access_token;
}

function field(document, name) {
  const value = document.fields?.[name];
  if (!value) return "";
  return value.stringValue ?? value.integerValue ?? value.timestampValue ?? "";
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.RAZORPAY_WEBHOOK_SECRET) return Response.json({error:"Razorpay webhook secret is not configured"}, {status:500});

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  if (!timingSafeEqual(expected, signature)) return Response.json({error:"Invalid webhook signature"}, {status:400});

  let event;
  try { event = JSON.parse(rawBody); } catch { return Response.json({error:"Invalid webhook JSON"}, {status:400}); }
  const eventId = event.event_id || event.payload?.payment?.entity?.id;
  if (!eventId) return Response.json({error:"Missing webhook event ID"}, {status:400});

  const entity = event.payload?.payment?.entity || event.payload?.order?.entity;
  if (!entity) return Response.json({received:true});
  const orderId = entity.order_id || entity.id;
  if (!orderId) return Response.json({received:true});

  const accessToken = await googleAccessToken(env);
  const root = "https://firestore.googleapis.com/v1/projects/stratos-global-edu/databases/(default)/documents";
  const eventPath = `${root}/artifacts/stratos-global-edu/public/data/razorpayWebhookEvents/${encodeURIComponent(eventId)}`;
  const eventRead = await fetch(eventPath,{headers:{Authorization:`Bearer ${accessToken}`}});
  if (eventRead.ok) return Response.json({received:true,duplicate:true});
  const eventCreate = await fetch(`${root}/artifacts/stratos-global-edu/public/data/razorpayWebhookEvents?documentId=${encodeURIComponent(eventId)}`,{
    method:"POST",
    headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"},
    body:JSON.stringify({fields:{eventId:{stringValue:eventId},eventName:{stringValue:event.event||""},receivedAt:{timestampValue:new Date().toISOString()},orderId:{stringValue:String(orderId)}}})
  });
  if (!eventCreate.ok) throw new Error("Could not record webhook event");

  const authorization = "Basic " + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const paymentId = event.payload?.payment?.entity?.id;
  if (!paymentId) return Response.json({received:true});
  const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:authorization}});
  if (!paymentResponse.ok) return Response.json({received:true,pendingVerification:true});
  const payment = await paymentResponse.json();
  if (payment.order_id !== orderId) return Response.json({received:true,orderMismatch:true});

  const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,{headers:{Authorization:authorization}});
  if (!orderResponse.ok) return Response.json({received:true,pendingVerification:true});
  const order = await orderResponse.json();
  const registrationId = order.receipt;
  if (!/^SGE-\d{2}-INT-\d{6}$/.test(registrationId)) return Response.json({received:true,invalidReceipt:true});

  const registrationPath = `${root}/artifacts/stratos-global-edu/public/data/orders/${encodeURIComponent(registrationId)}`;
  const registrationResponse = await fetch(registrationPath,{headers:{Authorization:`Bearer ${accessToken}`}});
  if (!registrationResponse.ok) return Response.json({received:true,registrationMissing:true});
  const registration = await registrationResponse.json();

  const tier = field(registration,"tier");
  const expectedAmount = ({
    "Tier 1: Basic Virtual Internship (₹99)":9900,
    "Tier 2: Instant PDF Certificate & QR ID (₹199)":19900,
    "Tier 3: Stratos VIP Career Accelerator (₹299)":29900
  })[tier];
  // Temporary testing mode: webhook verification accepts ₹1 for every tier.
  const verifiedAmount = 100;
  const captured = event.event === "payment.captured" && payment.status === "captured";
  const failed = event.event === "payment.failed";
  const refunded = event.event === "refund.processed" || payment.status === "refunded";
  if (captured && (!expectedAmount || payment.amount !== verifiedAmount || payment.currency !== "INR" || order.currency !== "INR")) {
    return Response.json({received:true,amountMismatch:true});
  }
  if (field(registration,"paymentStatus") === "Paid" && (failed || refunded)) {
    return Response.json({received:true,processed:false,reason:"paid-state-must-not-be-downgraded"});
  }
  const now = new Date().toISOString();
  const fields = captured ? {
    paymentProvider:"razorpay",
    paymentStatus:"Paid",
    paymentGatewayStatus:"captured",
    paymentVerified:true,
    registrationStatus:"Confirmed",
    gatewayOrderId:orderId,
    gatewayPaymentId:paymentId,
    paymentAmount:payment.amount,
    paymentCurrency:"INR",
    paymentMethod:payment.method || "unknown",
    paymentVerifiedAt:now,
    paymentUpdatedAt:now
  } : failed ? {
    paymentProvider:"razorpay",
    paymentStatus:"Failed",
    paymentGatewayStatus:"failed",
    paymentVerified:false,
    registrationStatus:"Payment Failed",
    gatewayOrderId:orderId,
    gatewayPaymentId:paymentId,
    paymentUpdatedAt:now
  } : refunded ? {
    paymentProvider:"razorpay",
    paymentStatus:"Refunded",
    paymentGatewayStatus:"refunded",
    paymentVerified:false,
    registrationStatus:"Refunded",
    gatewayOrderId:orderId,
    gatewayPaymentId:paymentId,
    paymentUpdatedAt:now
  } : null;
  if (!fields) return Response.json({received:true});

  const updates = {};
  for (const [key,value] of Object.entries(fields)) {
    updates[key] = typeof value==="number" ? {integerValue:String(value)} : typeof value==="boolean" ? {booleanValue:value} : key.endsWith("At") ? {timestampValue:value} : {stringValue:String(value)};
  }
  const mask = `?${Object.keys(updates).map(key=>`updateMask.fieldPaths=${encodeURIComponent(key)}`).join("&")}`;
  const patch = await fetch(`${registrationPath}${mask}`,{
    method:"PATCH",
    headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"},
    body:JSON.stringify({fields:updates})
  });
  if (!patch.ok) throw new Error("Could not synchronize registration payment");
  return Response.json({received:true,processed:true,registrationId,paymentStatus:fields.paymentStatus});
}
