async function verifyFirebaseToken(request, env) {
  const match = /^Bearer (.+)$/.exec(request.headers.get("Authorization") || "");
  if (!match) throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: match[1] })
  });
  if (!response.ok) throw new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const result = await response.json();
  const user = result.users?.[0];
  if (!user) throw new Response(JSON.stringify({ error: "User not found" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const claimsResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:getAccountInfo?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: match[1] })
  });
  if (!claimsResponse.ok) throw new Response(JSON.stringify({ error: "Could not verify administrator" }), { status: 403, headers: { "Content-Type": "application/json" } });
  return { uid: user.localId };
}

export async function onRequestPost(context) {
  return Response.json({
    error: "Administrator actions require server-issued Firebase custom claims and a registered action implementation",
    status: "blocked"
  }, { status: 501 });
}
