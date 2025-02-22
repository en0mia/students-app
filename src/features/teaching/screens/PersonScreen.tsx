import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  faEnvelope,
  faLink,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { PersonCourse, PhoneNumber } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { notNullish } from '../../../utils/predicates';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Person'>;

const profileImageSize = 120;

export const PersonScreen = ({ route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const personQuery = useGetPerson(id);
  const person = personQuery.data;
  const fullName = [person?.firstName, person?.lastName]
    .filter(notNullish)
    .join(' ');
  useScreenTitle(fullName, false);
  const courses = person?.courses ?? [];
  const phoneNumbers = person?.phoneNumbers;

  const header = (
    <Col ph={5} pv={2} gap={5} mb={5}>
      <Text weight="bold" variant="title" style={styles.title}>
        {fullName}
      </Text>
      <Row>
        <View accessible={true} accessibilityLabel={t('common.profilePic')}>
          {person?.picture ? (
            <Image
              source={{ uri: person.picture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon
                icon={faUser}
                size={fontSizes['3xl']}
                color={colors.title}
              />
            </View>
          )}
        </View>
        <Col style={styles.info}>
          <Metric
            title={t('personScreen.role')}
            value={person?.role ?? ''}
            style={styles.spaceBottom}
            accessible={true}
          />
          {person?.facilityShortName && (
            <Metric
              title={t('personScreen.department')}
              value={person?.facilityShortName}
              style={styles.spaceBottom}
              accessible={true}
            />
          )}

          {!!person?.profileUrl && (
            <TouchableOpacity
              onPress={() => Linking.openURL(person?.profileUrl)}
              accessible={true}
              accessibilityRole="link"
            >
              <Row align="center">
                <Icon
                  icon={faLink}
                  size={20}
                  color={colors.link}
                  style={styles.linkIcon}
                />
                <Text variant="link">{t('personScreen.moreInfo')}</Text>
              </Row>
            </TouchableOpacity>
          )}
        </Col>
      </Row>
    </Col>
  );

  const renderPhoneNumber = (phoneNumber: PhoneNumber, index: number) => {
    return (
      <ListItem
        key={index}
        isAction
        leadingItem={<Icon icon={faPhone} size={fontSizes.xl} />}
        title={t('common.phone')}
        subtitle={[phoneNumber.full, phoneNumber?.internal]
          .filter(notNullish)
          .join(' / ')}
        onPress={() => Linking.openURL(`tel:${phoneNumber.full}`)}
      />
    );
  };

  const RenderedCourse = (course: PersonCourse, index: number) => {
    const { accessibilityListLabel } = useAccessibility();

    const onPressCourse = () => {
      // TODO
      console.debug('onPressCourse', course);
    };

    const role = useMemo(() => {
      return course.role === 'Titolare' ? 'roleHolder' : 'roleCollaborator';
    }, [course.role]);

    return (
      <ListItem
        key={course.id}
        title={course.name}
        subtitle={`${course.year} - ${t('common.' + role)}`}
        isAction
        accessibilityLabel={`${accessibilityListLabel(
          index,
          courses?.length || 0,
        )}. ${course.name}, ${course.year} -${t('common.' + role)}`}
        onPress={onPressCourse}
      />
    );
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl queries={[personQuery]} />}
      contentInsetAdjustmentBehavior="automatic"
    >
      {header}
      <Section>
        <SectionHeader
          title={t('personScreen.contacts')}
          accessibilityLabel={`${t('personScreen.contacts')}. ${
            phoneNumbers?.length && t('common.phoneContacts')
          }. ${t('personScreen.sentEmail')}`}
        />
        <SectionList indented>
          {phoneNumbers?.map(renderPhoneNumber)}
          <ListItem
            isAction
            leadingItem={<Icon icon={faEnvelope} size={fontSizes.xl} />}
            title={t('common.email')}
            subtitle={person?.email}
            onPress={() => Linking.openURL(`mailto:${person?.email}`)}
          />
        </SectionList>
      </Section>
      {courses.length > 0 && (
        <Section>
          <SectionHeader
            title={t('common.course_plural')}
            accessible={true}
            accessibilityLabel={`${t('personScreen.coursesLabel')}. ${t(
              'personScreen.totalCourses',
              { total: courses.length },
            )}`}
          />
          <SectionList>{courses.map(RenderedCourse)}</SectionList>
        </Section>
      )}
    </ScrollView>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) => {
  const profileImage = {
    width: profileImageSize,
    height: profileImageSize,
    borderRadius: profileImageSize,
  };
  return StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
    },
    info: {
      paddingLeft: spacing[4],
    },
    profileImage,
    profileImagePlaceholder: {
      ...profileImage,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    linkIcon: {
      marginRight: spacing[2],
    },
  });
};
