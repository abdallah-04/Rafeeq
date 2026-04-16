import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyListScreen } from '@/components/modal/add/EmptyListScreen';

export default function AddTeacherEmptyScreen() {
    const { t } = useTranslation();
    return (
        <EmptyListScreen
            title={t('teachers.title')}
            emptyTitle={t('teachers.emptyTitle')}
            emptyDesc={t('teachers.emptySubtitle')}
            addLabel={t('teachers.addFirst')}
            continueRoute="/(school)/teachers"
            background={require('@/assets/images/background/school.png')}
            onBack={() => router.push('/(auth)/verify-school-phone')}
            onAdd={() => router.push('/(school)/add-teacher')}
            onContinue={() => router.replace('/(school)/teachers')}
        />
    );
}
 