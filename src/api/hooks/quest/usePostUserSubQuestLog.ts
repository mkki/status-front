import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postUserSubQuestLog } from '@/api/quest';
import type { UserSubQuestLogRequestDTO } from '@/api/types/quest';

export const usePostUserSubQuestLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserSubQuestLogRequestDTO) => postUserSubQuestLog(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sub-quests', 'user', variables.userId],
      });
    },
  });
};
