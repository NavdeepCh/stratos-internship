async function hmacSha256(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(first, second) {
  if (first.length !== second.length) return false;
  let mismatch = 0;
  for (let index = 0; index < first.length; index++) {
    mismatch |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/, "");
  const pemToBytes = pem => Uint8Array.from(atob(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "")), c => c.charCodeAt(0));

  async function googleAccessToken(env) {
    const account = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON || env.FIRESTORE_SERVICE_ACCOUNT_JSON);
    if (account.project_id !== "stratos-global-edu") throw new Error("Service account project mismatch");
    const now = Math.floor(Date.now() / 1000);
    const encoder = new TextEncoder();
    const head = base64url(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
    const body = base64url(encoder.encode(JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3500
    })));
    const key = await crypto.subtle.importKey("pkcs8", pemToBytes(account.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const assertion = `${head}.${body}.${base64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(`${head}.${body}`)))}`;
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:jwt-bearer", assertion })
    });
    if (!response.ok) throw new Error("Could not obtain Firestore access token");
    return (await response.json()).access_token;
  }

  async function verifyFirebaseToken(request, env) {
    const match = /^Bearer (.+)$/.exec(request.headers.get("Authorization") || "");
    if (!match) return null;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: match[1] })
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result.users?.[0]?.localId || null;
  }

  function field(document, name) {
    const value = document.fields?.[name];
    if (!value) return "";
    return value.stringValue ?? value.integerValue ?? value.timestampValue ?? "";
  }

  async function patchFirestoreOrder(registrationId, fields, env) {
    const accessToken = await googleAccessToken(env);
    const root = "https://firestore.googleapis.com/v1/projects/stratos-global-edu/databases/(default)/documents";
    const updates = {};
    for (const [key, value] of Object.entries(fields)) {
      updates[key] = typeof value === "number"
        ? { integerValue: String(value) }
        : typeof value === "boolean"
          ? { booleanValue: value }
          : key.endsWith("At")
            ? { timestampValue: value }
            : { stringValue: String(value) };
    }
    const mask = `?${Object.keys(updates).map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join("&")}`;
    return fetch(`${root}/artifacts/stratos-global-edu/public/data/orders/${encodeURIComponent(registrationId)}${mask}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: updates })
    });
  }
  return mismatch === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return Response.json({ error: "Razorpay credentials are not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentId = body.razorpay_payment_id;
  const orderId = body.razorpay_order_id;
  const signature = body.razorpay_signature;
  const registrationId = body.registrationId;
  if (!paymentId || !orderId || !signature || !registrationId) {
    return Response.json({ error: "Missing Razorpay payment fields" }, { status: 400 });
  }

  if (!/^SGE-\d{2}-INT-\d{6}$/.test(registrationId)) {
    return Response.json({ error: "Invalid registration ID" }, { status: 400 });
  }

  const firebaseUid = await verifyFirebaseToken(request, env);
  if (!firebaseUid) return Response.json({ error: "Firebase authentication required" }, { status: 401 });

  const expected = await hmacSha256(
    env.RAZORPAY_KEY_SECRET,
    `${orderId}|${paymentId}`
  );

  if (!timingSafeEqual(expected, signature)) {
    return Response.json({ error: "Payment signature mismatch" }, { status: 400 });
  }

  const authorization = "Basic " + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  let paymentResponse;
  try {
    paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { "Authorization": authorization }
    });
  } catch {
    return Response.json({ error: "Razorpay verification service unavailable" }, { status: 500 });
  }

  const payment = await paymentResponse.json().catch(() => ({}));
  if (!paymentResponse.ok) {
    return Response.json({ error: "Could not verify payment with Razorpay" }, { status: 502 });
  }
  if (payment.order_id !== orderId || payment.status !== "captured") {
    return Response.json({ error: "Payment is not captured for this order" }, { status: 400 });
  }

  const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: authorization } });
  if (!orderResponse.ok) return Response.json({ error: "Could not verify Razorpay order" }, { status: 502 });
  const order = await orderResponse.json();
  if (order.status !== "paid" || order.amount !== Number(payment.amount) || order.currency !== "INR") {
    return Response.json({ error: "Razorpay amount, currency, or order status mismatch" }, { status: 400 });
  }
  if (order.receipt !== registrationId) return Response.json({ error: "Registration ID mismatch" }, { status: 400 });

  const accessToken = await googleAccessToken(env);
  const root = "https://firestore.googleapis.com/v1/projects/stratos-global-edu/databases/(default)/documents";
  const storedResponse = await fetch(`${root}/artifacts/stratos-global-edu/public/data/orders/${encodeURIComponent(registrationId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!storedResponse.ok) return Response.json({ error: "Registration not found" }, { status: 404 });
  const stored = await storedResponse.json();
  if (field(stored, "userId") && field(stored, "userId") !== firebaseUid) {
    return Response.json({ error: "Registration ownership mismatch" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const tier = field(stored, "tier");
  const expectedAmount = ({
    "Tier 1: Basic Virtual Internship (₹99)": 9900,
    "Tier 2: Instant PDF Certificate & QR ID (₹199)": 19900,
    "Tier 3: Stratos VIP Career Accelerator (₹299)": 29900
  })[tier];
  // Temporary testing mode: verification accepts ₹1 for every tier.
  const verifiedAmount = 100;
  if (!expectedAmount || Number(payment.amount) !== verifiedAmount) {
    return Response.json({ error: "Payment amount does not match the stored tier" }, { status: 400 });
  }
  const patchResponse = await patchFirestoreOrder(registrationId, {
    paymentProvider: "razorpay",
    paymentStatus: "Paid",
    paymentGatewayStatus: "captured",
    paymentVerified: true,
    registrationStatus: "Confirmed",
    gatewayOrderId: orderId,
    gatewayPaymentId: paymentId,
    paymentAmount: Number(payment.amount),
    paymentCurrency: "INR",
    paymentMethod: payment.method || "unknown",
    paymentVerifiedAt: now,
    paymentUpdatedAt: now
  }, env);
  if (!patchResponse.ok) return Response.json({ error: "Could not update registration" }, { status: 502 });

  return Response.json({
    success: true,
    payment_id: paymentId,
    order_id: orderId
  });
}
