export async function validatePlaySubscription({
  productId,
  purchaseToken
}) {
  try {
    // Dynamically import so server does NOT crash on boot
    const { google } = await import("googleapis");

    const rawJson = process.env.PLAY_SERVICE_ACCOUNT_JSON;

    if (!rawJson) {
      throw new Error("Missing PLAY_SERVICE_ACCOUNT_JSON");
    }

    const key = JSON.parse(rawJson.replace(/\\n/g, '\n'));

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"]
    });

    const androidpublisher = google.androidpublisher({
      version: "v3",
      auth
    });

    const packageName = "com.ideaforged.worthit";

    const response =
      await androidpublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId: productId,
        token: purchaseToken
      });

    const purchaseData = response.data;

    if (!purchaseData || !purchaseData.expiryTimeMillis) {
      return { valid: false };
    }

    return {
      valid: true,
      expiry: new Date(Number(purchaseData.expiryTimeMillis))
    };

  } catch (err) {
    console.error("Play validation error:", err.message);
    return { valid: false };
  }
}