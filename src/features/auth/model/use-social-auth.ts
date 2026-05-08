import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AUTH_CONFIGS,
  PROVIDER_TYPE,
  URL_SCHEME,
} from '@/features/auth/config/constants';
import { isWebView, MESSAGE_TYPES } from '@/shared/config/web-view';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAuthStore,
  useSocialConnectionStore,
} from '@/features/auth/model/auth-store';
import { useShallow } from 'zustand/react/shallow';
import { PAGE_PATHS } from '@/shared/config/paths';
import { USER_TYPE } from '@/shared/config/user';
import { usePostSocialLogin } from '@/features/auth/api/use-post-social-login';
import { useGetCurrentUser } from '@/features/auth/api/use-get-current-user';
import { useAuthenticateUser } from '@/features/auth/api/use-authenticate-user';

import type { SocialProvider } from '@/features/auth/model/types';
import type { OAuthProvider } from '@/features/auth/model/types';
import type { OAuthLoginRequestDTO } from '@/features/auth/api/auth.dto';
import type { BasicUsers } from '@/entities/user/model/user';

const createOAuthURL = (provider: SocialProvider, state: string): string => {
  const config = AUTH_CONFIGS[provider];

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType,
    state: encodeURIComponent(state),
    ...(config.scope && { scope: config.scope }),
  });

  return `${config.endpoint}?${params.toString()}`;
};

export const useSocialAuth = () => {
  const queryClient = useQueryClient();
  const { mutate: socialLogin, isPending: isSocialLoginLoading } =
    usePostSocialLogin();
  const { data: isAuthenticated } = useAuthenticateUser();
  const { data: currentUser, refetch: refetchCurrentUser } = useGetCurrentUser({
    isAuthenticated: !!isAuthenticated,
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const { setUser, setPendingSocialUser } = useAuthStore(
    useShallow((state) => ({
      setUser: state.setUser,
      setPendingSocialUser: state.setPendingSocialUser,
    }))
  );
  const { tempSocialConnection, setTempSocialConnection } =
    useSocialConnectionStore(
      useShallow((state) => ({
        tempSocialConnection: state.tempSocialConnection,
        setTempSocialConnection: state.setTempSocialConnection,
      }))
    );

  const signInWithOAuth = useCallback(
    async (provider: SocialProvider, socialConnection: boolean = false) => {
      const state = JSON.stringify({
        fromWebView: isWebView,
        provider,
        timestamp: Date.now(),
        redirect: redirect,
        connection: socialConnection,
      });

      // [TODO] 앱 재배포 후 제거
      setTempSocialConnection(socialConnection);

      const url = createOAuthURL(provider, state);

      if (isWebView && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: MESSAGE_TYPES.OPEN_EXTERNAL_BROWSER,
            url,
          })
        );
      } else {
        window.location.href = url;
      }
    },
    [redirect, setTempSocialConnection]
  );

  const handleOAuthCallback = useCallback(
    async (
      code: string,
      provider: SocialProvider,
      redirect: string | null,
      connection: boolean = false
    ) => {
      const payload: OAuthLoginRequestDTO = {
        provider,
        code,
      };

      if (connection || tempSocialConnection) {
        await refetchCurrentUser();

        if (currentUser?.providerType !== PROVIDER_TYPE.GUEST) {
          return;
        }

        navigate(PAGE_PATHS.SIGN_UP, {
          state: {
            payload,
            nickname: currentUser?.nickname,
          },
        });

        return;
      }

      socialLogin(payload, {
        onSuccess: async (response) => {
          if (!response?.data) {
            return;
          }

          if (response.data.type === USER_TYPE.SIGN_UP) {
            setPendingSocialUser(response.data as OAuthProvider);
            navigate(PAGE_PATHS.SIGN_UP);
          } else {
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            setUser(response.data as BasicUsers);

            if (redirect) {
              navigate(decodeURIComponent(redirect));
            } else {
              navigate(PAGE_PATHS.ROOT);
            }
          }
        },
      });
    },
    [
      setPendingSocialUser,
      setUser,
      navigate,
      currentUser,
      queryClient,
      socialLogin,
      refetchCurrentUser,
      tempSocialConnection,
    ]
  );

  const handleWebViewMessage = useCallback(
    (event: MessageEvent) => {
      const { type, data } = JSON.parse(event.data);

      if (type === MESSAGE_TYPES.AUTH_SUCCESS) {
        handleOAuthCallback(
          data.code,
          data.provider,
          data.redirect,
          data.connection
        );
      } else if (type === MESSAGE_TYPES.AUTH_ERROR) {
        // [TODO] 인증 실패 처리?
      }
    },
    [handleOAuthCallback]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const stateParam = params.get('state');
    const parsedState = JSON.parse(decodeURIComponent(stateParam || '{}'));

    if (error) {
      if (parsedState?.fromWebView) {
        window.location.href = `${URL_SCHEME}?error=${encodeURIComponent(error)}`;
      }
      return;
    }

    if (code) {
      if (parsedState?.fromWebView) {
        window.location.href = `${URL_SCHEME}?code=${encodeURIComponent(code)}&provider=${parsedState.provider}&redirect=${parsedState.redirect || ''}&connection=${parsedState.connection || ''}`;
      } else {
        handleOAuthCallback(
          code,
          parsedState.provider,
          parsedState.redirect,
          parsedState.connection
        );
      }
    }
  }, [handleOAuthCallback]);

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
  }, [handleWebViewMessage, handleOAuthCallback]);

  return { signInWithOAuth, isSocialLoginLoading };
};
