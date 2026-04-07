import { Colors, Radius, Spacing } from "@/theme";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

type Role = "parent" | "school" | "teacher";

interface RoleOption {
  key: Role;
  icon: string;
  titleKey: string;
  descKey: string;
  route: string;
}

const ROLES: RoleOption[] = [
  {
    key: "parent",
    icon: "👨‍👩‍👧",
    titleKey: "roleSelect.parentTitle",
    descKey: "roleSelect.parentDesc",
    route: "/(auth)/signup-parent",
  },
  {
    key: "school",
    icon: "🏫",
    titleKey: "roleSelect.schoolTitle",
    descKey: "roleSelect.schoolDesc",
    route: "/(auth)/signup-school",
  },
    {
    key: "teacher",
    icon: "👩‍🏫",
    titleKey: "roleSelect.teacherTitle",
    descKey: "roleSelect.teacherDesc",
    route: "/(teacher)/students",
  },

];

interface RoleSelectProps {
  option: RoleOption;
  onPress: (route: string) => void;
}

function RoleCard({ option, onPress }: RoleSelectProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        onPress={() => onPress(option.route)}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={t(option.titleKey)}
        accessibilityHint={t(option.descKey)}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{option.icon}</Text>
        </View>

        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{t(option.titleKey)}</Text>
          <Text style={styles.cardDesc}>{t(option.descKey)}</Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelectionScreen() {
  const { t } = useTranslation();

  const handleRolePress = (route: string) => {
    router.push(route as any);
  };

  const handleLoginPress = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("roleSelect.title")}</Text>
          <Text style={styles.subtitle}>{t("roleSelect.subtitle")}</Text>
        </View>

        <View style={styles.cards}>
          {ROLES.map((role) => (
            <RoleCard key={role.key} option={role} onPress={handleRolePress} />
          ))}
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            {t("roleSelect.alreadyHaveAccount")}{" "}
          </Text>
          <TouchableOpacity onPress={handleLoginPress} accessibilityRole="link">
            <Text style={styles.loginLink}>{t("roleSelect.logIn")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLink}>🌐 {t("common.language")}</Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerLink}>{t("common.privacyPolicy")}</Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerLink}>{t("common.terms")}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backBtn: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    alignSelf: "flex-start",
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textDark,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: Spacing.xl * 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textDark,
    fontFamily: "Lexend-Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMedium,
    fontFamily: "Lexend-Regular",
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },

  cards: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    minHeight: 80,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 26,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textDark,
    fontFamily: "Lexend-Bold",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textMedium,
    fontFamily: "Lexend-Regular",
    lineHeight: 19,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textLight,
    fontWeight: "300",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl * 2,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textMedium,
    fontFamily: "Lexend-Regular",
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Lexend-SemiBold",
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    position: "absolute",
    bottom: Spacing.xl,
    left: 0,
    right: 0,
  },
  footerLink: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Lexend-Regular",
  },
  footerDot: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
