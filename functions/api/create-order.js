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

  const tierAmounts = {
    "Tier 1: Basic Virtual Internship (₹99)": 9900,
    "Tier 2: Instant PDF Certificate & QR ID (₹199)": 19900,
    "Tier 3: Stratos VIP Career Accelerator (₹299)": 29900
  };
  const tier = typeof body.tier === "string" ? body.tier : "";
  const testMode = env.RAZORPAY_KEY_ID.startsWith("rzp_test_");
  const amount = testMode ? 100 : tierAmounts[tier];
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return Response.json({ error: "Invalid internship tier amount" }, { status: 400 });
  }

  const receipt = typeof body.receipt === "string" ? body.receipt.slice(0, 40) : "";
  if (!receipt) {
    return Response.json({ error: "Receipt is required" }, { status: 400 });
  }

  const authorization = "Basic " + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  let razorpayResponse;
  try {
    razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": authorization,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt
      })
    });
  } catch {
    return Response.json({ error: "Razorpay service unavailable" }, { status: 500 });
  }

  const result = await razorpayResponse.json().catch(() => ({}));
  if (!razorpayResponse.ok) {
    return Response.json({
      error: "Razorpay rejected the order",
      details: result.error?.description || undefined
    }, { status: 502 });
  }

  return Response.json({
    order_id: result.id,
    amount: result.amount,
    currency: result.currency,
    key_id: env.RAZORPAY_KEY_ID
  });
}
