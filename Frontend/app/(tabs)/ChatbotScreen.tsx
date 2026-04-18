import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

type Lang = 'en' | 'ar';

interface Message {
  id: string;
  role: 'user' | 'rafeeq';
  text: string;
  time: string;
}

const i18n: Record<Lang, { greeting: string; placeholder: string; title: string }> = {
  en: {
    greeting: 'How can I guide you today?',
    placeholder: 'Ask Rafeeq...',
    title: 'Rafeeq',
  },
  ar: {
    greeting: 'كيف يمكنني مساعدتك اليوم؟',
    placeholder: 'اسأل رفيق...',
    title: 'رفيق',
  },
};

const MOCK_REPLIES = [
  "That's a great question! I'm here to help you support your child's learning journey. Could you tell me more?",
  "Based on what you've shared, I'd recommend exploring some of our Speech activities in the Learning section.",
  "Children with ADD often respond well to short, structured tasks. Let's look at Zaid's current level and suggest something appropriate.",
  "I can help you understand Zaid's progress. His latest score shows strong social skills — 90%! Math is the area we'd focus on next.",
  "Don't worry — it's very normal to have questions. Rafeeq is here to guide you every step of the way. 🐧",
];

let replyIdx = 0;
const getNextReply = () => {
  const r = MOCK_REPLIES[replyIdx % MOCK_REPLIES.length];
  replyIdx++;
  return r;
};

const getTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

function Bubble({ msg, lang }: { msg: Message; lang: Lang }) {
  const isUser = msg.role === 'user';
  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowRafeeq,
      ]}
    >
      {!isUser && (
        <View style={styles.rafeeqAvatar}>
          <Text style={styles.rafeeqAvatarText}>🐧</Text>
        </View>
      )}
      <View style={{ maxWidth: '75%' }}>
        {!isUser && (
          <Text style={styles.bubbleSender}>
            RAFEEQ{'  '}<Text style={styles.bubbleTime}>{msg.time}</Text>
          </Text>
        )}
        {isUser && (
          <Text style={[styles.bubbleSender, styles.bubbleSenderUser]}>
            <Text style={styles.bubbleTime}>{msg.time}</Text>{'  '}YOU
          </Text>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleRafeeq,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser && styles.bubbleTextUser,
              lang === 'ar' && styles.rtlText,
            ]}
          >
            {msg.text}
          </Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ lang }: { lang: Lang }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.penguinEmoji}>🎓🐧</Text>
      <Text style={[styles.greeting, lang === 'ar' && styles.rtlText]}>
        {i18n[lang].greeting}
      </Text>
    </View>
  );
}

export default function ChatbotScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const t = i18n[lang];
  const isRTL = lang === 'ar';

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate Rafeeq reply
    setTimeout(() => {
      const rafeeqMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'rafeeq',
        text: getNextReply(),
        time: getTime(),
      };
      setMessages((prev) => [...prev, rafeeqMsg]);
      setTyping(false);
    }, 1200);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2FF" />

      {/* Top nav */}
      <View style={[styles.topNav, isRTL && styles.rowReverse]}>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t.title}</Text>
        {messages.length > 0 ? (
          <View style={styles.penguinAvatarBtn}>
            <Text style={styles.penguinAvatarText}>📚🐧</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {/* Language toggle — dev helper */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
        >
          <Text style={styles.langToggleText}>{lang === 'en' ? 'AR' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages area */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.messagesContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <EmptyState lang={lang} />
          ) : (
            messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} lang={lang} />
            ))
          )}

          {typing && (
            <View style={[styles.bubbleRow, styles.bubbleRowRafeeq]}>
              <View style={styles.rafeeqAvatar}>
                <Text style={styles.rafeeqAvatarText}>🐧</Text>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.typingText}>Rafeeq is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={[styles.inputBar, isRTL && styles.rowReverse]}>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.inputField, isRTL && styles.rtlText]}
            placeholder={t.placeholder}
            placeholderTextColor="#A0AEC0"
            value={input}
            onChangeText={setInput}
            multiline
            textAlign={isRTL ? 'right' : 'left'}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>{isRTL ? '◀' : '▶'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0F2FF',
  },

  // Top nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0F2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 20, color: '#1A2B4A' },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1A2B4A',
  },
  penguinAvatarBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  penguinAvatarText: { fontSize: 24 },
  langToggle: {
    position: 'absolute',
    right: 64,
    backgroundColor: '#4A90E220',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  langToggleText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#4A90E2',
  },

  // Messages
  messagesScroll: { flex: 1 },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  messagesContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  penguinEmoji: { fontSize: 80, marginBottom: 20 },
  greeting: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: '#1A2B4A',
    textAlign: 'center',
    lineHeight: 32,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Bubbles
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowRafeeq: {
    justifyContent: 'flex-start',
  },
  rafeeqAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rafeeqAvatarText: { fontSize: 18 },

  bubbleSender: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#A0AEC0',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bubbleSenderUser: { textAlign: 'right' },
  bubbleTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: 'normal',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleRafeeq: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1A2B4A',
    lineHeight: 20,
  },
  bubbleTextUser: { color: '#fff' },

  // Typing indicator
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  typingText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0F2FF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C0CAE0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtnText: { fontSize: 20, color: '#6B7A99', lineHeight: 22 },
  inputField: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1A2B4A',
    maxHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#C0CAE0',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: { fontSize: 16, color: '#fff' },
});