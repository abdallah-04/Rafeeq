import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useModal } from '@/components/modal/ModalProvider';
import { EmptyListScreen } from '@/components/modal/add/EmptyListScreen';

export default function AddChildParentScreen() {
    const { t } = useTranslation();
    const { show } = useModal();

    return (
        <EmptyListScreen
            title={t('myChildren.title')}
            emptyTitle={t('myChildren.emptyHeading')}
            emptyDesc={t('myChildren.emptyBody')}
            addLabel={t('myChildren.addFirst')}
            continueRoute="/(parent)/myChildren"
            background={require('@/assets/images/background/home.jpg')}
            onAdd={() => show('addChild')}
            onContinue={() => router.push('/(parent)/myChildren')}
        />
    );
}
