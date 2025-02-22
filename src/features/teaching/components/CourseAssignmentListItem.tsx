import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, TouchableHighlightProps } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IconButton } from '@lib/ui/components/IconButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseAssignment } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { formatDateTime } from '../../../utils/dates';
import { formatFileSize } from '../../../utils/files';

interface Props {
  item: CourseAssignment;
  accessibilityListLabel?: string;
}

const Menu = ({
  shouldOpenOnLongPress = false,
  children,
}: PropsWithChildren<{ shouldOpenOnLongPress?: boolean }>) => {
  const { t } = useTranslation();

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      actions={[
        {
          id: 'retract',
          title: t('common.retract'),
          attributes: {
            destructive: true,
          },
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        switch (nativeEvent.event) {
          case 'retract':
            // TODO retract assignment
            break;
          default:
        }
      }}
    >
      {children}
    </MenuView>
  );
};

export const CourseAssignmentListItem = ({
  item,
  accessibilityListLabel,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const { colors, spacing, fontSizes } = useTheme();
  const subTitle = `${formatFileSize(item.sizeInKiloBytes)} - ${formatDateTime(
    item.uploadedAt,
  )}`;
  const listItem = useMemo(
    () => (
      <FileListItem
        onPress={async () => {
          await Linking.openURL(item.url);
        }}
        title={item.description}
        titleStyle={{
          textDecorationLine:
            item.deletedAt != null ? 'line-through' : undefined,
        }}
        subtitle={subTitle}
        accessibilityLabel={`${accessibilityListLabel}. ${item.description}, ${subTitle}`}
        mimeType={item.mimeType}
        trailingItem={
          item.deletedAt == null
            ? Platform.select({
                android: (
                  <Menu>
                    <IconButton
                      style={{
                        padding: spacing[3],
                      }}
                      icon={faEllipsisVertical}
                      color={colors.secondaryText}
                      size={fontSizes.xl}
                      hitSlop={{
                        right: +spacing[2],
                        left: +spacing[2],
                      }}
                    />
                  </Menu>
                ),
              })
            : undefined
        }
        {...rest}
      />
    ),
    [item, spacing, colors, rest],
  );

  if (Platform.OS === 'ios') {
    return <Menu shouldOpenOnLongPress={true}>{listItem}</Menu>;
  }
  return listItem;
};
