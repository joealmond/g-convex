"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";



export const analyzeImage = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    // 1. Fetch image from storage
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error("Image not found in storage");
    }

    // 2. Convert to compatible format
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = blob.type || "image/jpeg";

    // 3. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or 1.5-flash

    const prompt = `Analyze this product image for a celiac/gluten-free community app. 
    Return a JSON object with these exact fields:
    - productName: string (the brand and product name visible on packaging, or "Unnamed Product" if unknown)
    - isLikelyGlutenFree: boolean (true if packaging says Gluten Free or product is naturally GF)
    - riskLevel: "Safe" | "Sketchy" | "Unsafe" (based on ingredients or GF certification)
    - tags: string[] (e.g., ["Bread", "Snack", "Certified GF"])
    - reasoning: string (short explanation of classification)
    
    Return ONLY valid JSON, no markdown code blocks.`;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
      ]);

      const responseText = result.response.text();
      // Clean up markdown block if present
      const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const analysis = JSON.parse(cleanText);

      return {
        success: true,
        analysis: {
            productName: analysis.productName || "Unnamed Product",
            isLikelyGlutenFree: !!analysis.isLikelyGlutenFree,
            riskLevel: analysis.riskLevel || "Sketchy",
            tags: Array.isArray(analysis.tags) ? analysis.tags : [],
            reasoning: analysis.reasoning || "Analysis failed to provide reasoning.",
        }
      };
    } catch (error: any) {
      console.error("Gemini Analysis Failed:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze image",
      };
    }
  },
});
