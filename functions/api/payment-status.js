const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const pemToBytes = pem => Uint8Array.from(atob(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,"")), c => c.charCodeAt(0));

async function googleAccessToken(env) {
  const account = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON || env.FIRESTORE_SERVICE_ACCOUNT_JSON);
  if (account.project_id !== "stratos-global-edu") throw new Error("Service account project mismatch");
  const now = Math.floor(Date.now()/1000);
  const encoder = new TextEncoder();
  const head = base64url(encoder.encode(JSON.stringify({alg:"RS256",typ:"JWT"})));
  const body = base64url(encoder.encode(JSON.stringify({iss:account.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3500})));
  const key = await crypto.subtle.importKey("pkcs8",pemToBytes(account.private_key),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const assertion = `${head}.${body}.${base64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,encoder.encode(`${head}.${body}`)))}`;
  const response = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:jwt-bearer",assertion})});
  if (!response.ok) throw new Error("Could not obtain Firestore access token");
  return (await response.json()).access_token;
}

function field(document, name) {
  const value = document.fields?.[name];
  if (!value) return "";
  return value.stringValue ?? value.integerValue ?? value.timestampValue ?? (typeof value.booleanValue === "boolean" ? String(value.booleanValue) : "");
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return Response.json({error:"Invalid JSON"}, {status:400}); }

  const registrationId = body.registrationId;
  const status = body.status;
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  if (!/^SGE-\d{2}-INT-\d{6}$/.test(registrationId || "")) return Response.json({error:"Invalid registration ID"}, {status:400});

  if (body.checkOnly) {
    const accessToken = await googleAccessToken(env);
    const root = "https://firestore.googleapis.com/v1/projects/stratos-global-edu/databases/(default)/documents";
    const registrationPath = `${root}/artifacts/stratos-global-edu/public/data/orders/${encodeURIComponent(registrationId)}`;
    const registrationResponse = await fetch(registrationPath,{headers:{Authorization:`Bearer ${accessToken}`}});
    if (!registrationResponse.ok) return Response.json({error:"Registration not found"}, {status:404});
    const registration = await registrationResponse.json();
    return Response.json({
      status:field(registration,"paymentStatus") || "Pending",
      paymentVerified:field(registration,"paymentVerified") === "true",
      gatewayOrderId:field(registration,"gatewayOrderId"),
      gatewayPaymentId:field(registration,"gatewayPaymentId"),
      registrationStatus:field(registration,"registrationStatus")
    });
  }
  if (!["Cancelled","Failed","Pending"].includes(status)) return Response.json({error:"Invalid payment status"}, {status:400});

  if (status === "Failed" && paymentId) {
    const authorization = "Basic " + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:authorization}});
    if (paymentResponse.ok) {
      const payment = await paymentResponse.json();
      if (payment.status === "captured") return Response.json({error:"Payment was captured"}, {status:409});
      if (orderId && payment.order_id !== orderId) return Response.json({error:"Razorpay order mismatch"}, {status:400});
    }
  }

  const accessToken = await googleAccessToken(env);
  const root = "https://firestore.googleapis.com/v1/projects/stratos-global-edu/databases/(default)/documents";
  const registrationPath = `${root}/artifacts/stratos-global-edu/public/data/orders/${encodeURIComponent(registrationId)}`;
  const registrationResponse = await fetch(registrationPath,{headers:{Authorization:`Bearer ${accessToken}`}});
  if (!registrationResponse.ok) return Response.json({error:"Registration not found"}, {status:404});
  const registration = await registrationResponse.json();
  if (field(registration,"paymentStatus") === "Paid") return Response.json({success:true,unchanged:true,status:"Paid"});

  const now = new Date().toISOString();
  const fields = {
    paymentProvider:"razorpay",
    paymentStatus:status,
    paymentGatewayStatus:status.toLowerCase(),
    paymentVerified:false,
    registrationStatus:status === "Cancelled" ? "Cancelled" : status === "Failed" ? "Payment Failed" : "Registered",
    paymentUpdatedAt:now
  };
  if (orderId) fields.gatewayOrderId = orderId;
  if (paymentId) fields.gatewayPaymentId = paymentId;

  const updates = {};
  for (const [key,value] of Object.entries(fields)) {
    updates[key] = typeof value==="boolean" ? {booleanValue:value} : key.endsWith("At") ? {timestampValue:value} : {stringValue:String(value)};
  }
  const mask = `?${Object.keys(updates).map(key=>`updateMask.fieldPaths=${encodeURIComponent(key)}`).join("&")}`;
  const patch = await fetch(`${registrationPath}${mask}`,{
    method:"PATCH",
    headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"},
    body:JSON.stringify({fields:updates})
  });
  if (!patch.ok) return Response.json({error:"Could not update payment state"}, {status:502});
  return Response.json({success:true,status});
}
