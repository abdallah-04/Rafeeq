import React from 'react';
import { router } from 'expo-router';
import { useModal } from '@/components/modal/ModalProvider';
import { EmptyListScreen } from '@/components/modal/add/EmptyListScreen';

export default function AddChildParentScreen() {
    const { show } = useModal();

    return (
        <EmptyListScreen
            title="My children"
            emptyTitle="Its a little quiet here !"
            emptyDesc="You haven't added any children yet add your first child to start learning journey with Rafeeq"
            addLabel="Add your first child"
            continueRoute="/(parent)/myChildren"
            background={require('@/assets/images/background/home.jpg')}
            onAdd={() => show('addChild')}
            onContinue={() => router.push('/(parent)/myChildren')}
        />
    );
}
