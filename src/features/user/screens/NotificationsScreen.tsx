import { useTranslation } from 'react-i18next';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const NotificationsScreen = () => {
  const { palettes } = useTheme();
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={faTriangleExclamation}
      iconColor={palettes.orange[600]}
      message={t('common.comingSoon')}
    />
  );
};
