import { Colors, Radius, Spacing } from "@/theme";
import { useSchoolSignupStore } from "@/store/schoolSignupStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SchoolWelcomeScreen() {
  const { t } = useTranslation();
  const { step1, clearSignup } = useSchoolSignupStore();

  useEffect(() => {
    clearSignup();
  }, []);

  const handleGetStarted = () => {
    router.replace("/(school)/teachers");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.container}>

        <View style={styles.logoRow}>
          <Text style={styles.logoEn}>RAFEEQ</Text>
          <Text style={styles.logoAr}>رفيق</Text>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.welcomeLabel}>{t("schoolWelcome.welcome")}</Text>
            <Text style={styles.advisorName}>
              {t("schoolWelcome.mr")} {step1.advisorName ?? "Ahmad"}
            </Text>
          </View>
          <Image
            source={require("@/assets/images/penguin-grad.png")}
            style={styles.penguin}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>{t("common.getStarted")}</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    justifyContent: "center",
  },
  logoRow: {
    alignItems: "center",
    marginBottom: Spacing.xl * 2,
  },
  logoEn: {
    fontSize: 22,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  logoAr: {
    fontSize: 18,
    fontFamily: "Lexend-Regular",
    color: Colors.primary,
    marginTop: 2,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl * 3,
  },
  heroText: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 28,
    fontFamily: "Lexend-Bold",
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 4,
  },
  advisorName: {
    fontSize: 28,
    fontFamily: "Lexend-Bold",
    fontWeight: "800",
    color: Colors.textDark,
  },
  penguin: {
    width: 130,
    height: 130,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontFamily: "Lexend-Bold",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});