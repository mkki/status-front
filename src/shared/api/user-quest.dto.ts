import type { Status } from '../config/quest-template';
import type { SubQuestDifficulty } from '../config/quest-template';
import type { AttributeDTO, SubQuestResponseDTO } from './quest-template.dto';
import type { AttributeType } from '../config/attribute';

export interface UsersMainQuestResponseDTO {
  id: number;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  title: string;
  attributes: AttributeDTO[];
  progress: number;
}

export interface WithStatusUsersMainQuestResponseDTO
  extends UsersMainQuestResponseDTO {
  status: Status;
}

export interface SubQuestLogDTO {
  id: number;
  difficulty: SubQuestDifficulty;
  memo: string;
  imageUrls?: string[];
}

export interface QuestHistoryByDateDTO {
  date: string;
  logs: SubQuestLogsResponseDTO[];
}

export interface UsersSubQuestResponseDTO {
  subQuestInfo: SubQuestResponseDTO;
  repeatCnt: number;
  essential: boolean;
  mainQuestId: number;
}

export interface SubQuestLogsResponseDTO {
  userSubQuest: UsersSubQuestResponseDTO;
  log: SubQuestLogDTO;
}

export interface AttributesReturnDTO {
  attributeId: number;
  name: string;
  type: AttributeType;
  description?: string;
  level: number;
  exp: number;
  expToNextLevel: number;
}
