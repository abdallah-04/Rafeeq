import React from 'react';
import { router } from 'expo-router';
import { EmptyListScreen } from '@/components/modal/add/EmptyListScreen';

export default function AddTeacherEmptyScreen() {
    return (
        <EmptyListScreen
            title="My teachers"
            emptyTitle="You haven't added any teachers yet!"
            emptyDesc="Add teachers to manage their classes and students."
            addLabel="Add your first teacher"
            continueRoute="/(school)/teachers"
            background={require('@/assets/images/background/school.png')}
            onBack={() => router.push('/(auth)/verify-school-phone')}
            onAdd={() => router.push('/(school)/add-teacher')}
            onContinue={() => router.replace('/(school)/teachers')}
        />
    );
}
 