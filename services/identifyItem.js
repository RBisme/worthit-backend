import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function identifyItem(title, imageBase64) {

  try {

    const messages = [
      {
        role: "system",
        content: "Identify the resale item shown in the image and return JSON with itemName, category, keywords."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Title from user: ${title}`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
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