import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAuthStore,
  useSocialConnectionStore,
} from '@/features/auth/model/auth-store';
import { usePostSignUp } from '@/features/auth/api/use-post-sign-up';
import { TextInput } from '@/shared/ui/text-input/text-input';
import { Button } from '@/shared/ui/button/button';
import { Checkbox } from '@/shared/ui/checkbox/checkbox';
import { nicknameSchema } from '@/entities/user/model/user-schema';
import { SIGN_UP_STEP } from '@/features/auth/config/constants';
import { SIGN_UP_STEP_INFO } from '@/features/auth/config/constants';
import { PAGE_PATHS } from '@/shared/config/paths';
import { renderWithLineBreaks } from '@/shared/lib/format';
import { TERM_URL } from '@/shared/config/terms';
import { isWebView, MESSAGE_TYPES } from '@/shared/config/web-view';

import type { SignUpForm, SignUpStep } from '@/features/auth/model/types';
import type { BasicUsers } from '@/entities/user/model/user';

import IconLogo from '@/assets/icons/icon-logo-default.svg?react';
import IconChevronRight from '@/assets/icons/icon-chevron-right.svg?react';

import classNames from 'classnames/bind';
import styles from './sign-up-page.module.scss';
import { usePatchSocialConnection } from '@/features/auth/api/use-patch-social-connection';
import { NICKNAME_MAX_LENGTH } from '@/shared/config/user';

const cx = classNames.bind(styles);

