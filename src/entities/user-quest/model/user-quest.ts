import type {
  UsersMainQuestResponseDTO,
  WithStatusUsersMainQuestResponseDTO,
  QuestHistoryByDateDTO,
  SubQuestLogDTO,
  SubQuestLogsResponseDTO,
  UsersSubQuestResponseDTO,
  AttributesReturnDTO,
} from '@/shared/api/user-quest.dto';

export type UsersMainQuest = UsersMainQuestResponseDTO;

export type UserCompletedMainQuests = WithStatusUsersMainQuestResponseDTO;

export type UsersSubQuest = UsersSubQuestResponseDTO;

export type SubQuestLog = SubQuestLogDTO;

export type CompletedQuest = Omit<SubQuestLogsResponseDTO, 'log'> & {
  log: UserSubQuestLog;
};

export type UserSubQuestLog = SubQuestLogDTO & {
  achievementImages?: string[];
};

export type UsersCompletedHistory = QuestHistoryByDateDTO;

export type UserAttribute = AttributesReturnDTO;
