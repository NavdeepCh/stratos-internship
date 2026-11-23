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
  if (!paymentId || !orderId || !signature) {
    return Response.json({ error: "Missing Razorpay payment fields" }, { status: 400 });
  }

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

  return Response.json({
    success: true,
    payment_id: paymentId,
    order_id: orderId
  });
}
