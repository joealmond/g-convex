'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageUploadForm } from './image-upload-form';
import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ImageAnalysisState } from '@/lib/actions-types';
import { useTranslations } from '@/lib/i18n';

type ImageUploadDialogProps = {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};


export function ImageUploadDialog({ children, open, onOpenChange }: ImageUploadDialogProps) {
  const navigate = useNavigate();
  const t = useTranslations('ImageUploadDialog');

  const handleProductIdentified = (analysisResult: ImageAnalysisState) => {
    // Close the dialog
    onOpenChange?.(false);
    
    // Store in session storage as a fallback
    sessionStorage.setItem('identifiedProduct', JSON.stringify(analysisResult));

    // Navigate to the product page with the product name
    const url = `/product/${encodeURIComponent(analysisResult.productName || 'Unnamed Product')}`;
    navigate({ to: url });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <ImageUploadForm onProductIdentified={handleProductIdentified} />
      </DialogContent>
    </Dialog>
  );
}
