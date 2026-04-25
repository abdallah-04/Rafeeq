import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/modal/shared/Text';
import BottomNav from '@/components/modal/shared/BottomNav';
import BackButton from '@/components/modal/shared/BackButton';
import Mascot from '@/components/modal/shared/mascot';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, ChatMessage } from '@/store/chatStore';

const { colors, spacing, typography, radius } = theme;

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.typingDots}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg, isRTL }: { msg: ChatMessage; isRTL: boolean }) {
  const { t } = useTranslation();
  const isRafeeq = msg.role === 'rafeeq';

  return (
    <View
      style={[
        styles.bubbleRow,
        isRafeeq
          ? isRTL ? styles.bubbleRowRight : styles.bubbleRowLeft
          : isRTL ? styles.bubbleRowLeft : styles.bubbleRowRight,
      ]}
    >
      <View style={styles.bubbleWrap}>
        <Text style={[
          styles.bubbleLabel,
          isRafeeq ? styles.labelRafeeq : styles.labelUser,
          (isRafeeq ? !isRTL : isRTL) ? styles.textLeft : styles.textRight,
        ]}>
          {isRafeeq ? t('chatbot.label_rafeeq') : t('chatbot.label_you')}
        </Text>
        <View style={[
          styles.bubble,
          isRafeeq ? styles.bubbleRafeeq : styles.bubbleUser,
        ]}>
          {msg.attachment && (
            <View style={styles.attachmentChip}>
              <Ionicons
                name={
                  msg.attachment.type === 'image' ? 'image-outline' :
                  msg.attachment.type === 'voice' ? 'mic-outline' : 'document-outline'
                }
                size={14}
                color={isRafeeq ? colors.textSecondary : colors.textWhite}
              />
              <Text style={[styles.attachmentText, isRafeeq ? {} : { color: colors.textWhite }]}>
                {msg.attachment.name}
              </Text>
            </View>
          )}
          <Text style={[
            styles.bubbleText,
            isRafeeq ? styles.bubbleTextRafeeq : styles.bubbleTextUser,
            isRTL ? styles.textRight : styles.textLeft,
          ]}>
            {msg.text}
          </Text>
        </View>
        <Text style={[
          styles.timestamp,
          (isRafeeq ? !isRTL : isRTL) ? styles.textLeft : styles.textRight,
        ]}>
          {msg.timestamp}
        </Text>
      </View>
    </View>
  );
}

// ─── Attachment Menu ──────────────────────────────────────────────────────────

