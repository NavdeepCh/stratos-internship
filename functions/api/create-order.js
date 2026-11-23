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

  const amount = Number(body.amount);
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return Response.json({ error: "Amount must be at least 100 paise" }, { status: 400 });
  }

  const allowedAmounts = [9900, 19900, 29900];
  if (!allowedAmounts.includes(amount)) {
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
