import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { ImageAnalysisState } from '@/lib/actions-types';

import { env } from '@/lib/env';

const convex = new ConvexHttpClient(env.VITE_CONVEX_URL);


export async function analyzeAndUploadProduct(_prevState: ImageAnalysisState, formData: FormData): Promise<ImageAnalysisState> {
  try {
    const file = formData.get('image') as File;
    if (!file) {
        return { status: 'error', success: false, error: "No file provided", result: {} };
    }

    // 1. Get Upload URL
    const postUrl = await convex.mutation(api.products.generateUploadUrl);

    // 2. Upload File
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    
    if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
    }

    const { storageId } = await result.json();

    // 3. Analyze Image
    const analysisResult = await convex.action(api.ai.analyzeImage, { storageId });

    if (!analysisResult.success) {
        return { 
            status: 'error', 
            success: false, 
            error: 'error' in analysisResult ? (analysisResult as any).error : "Analysis failed", 
            result: {} 
        };
    }

    return {
        success: true,
        status: 'complete',
        result: analysisResult.analysis,
        productName: analysisResult.analysis.productName || undefined,
        imageUrl: analysisResult.imageUrl || undefined,
        storageId: storageId 
    };

  } catch (error: any) {
    console.error("Analysis Failed:", error);
    return { 
        status: 'error', 
        success: false, 
        error: error.message || "Failed to process image", 
        result: {} 
    };
  }
}

export function submitVote(data: any) {
  console.log("submitVote called (legacy action stub)", data);
  return { success: true };
}

export async function recalculateProductAveragesWithTimeDecay(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await convex.mutation(api.products.recalculateWithTimeDecay, { 
            productId: productId as any 
        });
        return { success: result.success };
    } catch (error: any) {
        console.error("Recalculate failed:", error);
        return { success: false, error: error.message };
    }
}