const SignUpPage = () => {
  const navigate = useNavigate();
  const { state: socialConnectionState } = useLocation();
  const { mutate: socialConnection } = usePatchSocialConnection();
  const { mutate: postSignUp } = usePostSignUp();
  const { pendingSocialUser, setPendingSocialUser, setUser } = useAuthStore(
    useShallow((state) => ({
      pendingSocialUser: state.pendingSocialUser,
      setPendingSocialUser: state.setPendingSocialUser,
      setUser: state.setUser,
    }))
  );

  const { setTempSocialConnection } = useSocialConnectionStore(
    useShallow((state) => ({
      setTempSocialConnection: state.setTempSocialConnection,
    }))
  );

  const socialConnectionPayload = socialConnectionState?.payload;
  const socialConnectionUserNickname = socialConnectionState?.nickname;

  const [step, setStep] = useState<SignUpStep>(
    socialConnectionState
      ? SIGN_UP_STEP.TERMS_AND_PRIVACY_POLICY
      : SIGN_UP_STEP.NICKNAME
  );
  const [nickname, setNickname] = useState(socialConnectionUserNickname ?? '');
  const [nicknameError, setNicknameError] = useState<string | undefined>(
    undefined
  );

  const [ageAgreed, setAgeAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState(false);

  const isNicknameValid = nickname.length > 0 && nicknameError === undefined;
  const isTermsAndPrivacyPolicyValid =
    ageAgreed && termsAgreed && privacyPolicyAgreed;

  const { title, description } = SIGN_UP_STEP_INFO[step];

  const handleChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nickname = e.target.value;

    if (nickname.length > NICKNAME_MAX_LENGTH) {
      return;
    }

    const result = nicknameSchema.safeParse({ nickname });
    setNickname(nickname);

    if (result.success) {
      setNicknameError(undefined);
    } else {
      setNicknameError(result.error.issues[0].message);
    }
  };

  const handleChangeAgeAgreed = () => {
    setAgeAgreed((ageAgreed) => !ageAgreed);
  };

  const handleChangeTermsAgreed = () => {
    setTermsAgreed((termsAgreed) => !termsAgreed);
  };

  const handleChangePrivacyPolicyAgreed = () => {
    setPrivacyPolicyAgreed((privacyPolicyAgreed) => !privacyPolicyAgreed);
  };

  const handleChangeTermsAndPrivacyPolicyAgreed = () => {
    if (isTermsAndPrivacyPolicyValid) {
      setAgeAgreed(false);
      setTermsAgreed(false);
      setPrivacyPolicyAgreed(false);

      return;
    }

    setAgeAgreed(true);
    setTermsAgreed(true);
    setPrivacyPolicyAgreed(true);
  };

  const handleClickTermsLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const { href } = event.currentTarget;

    if (isWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: MESSAGE_TYPES.OPEN_EXTERNAL_BROWSER,
          url: href,
        })
      );
    } else {
      window.open(href, '_blank');
    }
  };

  const handleClickNicknameConfirmButton = () => {
    setStep(SIGN_UP_STEP.TERMS_AND_PRIVACY_POLICY);
  };

  const handleClickTermsAndPrivacyPolicyConfirmButton = async () => {
    if (!isTermsAndPrivacyPolicyValid) {
      return;
    }

    if (!pendingSocialUser && !socialConnectionState) {
      return;
    }

    if (socialConnectionState) {
      socialConnection(socialConnectionPayload, {
        onSuccess: (data) => {
          setUser(data.data as BasicUsers);
          setPendingSocialUser(null);
          setTempSocialConnection(false);
        },
        onSettled: () => {
          navigate(PAGE_PATHS.ROOT);
        },
      });
    } else {
      const payload: SignUpForm = {
        nickname,
        provider: pendingSocialUser || socialConnectionState,
      };

      postSignUp(payload, {
        onSuccess: (data) => {
          setUser(data as BasicUsers);
          setPendingSocialUser(null);
        },
        onSettled: () => {
          navigate(PAGE_PATHS.TUTORIAL);
        },
      });
    }
  };

  return (
    <>
      <main className="main">
        <div className={cx('sign-up-container')}>
          <h2 className="sr-only">회원가입</h2>
          <h3 className="sr-only">닉네임 설정</h3>

          <div className={cx('sign-up-title')}>
            <IconLogo className={cx('icon-logo')} aria-hidden={true} />
            <strong className={cx('text')}>
              {renderWithLineBreaks(title)}
            </strong>
          </div>
          {!socialConnectionState && (
            <p className={cx('sign-up-description')}>{description}</p>
          )}
          {step === SIGN_UP_STEP.NICKNAME ? (
            <TextInput
              className={cx('nickname-input')}
              label="닉네임 (최대 10자)"
              placeholder="한글, 영문, 숫자 조합으로 입력해주세요."
              value={nickname}
              maxLength={NICKNAME_MAX_LENGTH}
              onChange={handleChangeNickname}
              errorMessage={nicknameError}
            />
          ) : (
            <div className={cx('terms')}>
              <div className={cx('terms-check-all-wrapper')}>
                <Checkbox
                  checked={isTermsAndPrivacyPolicyValid}
                  onClick={handleChangeTermsAndPrivacyPolicyAgreed}
                  className={cx('terms-check-all')}
                >
                  <Checkbox.Label className={cx('terms-check-all-label')}>
                    약관 전체동의
                  </Checkbox.Label>
                </Checkbox>
              </div>
              <ul className={cx('terms-list')}>
                <li className={cx('terms-item')}>
                  <Checkbox
                    checked={ageAgreed}
                    onClick={handleChangeAgeAgreed}
                    className={cx('terms-item-checkbox')}
                    required
                  >
                    <Checkbox.Label className={cx('terms-item-label')}>
                      만 14세 이상 확인 (필수)
                    </Checkbox.Label>
                  </Checkbox>
                </li>
                <li className={cx('terms-item')}>
                  <Checkbox
                    checked={termsAgreed}
                    onClick={handleChangeTermsAgreed}
                    className={cx('terms-item-checkbox')}
                    required
                  >
                    <Checkbox.Label className={cx('terms-item-label')}>
                      서비스 이용 약관 (필수)
                    </Checkbox.Label>
                  </Checkbox>
                  <a
                    href={TERM_URL.USER_TERMS_OF_SERVICE}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={cx('terms-item-link')}
                    aria-label="약관 보기"
                    onClick={handleClickTermsLink}
                  >
                    <IconChevronRight
                      className={cx('icon-chevron')}
                      aria-hidden={true}
                    />
                  </a>
                </li>
                <li className={cx('terms-item')}>
                  <Checkbox
                    checked={privacyPolicyAgreed}
                    onClick={handleChangePrivacyPolicyAgreed}
                    className={cx('terms-item-checkbox')}
                    required
                  >
                    <Checkbox.Label className={cx('terms-item-label')}>
                      개인정보 수집 및 이용 약관 (필수)
                    </Checkbox.Label>
                  </Checkbox>
                  <a
                    href={TERM_URL.USER_PRIVACY_POLICY}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={cx('terms-item-link')}
                    aria-label="약관 보기"
                    onClick={handleClickTermsLink}
                  >
                    <IconChevronRight
                      className={cx('icon-chevron')}
                      aria-hidden={true}
                    />
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
      <footer className={cx('sign-up-footer')}>
        <Button
          variant="secondary"
          disabled={
            step === SIGN_UP_STEP.NICKNAME
              ? !isNicknameValid
              : !isTermsAndPrivacyPolicyValid
          }
          onClick={
            step === SIGN_UP_STEP.NICKNAME
              ? handleClickNicknameConfirmButton
              : handleClickTermsAndPrivacyPolicyConfirmButton
          }
        >
          확인
        </Button>
      </footer>
    </>
  );
};

export default SignUpPage;
