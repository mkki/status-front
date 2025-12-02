import { http, HttpResponse, passthrough } from 'msw';
import {
  mockMainQuests,
  mockSubQuests,
  mockUsersMainQuests,
  mockCompletedHistory,
  mockSubQuestLogResponse,
  mockQuestStatistics,
  mockCompletedMainQuests,
  mockUsersSubQuests,
} from '@/app/mocks/data/quest';
import type {
  RewardResponseDto,
  SubQuestResponseDTO,
} from '@/shared/api/quest-template.dto';
import type {
  CreateQuestRequestDTO,
  CreateQuestResponseDTO,
} from '@/features/create-quest/api/create-quest.dto';
import type { RerollSubQuestRequestDTO } from '@/shared/api/quest-template.dto';
import { mockThemes } from '@/app/mocks/data/quest';
import { DISPLAY_SUB_QUEST_COUNT } from '@/entities/quest-template/config/quest-template';
import { getWeeksDifference } from '@/shared/lib/date';

export const API_URL = import.meta.env.VITE_API_URL;

export const questHandlers = [
  http.get(`${API_URL}/quest/get-themes`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const themes = mockThemes.sort(() => Math.random() - 0.5).slice(0, 6);

    return HttpResponse.json({
      data: themes,
    });
  }),
  http.get(`${API_URL}/quest/reroll-themes`, ({ request }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const params = new URL(request.url).searchParams;
    const themes = params.get('themes')?.split(',') ?? [];

    const filteredThemes = mockThemes
      .filter((theme) => !themes?.includes(theme.id.toString()))
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    return HttpResponse.json({
      data: filteredThemes,
    });
  }),
  http.get(`${API_URL}/quest/get-mainquests`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const quests = mockMainQuests.slice(0, 6);

    return HttpResponse.json({
      data: quests,
    });
  }),
  http.get(`${API_URL}/quest/reroll-mainquests`, ({ request }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const params = new URL(request.url).searchParams;
    const mainQuests = params.get('mainQuests')?.split(',') ?? [];

    const filteredQuests = mockMainQuests
      .filter((quest) => !mainQuests?.includes(quest.id.toString()))
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    return HttpResponse.json({
      data: filteredQuests,
    });
  }),
  http.get(`${API_URL}/quest/get-subquests`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const quests = mockSubQuests.slice(0, 4);

    return HttpResponse.json({
      data: quests,
    });
  }),
  http.post(`${API_URL}/quest/reroll-subquests`, async ({ request }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const { selectedSubQuests, gottenSubQuests } =
      (await request.json()) as RerollSubQuestRequestDTO;

    const limit = DISPLAY_SUB_QUEST_COUNT - selectedSubQuests.length;

    const filteredSubQuests = mockSubQuests
      .filter((subQuest) => !gottenSubQuests?.includes(subQuest.id))
      .filter((subQuest) => !selectedSubQuests?.includes(subQuest.id))
      .slice(0, limit);

    return HttpResponse.json({
      data: filteredSubQuests,
    });
  }),
  http.post(`${API_URL}/quest/create`, async ({ request }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const requestData = (await request.json()) as CreateQuestRequestDTO;

    const newQuestId = `${Date.now() * (Math.random() + 0.5)}`;

    const responseSubQuests: SubQuestResponseDTO[] = [];

    for (const subQuest of requestData.subQuests) {
      const filteredSubQuest = mockSubQuests.find(
        (mockSubQuest) => mockSubQuest.id === subQuest.id
      );

      if (!filteredSubQuest) {
        return HttpResponse.json(
          { error: `SubQuest with id ${subQuest.id} not found` },
          { status: 404 }
        );
      }

      responseSubQuests.push({
        ...filteredSubQuest,
        desc: filteredSubQuest.desc.replace(
          /{actionUnitNum}/g,
          subQuest.actionUnitNum.toString()
        ),
      });
    }

    const createdQuest: CreateQuestResponseDTO = {
      id: Number(newQuestId),
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      totalWeeks: getWeeksDifference(
        requestData.startDate,
        requestData.endDate
      ),
      title:
        mockMainQuests.find((quest) => quest.id === requestData.mainQuest)
          ?.name ?? '',
      attributes: [
        {
          id: 101,
          name: '제어',
          exp: 50,
        },
      ],
      subQuests: responseSubQuests,
      npcName: '아침을 지배하는 자',
    };

    mockUsersMainQuests.push({
      id: createdQuest.id,
      title: createdQuest.title,
      startDate: createdQuest.startDate,
      endDate: createdQuest.endDate,
      progress: 0,
      attributes: createdQuest.attributes,
      totalWeeks: createdQuest.totalWeeks,
    });

    return HttpResponse.json({
      data: createdQuest,
    });
  }),

  http.get(`${API_URL}/quest/me`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    return HttpResponse.json({
      data: mockUsersMainQuests,
    });
  }),
  http.get(`${API_URL}/quest/today`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }
    const quests = mockUsersSubQuests;

    return HttpResponse.json({
      data: quests,
    });
  }),
  http.get(`${API_URL}/quest/user-statistics`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    return HttpResponse.json({
      data: mockQuestStatistics,
    });
  }),
  http.get(`${API_URL}/quest/history`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    return HttpResponse.json({
      data: mockCompletedMainQuests,
    });
  }),

  http.get(`${API_URL}/quest/:mainQuestId`, ({ params }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const { mainQuestId } = params;
    const quest = mockUsersMainQuests.find(
      (quest) => quest.id.toString() === mainQuestId
    );

    return HttpResponse.json({
      data: quest,
    });
  }),
  http.get(`${API_URL}/quest/:mainQuestId/today`, ({ params }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    const { mainQuestId } = params;
    const quests = mockUsersSubQuests.filter(
      (quest) => quest.mainQuestId === Number(mainQuestId)
    );

    return HttpResponse.json({
      data: quests,
    });
  }),
  http.post(`${API_URL}/quest/sub`, async () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    return HttpResponse.json({
      data: mockSubQuestLogResponse,
    });
  }),

  http.patch(`${API_URL}/quest/sub`, async ({ request }) => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }
    const requestData = (await request.json()) as RewardResponseDto;

    return HttpResponse.json({
      data: requestData,
    });
  }),
  http.get(`${API_URL}/quest/:mainQuestId/history`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }
    return HttpResponse.json({
      data: mockCompletedHistory,
    });
  }),
  http.delete(`${API_URL}/quest/:mainQuestId`, () => {
    if (import.meta.env.MODE !== 'development') {
      return passthrough();
    }

    return HttpResponse.json({
      data: {},
    });
  }),
];
