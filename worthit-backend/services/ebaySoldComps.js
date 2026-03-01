import axios from "axios";

export async function fetchSoldComps(query) {
  const token = process.env.EBAY_ACCESS_TOKEN;

  if (!token) {
    throw new Error("EBAY_ACCESS_TOKEN not set");
  }

  try {
    const response = await axios.get(
      "https://api.ebay.com/buy/browse/v1/item_summary/search",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
        },
        params: {
          q: query,
          limit: 10,
          filter: "soldItems:true",
          sort: "itemEndDate desc"
        }
      }
    );

    return response.data.itemSummaries || [];


  } catch (err) {
    console.error("========== EBAY API ERROR ==========");
    console.error("Status:", err.response?.status);
    console.error("Data:", JSON.stringify(err.response?.data, null, 2));
    console.error("===================================");

    throw err;
  }
}

export async function getSoldCompsPipeline(description) {
  return fetchSoldComps(description);
}
