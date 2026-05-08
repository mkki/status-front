import { isWebView, MESSAGE_TYPES } from '@/shared/config/web-view';
import { useCallback, useEffect } from 'react';
import { type AchievementPhoto } from '../config/image-upload';

type UploadResult = { id: string; url: string } | { id: string; error: string };

const getAuthToken = async (): Promise<string | undefined> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || ''}/auth/token`,
      { credentials: 'include' }
    );
    if (!res.ok) return undefined;
    const json = (await res.json()) as { data?: { accessToken?: string } };
    return json.data?.accessToken ?? undefined;
  } catch {
    return undefined;
  }
};

export const useWebViewImageUpload = (
  setUploadedImages: React.Dispatch<React.SetStateAction<AchievementPhoto[]>>
) => {
  const handleWebViewMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === MESSAGE_TYPES.IMAGES_SELECTED) {
          setUploadedImages(data);
        }
      } catch (error) {
        console.error('web view message error', error);
      }
    },
    [setUploadedImages]
  );

  useEffect(() => {
    if (!isWebView) return;

    window.addEventListener('message', handleWebViewMessage);
    document.addEventListener('message', handleWebViewMessage as EventListener);
    return () => {
      window.removeEventListener('message', handleWebViewMessage);
      document.removeEventListener(
        'message',
        handleWebViewMessage as EventListener
      );
    };
  }, [handleWebViewMessage]);

  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: MESSAGE_TYPES.PICK_IMAGES })
      );
    } catch (error) {
      console.error('image upload error', error);
    }
  };

  const uploadWebViewImages = useCallback(
    (ids: string[], questId: string): Promise<string[]> => {
      return new Promise((resolve) => {
        const handleUploaded = (event: MessageEvent) => {
          try {
            const { type, data } = JSON.parse(event.data);
            if (
              type === MESSAGE_TYPES.IMAGES_UPLOADED &&
              data.questId === questId
            ) {
              window.removeEventListener('message', handleUploaded);
              document.removeEventListener(
                'message',
                handleUploaded as EventListener
              );
              const urls = (data.results as UploadResult[])
                .filter((r): r is { id: string; url: string } => 'url' in r)
                .map((r) => r.url);
              resolve(urls);
            }
          } catch {
            // ignore parse errors
          }
        };

        window.addEventListener('message', handleUploaded);
        document.addEventListener('message', handleUploaded as EventListener);

        getAuthToken().then((authToken) => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: MESSAGE_TYPES.UPLOAD_PHOTOS,
              data: { ids, questId, authToken },
            })
          );
        });
      });
    },
    []
  );

  return { handleLabelClick, uploadWebViewImages };
};
