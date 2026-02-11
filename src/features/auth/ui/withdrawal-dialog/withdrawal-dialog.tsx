import { useShallow } from 'zustand/shallow';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { usePostWithdrawalMutation } from '@/features/auth/api/use-post-withdrawal';
import { Dialog } from '@/shared/ui/dialog/dialog';
import { Button } from '@/shared/ui/button/button';
import { PROVIDER_TYPE } from '@/features/auth/config/constants';

interface WithdrawalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalDialog = ({
  isOpen,
  onClose,
}: WithdrawalDialogProps) => {
  const postWithdrawal = usePostWithdrawalMutation();
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const handleConfirm = async () => {
    postWithdrawal.mutate();
  };

  const isGuestUser = user?.providerType === PROVIDER_TYPE.GUEST;

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog>
      {isGuestUser ? (
        <>
          <Dialog.Title>게스트 모드를 종료할까요?</Dialog.Title>
          <Dialog.Description>
            저장된 모든 데이터가 삭제되며
            <br />
            삭제된 데이터는 복구할 수 없습니다.
          </Dialog.Description>
        </>
      ) : (
        <>
          <Dialog.Title>회원을 탈퇴할까요?</Dialog.Title>
          <Dialog.Description>
            계정의 모든 기록이 삭제되며
            <br />
            동일 계정으로 회원가입을 해도 복구되지 않습니다.
          </Dialog.Description>
        </>
      )}
      <Dialog.Actions>
        <Button variant="primary" onClick={onClose}>
          취소
        </Button>
        <Button variant="secondary" onClick={handleConfirm}>
          확인
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
