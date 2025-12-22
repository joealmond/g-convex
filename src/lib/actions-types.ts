// Placeholder types for migration
export interface ImageAnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  imageUrl?: string;
  result?: any;
  error?: string;
  success?: boolean;
  productName?: string;
}

export const initialState: ImageAnalysisState = {
  status: 'idle'
};