function AttachmentMenu({
  visible,
  onClose,
  onSelect,
  isRTL,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'image' | 'file' | 'voice', name: string) => void;
  isRTL: boolean;
}) {
  const { t } = useTranslation();

  const OPTIONS: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    type: 'image' | 'file' | 'voice';
    name: string;
  }[] = [
    { icon: 'image-outline',    label: t('chatbot.attachPhoto'),  type: 'image', name: 'photo.jpg' },
    { icon: 'camera-outline',   label: t('chatbot.attachCamera'), type: 'image', name: 'camera.jpg' },
    { icon: 'document-outline', label: t('chatbot.attachFile'),   type: 'file',  name: 'document.pdf' },
    { icon: 'mic-outline',      label: t('chatbot.attachVoice'),  type: 'voice', name: 'voice.m4a' },
  ];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.attachOverlay} onPress={onClose}>
        <Pressable style={styles.attachSheet} onPress={() => {}}>
          <View style={styles.attachHandle} />
          <View style={[styles.attachGrid, isRTL && { flexDirection: 'row-reverse', flexWrap: 'wrap-reverse' }]}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.type + opt.label}
                style={styles.attachOption}
                onPress={() => { onSelect(opt.type, opt.name); onClose(); }}
                accessibilityLabel={opt.label}
              >
                <View style={styles.attachIconCircle}>
                  <Ionicons name={opt.icon} size={26} color={colors.primary} />
                </View>
                <Text style={[styles.attachLabel, isRTL && styles.textRight]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChatbotScreen() {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const { messages, isTyping, sendMessage } = useChatStore();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatMessage['attachment'] | undefined>();
  const listRef = useRef<FlatList>(null);

  const isEmpty = messages.length === 0 && !isTyping;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/Home-parent' as any);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text && !pendingAttachment) return;
    sendMessage(text || '📎', pendingAttachment);
    setInputText('');
    setPendingAttachment(undefined);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  // Build display list (add typing indicator as last item when typing)
  const displayData: (ChatMessage | { id: string; role: 'typing' })[] = [
    ...messages,
    ...(isTyping ? [{ id: '__typing__', role: 'typing' as const }] : []),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <BackButton onPress={handleBack} />
        <View style={styles.titleWrap}>
          <Text style={styles.topTitle}>
            {t('chatbot.title').replace(' Assistant', '')}
          </Text>
        </View>
        <View style={styles.side} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Mascot pose="waving" size="lg" />
            <Text style={[styles.emptyTitle, isRTL && styles.textRight]}>
              {t('chatbot.emptyGreeting')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={displayData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.role === 'typing') {
                return (
                  <View style={[styles.bubbleRow, isRTL ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
                    <View style={styles.bubbleWrap}>
                      <Text style={[styles.bubbleLabel, styles.labelRafeeq]}>
                        {t('chatbot.label_rafeeq')}
                      </Text>
                      <View style={styles.bubbleRafeeq}>
                        <TypingIndicator />
                      </View>
                    </View>
                  </View>
                );
              }
              return <MessageBubble msg={item as ChatMessage} isRTL={isRTL} />;
            }}
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, isRTL && styles.rowReverse]}>
          {/* Attach button */}
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setShowAttach(true)}
            accessibilityLabel="Attach"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Input pill */}
          <View style={[styles.inputPill, isRTL && styles.rowReverse]}>
            {pendingAttachment && (
              <TouchableOpacity
                style={styles.pendingChip}
                onPress={() => setPendingAttachment(undefined)}
              >
                <Ionicons name="document-attach-outline" size={14} color={colors.primary} />
                <Text style={styles.pendingChipText} numberOfLines={1}>
                  {pendingAttachment.name}
                </Text>
                <Ionicons name="close" size={12} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TextInput
              style={[styles.textInput, isRTL && styles.textRight]}
              placeholder={t('chatbot.inputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              accessibilityLabel={t('chatbot.inputPlaceholder')}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !(inputText.trim() || pendingAttachment) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() && !pendingAttachment}
            accessibilityLabel="Send"
          >
            <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
              <Ionicons name="send" size={18} color={colors.textWhite} />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AttachmentMenu
        visible={showAttach}
        onClose={() => setShowAttach(false)}
        onSelect={(type, name) => setPendingAttachment({ type, name })}
        isRTL={isRTL}
      />

      <BottomNav />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex:   1, backgroundColor: colors.background },

  rowReverse: { flexDirection: 'row-reverse' },
  textLeft:  { textAlign: 'left' },
  textRight: { textAlign: 'right' },

  // ── Top bar ─────────────────────────────────────
topBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
},

titleWrap: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

topTitle: {
  textAlign: 'center',
  fontSize: typography.fontSize.lg,
  fontFamily: typography.fontFamily.bold,
  color: colors.textPrimary,
},

side: {
  width: 44,
  height: 44,
},

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // ── Empty state ─────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },

  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // ── Message list ─────────────────────────────────
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },

  bubbleRowLeft:  { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },

  bubbleWrap: {
    maxWidth: '78%',
    gap: 4,
  },

  bubbleLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
    marginHorizontal: 4,
  },

  labelRafeeq: { color: colors.primary },
  labelUser:   { color: colors.textMuted },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  bubbleRafeeq: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  bubbleUser: {
    backgroundColor: colors.primary,
  },

  bubbleText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 20,
  },

  bubbleTextRafeeq: { color: colors.textPrimary },
  bubbleTextUser:   { color: colors.textWhite },

  timestamp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    marginHorizontal: 4,
  },

  // ── Typing dots ──────────────────────────────────
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // ── Attachment chip (in bubble) ──────────────────
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },

  attachmentText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },

  // ── Input bar ─────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputPill: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.backgroundLight,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
  },

  pendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLighter,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  pendingChipText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    maxWidth: 120,
  },

  textInput: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 4,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

  sendBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },

  // ── Attachment menu ───────────────────────────────
  attachOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  attachSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  attachHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },

  attachGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  attachOption: {
    width: '45%',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: radius.xl,
    minHeight: 90,
    justifyContent: 'center',
  },

  attachIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attachLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
