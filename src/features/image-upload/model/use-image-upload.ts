import { isWebView } from '@/shared/config/web-view';
import { useState } from 'react';
import { type AchievementPhoto } from '../config/image-upload';
import { useBrowserImageUpload } from './use-browser-image-upload';
import { useWebViewImageUpload } from './use-webview-image-upload';

export const useUploadImage = () => {
  const [uploadedImages, setUploadedImages] = useState<AchievementPhoto[]>([]);

  const { handleLabelClick, uploadWebViewImages } =
    useWebViewImageUpload(setUploadedImages);
  const { handleFileChange, uploadBrowserImages } =
    useBrowserImageUpload(setUploadedImages);

  const uploadImages = async (questId: string): Promise<string[]> => {
    if (uploadedImages.length === 0) return [];
    if (isWebView) {
      return uploadWebViewImages(
        uploadedImages.map((p) => p.id),
        questId
      );
    }
    return uploadBrowserImages();
  };

  return {
    uploadedImages,
    setUploadedImages,
    handleLabelClick: isWebView ? handleLabelClick : undefined,
    handleFileChange,
    uploadImages,
  };
};
