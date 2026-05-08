import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { useShallow } from 'zustand/react/shallow';
import { TERM_URL } from '@/shared/config/terms';
import { PROVIDER_TYPE } from '@/features/auth/config/constants';
import IconLogout from '@/assets/icons/icon-logout.svg?react';
import IconWarning from '@/assets/icons/icon-warning.svg?react';
import IconChevronRight from '@/assets/icons/icon-chevron-right.svg?react';
import { isWebView, MESSAGE_TYPES } from '@/shared/config/web-view';
import { PAGE_PATHS } from '@/shared/config/paths';

import classNames from 'classnames/bind';
import styles from './user-profile-action-list.module.scss';

const cx = classNames.bind(styles);

interface UserProfileActionListProps {
  onLogout: () => void;
  onWithdrawal: () => void;
}

export const UserProfileActionList = ({
  onLogout,
  onWithdrawal,
}: UserProfileActionListProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const isGuestUser = user?.providerType === PROVIDER_TYPE.GUEST;

  const termsOfServiceUrl = isGuestUser
    ? TERM_URL.GUEST_TERMS_OF_SERVICE
    : TERM_URL.USER_TERMS_OF_SERVICE;
  const privacyPolicyUrl = isGuestUser
    ? TERM_URL.GUEST_PRIVACY_POLICY
    : TERM_URL.USER_PRIVACY_POLICY;

  const handleClickLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

  return (
    <ul className={cx('action-list')}>
      <li className={cx('action-item')}>
        <a
          href={termsOfServiceUrl}
          className={cx('action-link')}
          onClick={handleClickLink}
        >
          <span className={cx('action-name')}>서비스 이용 약관</span>
          <IconChevronRight className={cx('icon-chevron')} aria-hidden={true} />
        </a>
      </li>
      <li className={cx('action-item')}>
        <a
          href={privacyPolicyUrl}
          className={cx('action-link')}
          onClick={handleClickLink}
        >
          <span className={cx('action-name')}>개인정보 수집 및 이용 약관</span>
          <IconChevronRight className={cx('icon-chevron')} aria-hidden={true} />
        </a>
      </li>
      <li className={cx('action-item')}>
        <div className={cx('action-item-inner')}>
          <span className={cx('action-name')}>앱 버전</span>
          <span className={cx('version')}>1.0.0</span>
        </div>
      </li>
      <li className={cx('action-item')}>
        <a
          href={TERM_URL.INQUIRY}
          className={cx('action-link')}
          onClick={handleClickLink}
        >
          <span className={cx('action-name')}>문의하기</span>
          <IconChevronRight className={cx('icon-chevron')} aria-hidden={true} />
        </a>
      </li>
      {isGuestUser ? (
        <li className={cx('action-item')}>
          <button
            type="button"
            className={cx('button-action', 'logout')}
            onClick={() => navigate(PAGE_PATHS.SOCIAL_CONNECTION)}
          >
            계정 연동
          </button>
        </li>
      ) : (
        <li className={cx('action-item')}>
          <button
            type="button"
            className={cx('button-action', 'logout')}
            onClick={onLogout}
          >
            <IconLogout className={cx('icon-action')} aria-hidden="true" />
            로그아웃
          </button>
        </li>
      )}
      <li className={cx('action-item')}>
        <button
          type="button"
          className={cx('button-action', 'withdrawal')}
          onClick={onWithdrawal}
        >
          <IconWarning className={cx('icon-action')} aria-hidden="true" />
          {isGuestUser ? '게스트 모드 종료' : '회원탈퇴'}
        </button>
      </li>
    </ul>
  );
};
