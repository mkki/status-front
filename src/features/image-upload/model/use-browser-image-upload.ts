import { useState } from 'react';
import {
  type AchievementPhoto,
  MAX_USER_SUB_QUEST_IMAGE_COUNT,
} from '../config/image-upload';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.7;

const resizeFile = (
  file: File
): Promise<{ dataURI: string; blob: Blob; width: number; height: number }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { naturalWidth: w, naturalHeight: h } = img;
        if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
          if (w > h) {
            h = Math.round((h * MAX_DIMENSION) / w);
            w = MAX_DIMENSION;
          } else {
            w = Math.round((w * MAX_DIMENSION) / h);
            h = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const dataURI = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        canvas.toBlob(
          (blob) => resolve({ dataURI, blob: blob!, width: w, height: h }),
          'image/jpeg',
          JPEG_QUALITY
        );
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const useBrowserImageUpload = (
  setUploadedImages: React.Dispatch<React.SetStateAction<AchievementPhoto[]>>
) => {
  const [pendingBlobs, setPendingBlobs] = useState<Blob[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(
      0,
      MAX_USER_SUB_QUEST_IMAGE_COUNT
    );

    if (files.length === 0) return;

    const results = await Promise.all(files.map(resizeFile));

    setPendingBlobs(results.map((r) => r.blob));
    setUploadedImages(
      results.map((r) => ({
        id: crypto.randomUUID(),
        thumbnailDataURI: r.dataURI,
        width: r.width,
        height: r.height,
      }))
    );
  };

  const uploadBrowserImages = async (): Promise<string[]> => {
    if (pendingBlobs.length === 0) return [];

    const formData = new FormData();
    pendingBlobs.forEach((blob, i) =>
      formData.append('files', blob, `image_${i}.jpg`)
    );

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || ''}/upload/images`,
      { method: 'POST', body: formData, credentials: 'include' }
    );

    if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.');

    const json = (await response.json()) as { data?: { urls?: string[] } };
    return json.data?.urls ?? [];
  };

  return { handleFileChange, uploadBrowserImages };
};
