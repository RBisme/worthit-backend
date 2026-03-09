export async function identifyItem(title, imageBase64) {
  return {
    itemName: title,
    category: "general",
    keywords: []
  };
}