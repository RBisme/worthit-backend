import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function identifyItem(title, imageBase64) {

  try {

    const prompt = `
Identify the real item from this marketplace title.

Return JSON only with:
itemName
category
keywords
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You identify resale items from marketplace titles."
        },
        {
          role: "user",
          content: `${prompt}\n\nTitle: ${title}`
        }
      ],
      temperature: 0
    });

    const text = response.choices[0].message.content;

    const parsed = JSON.parse(text);

    return {
      itemName: parsed.itemName || title,
      category: parsed.category || "general",
      keywords: parsed.keywords || []
    };

  } catch (err) {

    console.error("Identifier error:", err.message);

    return {
      itemName: title,
      category: "general",
      keywords: []
    };

  }

}