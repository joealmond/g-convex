"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeImage = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    // Get URL first - always works
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    
    // If no API key, return immediately with image but no analysis
    if (!apiKey) {
      console.log("No GOOGLE_GENERATIVE_AI_API_KEY, skipping AI analysis");
      return {
        success: true,
        analysis: {
            productName: "",
            isLikelyGlutenFree: false,
            riskLevel: "Sketchy" as const,
            tags: [],
            reasoning: "AI analysis unavailable (no API key).",
        },
        imageUrl
      };
    }

    // 1. Fetch image from storage
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      // Still return success with image URL
      return {
        success: true,
        analysis: {
            productName: "",
            isLikelyGlutenFree: false,
            riskLevel: "Sketchy" as const,
            tags: [],
            reasoning: "Image not found in storage.",
        },
        imageUrl
      };
    }

    // 2. Convert to compatible format
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = blob.type || "image/jpeg";

    try {
      // 3. Call Gemini - using correct model name
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

      const prompt = `Analyze this product image for a celiac/gluten-free community app. 
      Return a JSON object with these exact fields:
      - productName: string (the brand and product name visible on packaging, or "Unnamed Product" if unknown)
      - isLikelyGlutenFree: boolean (true if packaging says Gluten Free or product is naturally GF)
      - riskLevel: "Safe" | "Sketchy" | "Unsafe" (based on ingredients or GF certification)
      - tags: string[] (e.g., ["Bread", "Snack", "Certified GF"])
      - reasoning: string (short explanation of classification)
      
      Return ONLY valid JSON, no markdown code blocks.`;

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
      const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const analysis = JSON.parse(cleanText);

      return {
        success: true,
        analysis: {
            productName: analysis.productName || "Unnamed Product",
            isLikelyGlutenFree: !!analysis.isLikelyGlutenFree,
            riskLevel: analysis.riskLevel || "Sketchy",
            tags: Array.isArray(analysis.tags) ? analysis.tags : [],
            reasoning: analysis.reasoning || "",
        },
        imageUrl
      };
    } catch (error: any) {
      console.error("Gemini Analysis Failed:", error?.message || error);
      // AI failed but still return success with image - DON'T BLOCK THE USER
      return {
        success: true,
        analysis: {
            productName: "",
            isLikelyGlutenFree: false,
            riskLevel: "Sketchy" as const,
            tags: [],
            reasoning: "AI unavailable. Enter details manually.",
        },
        imageUrl
      };
    }
  },
});
