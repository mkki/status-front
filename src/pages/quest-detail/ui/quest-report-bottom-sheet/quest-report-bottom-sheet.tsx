import { useEffect } from 'react';
import { BottomSheet } from '@/shared/ui/bottom-sheet/bottom-sheet';
import { Button } from '@/shared/ui/button/button';
import { Textarea } from '@/shared/ui/textarea/textarea';
import type { SubQuestDifficulty } from '@/shared/config/quest-template';
import { SUB_QUEST_DIFFICULTY } from '@/shared/config/quest-template';
import type { UsersSubQuest } from '@/entities/user-quest/model/user-quest';
import {
  type AchievementPhoto,
  MAX_USER_SUB_QUEST_IMAGE_COUNT,
} from '@/features/image-upload/config/image-upload';

import IconAddPhoto from '@/assets/icons/icon-add-photo-alternate.svg?react';

import styles from './quest-report-bottom-sheet.module.scss';
import classNames from 'classnames/bind';
import { useUploadImage } from '@/features/image-upload/model/use-image-upload';

const cx = classNames.bind(styles);

interface QuestReportBottomSheetProps {
  isBottomSheetOpen: boolean;
  onClose: () => void;
  selectedSubQuest: UsersSubQuest | null;
  selectedDifficulty: SubQuestDifficulty | null;
  achievementPhotos?: AchievementPhoto[];
  memo?: string;
  onChangeDifficulty: (difficulty: SubQuestDifficulty) => void;
  onChangeMemo: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onReportQuest: (imageUrls: string[]) => void;
}
export const QuestReportBottomSheet = ({
  isBottomSheetOpen,
  selectedSubQuest,
  selectedDifficulty,
  achievementPhotos = [],
  memo,
  onClose,
  onChangeDifficulty,
  onChangeMemo,
  onReportQuest,
}: QuestReportBottomSheetProps) => {
  const {
    uploadedImages,
    setUploadedImages,
    handleLabelClick,
    handleFileChange,
    uploadImages,
  } = useUploadImage();
  const photos = [...achievementPhotos, ...uploadedImages];

  useEffect(() => {
    if (!isBottomSheetOpen) {
      setUploadedImages([]);
    }
  }, [isBottomSheetOpen, setUploadedImages]);

  useEffect(() => {
    setUploadedImages([]);
  }, [selectedSubQuest?.subQuestInfo.id, setUploadedImages]);
  const disabled = !selectedSubQuest || !selectedDifficulty;

  return (
    <BottomSheet
      isOpen={isBottomSheetOpen}
      onClose={onClose}
      className={cx('quest-report-bottom-sheet')}
    >
      <BottomSheet.Header>
        <BottomSheet.Title>퀘스트 인증하기</BottomSheet.Title>
        <BottomSheet.Description>
          [{selectedSubQuest?.subQuestInfo.desc}]의 인증
        </BottomSheet.Description>
      </BottomSheet.Header>
      <BottomSheet.Content>
        <BottomSheet.SubTitle>
          수행 난이도{' '}
          <em className={cx('highlight')}>
            {selectedSubQuest?.essential ? '(필수)' : ''}
          </em>
        </BottomSheet.SubTitle>
        <div role="radiogroup" className={cx('quest-report-radio-group')}>
          {Object.values(SUB_QUEST_DIFFICULTY).map((difficulty) => (
            <button
              key={difficulty.value}
              type="button"
              role="radio"
              aria-checked={selectedDifficulty === difficulty.value}
              className={cx(
                'quest-report-radio',
                difficulty.value.toLowerCase()
              )}
              onClick={() => onChangeDifficulty(difficulty.value)}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
        <BottomSheet.SubTitle>
          이미지 추가(최대 {MAX_USER_SUB_QUEST_IMAGE_COUNT}장)
        </BottomSheet.SubTitle>
        <div className={cx('quest-report-photos')}>
          {photos.length > 0 && (
            <ul className={cx('photo-list')}>
              {photos?.map((photo) => (
                <li key={photo.id} className={cx('photo-item')}>
                  <img
                    className={cx('photo-image')}
                    src={photo.thumbnailDataURI}
                    alt="이미지"
                  />
                </li>
              ))}
            </ul>
          )}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
          <label className={cx('button-add-photo')} onClick={handleLabelClick}>
            <input
              type="file"
              accept="image/*"
              multiple
              className={cx('sr-only')}
              onChange={handleFileChange}
            />
            <IconAddPhoto className={cx('icon-add-photo')} aria-hidden="true" />
          </label>
        </div>
        <Textarea
          label="메모 최대(300자)"
          value={memo}
          onChange={onChangeMemo}
          placeholder="입력하세요."
          maxLength={300}
          className={cx('quest-report-textarea')}
        />
      </BottomSheet.Content>
      <BottomSheet.Footer>
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={async () => {
            const imageUrls = await uploadImages(
              String(selectedSubQuest?.subQuestInfo.id ?? '')
            );
            onReportQuest(imageUrls);
          }}
        >
          이상, 퀘스트 완료.
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
};
