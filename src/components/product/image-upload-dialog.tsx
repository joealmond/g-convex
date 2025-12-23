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
    
    // Clear any stale data first
    sessionStorage.removeItem('identifiedProduct');
    
    // Store new analysis in session storage
    sessionStorage.setItem('identifiedProduct', JSON.stringify(analysisResult));

    // Navigate to a unique new product path using timestamp to avoid conflicts
    // This ensures we always go to product creation, not viewing an existing product
    const uniqueId = Date.now().toString(36);
    const url = `/product/new-${uniqueId}`;
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
