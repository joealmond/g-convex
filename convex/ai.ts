import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { action } from "./_generated/server";

// Initialize Gemini
// Note: Ensure GOOGLE_API_KEY is set in Convex dashboard
const apiKey = process.env.GOOGLE_API_KEY;

export const analyzeImage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
        return { success: false, error: "Image not found" };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" } // Force JSON output
    });

    // Fetch the image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength > 10 * 1024 * 1024) {
        return { success: false, error: "Image too large" };
    }

    const imagePart = {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType: response.headers.get("content-type") || "image/jpeg",
      },
    };

    const prompt = `Analyze this food product image. 
    Return a JSON object with: 
    - productName (string): Approximate name of the product
    - reasoning (string): Brief analysis
    - safety (number): 0-100 score (100 is safest)
    - taste (number): 0-100 score (100 is best)
    - tags (array of strings): Ingredients or key descriptors
    `;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();
        const analysis = JSON.parse(text);

        return {
           success: true,
           analysis,
           imageUrl
        };
    } catch (e: any) {
        console.error("Gemini Error:", e);
        return { success: false, error: e.message || "AI Analysis failed" };
    }
  },
});
