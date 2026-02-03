import { MESSAGE_TYPES } from '@/shared/config/web-view';
import { useCallback, useEffect, useState } from 'react';
import { type AchievementPhoto } from '../config/upload-image';

export const useUploadImage = () => {
  const [uploadedImages, setUploadedImages] = useState<AchievementPhoto[]>([]);
  const isWebView = window.ReactNativeWebView !== undefined;

  const handleWebViewMessage = useCallback((event: MessageEvent) => {
    try {
      const { type, data } = JSON.parse(event.data);

      if (type === MESSAGE_TYPES.IMAGES_SELECTED) {
        setUploadedImages(data);
      }
    } catch (error) {
      console.error('web view message error', error);
    }
  }, []);

  useEffect(() => {
    if (!isWebView) {
      return;
    }

    window.addEventListener('message', handleWebViewMessage);
    document.addEventListener('message', handleWebViewMessage as EventListener);
    return () => {
      window.removeEventListener('message', handleWebViewMessage);
      document.removeEventListener(
        'message',
        handleWebViewMessage as EventListener
      );
    };
  }, [isWebView, handleWebViewMessage]);

  const handleImageUpload = () => {
    if (isWebView) {
      try {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: MESSAGE_TYPES.PICK_IMAGES,
          })
        );
      } catch (error) {
        console.error('image upload error', error);
      }
    }
  };

  return { uploadedImages, setUploadedImages, handleImageUpload };
};
