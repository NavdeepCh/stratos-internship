async function main() {
  const [,, dryRunArg = "--dry-run"] = process.argv;
  if (dryRunArg !== "--dry-run") {
    throw new Error("Safety guard: reconciliation starts in dry-run mode. Pass --dry-run only.");
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is required");

  console.log("Dry-run reconciliation started.");
  console.log("This script reports stuck registrations and never writes Paid status.");
  console.log("Provide the stored order list or integrate this script with the existing registration export.");
  console.log("No production records were changed.");
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
