import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { useNavigation, useRoute } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import Constants from "expo-constants"
import type { NavigationProp, ScreenRouteProp } from "../types/navigation"

type SignInScreenProps = {}

const SignInScreen: React.FC<SignInScreenProps> = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<ScreenRouteProp<"SignIn">>()
  const { onAuthChange } = route.params || {}

  const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || "https://knust-chat-bot-backend.onrender.com"

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // For demo purposes, allow demo credentials to work offline
      if (formData.email === "demo@knust.edu.gh" && formData.password === "demo123") {
        // Store demo credentials
        try {
          await SecureStore.setItemAsync("idToken", "demo-token")
          await SecureStore.setItemAsync("userEmail", formData.email)
          await SecureStore.setItemAsync("userUid", "demo-uid")
        } catch (secureStoreError) {
          // Fallback to AsyncStorage
          await AsyncStorage.setItem("idToken", "demo-token")
          await AsyncStorage.setItem("userEmail", formData.email)
          await AsyncStorage.setItem("userUid", "demo-uid")
        }

        if (onAuthChange) {
          onAuthChange()
        }
        return
      }

      // Try to connect to backend (skip Firebase for now in Expo Go)
      console.log("Attempting to sign in with URL:", `${API_BASE_URL}/signin`)
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Sign in failed: ${response.status} ${response.statusText}`)
      }

      // Store authentication data without Firebase for Expo Go
      try {
        await SecureStore.setItemAsync("idToken", data.customToken || "authenticated")
        await SecureStore.setItemAsync("userEmail", formData.email)
        await SecureStore.setItemAsync("userUid", data.uid || "user-uid")
      } catch (secureStoreError) {
        await AsyncStorage.setItem("idToken", data.customToken || "authenticated")
        await AsyncStorage.setItem("userEmail", formData.email)
        await AsyncStorage.setItem("userUid", data.uid || "user-uid")
      }

      if (onAuthChange) {
        onAuthChange()
      }
    } catch (error: any) {
      console.error("Signin error:", error)

      // Show user-friendly error message
      if (error.message.includes("Network request failed") || error.message.includes("timeout")) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again.",
          [
            {
              text: "Try Demo",
              onPress: () => {
                setFormData({ email: "demo@knust.edu.gh", password: "demo123" })
              },
            },
            { text: "OK" },
          ],
        )
      } else {
        Alert.alert("Error", error.message || "Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword")
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🎓</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your KNUST journey</Text>
          </View>

          {/* Demo credentials hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>Demo: demo@knust.edu.gh / demo123</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateFormData("email", text)}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => updateFormData("password", text)}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#006633",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: { fontSize: 32, color: "#FFFFFF" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#6B7280", textAlign: "center" },
  demoHint: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  demoHintText: {
    fontSize: 14,
    color: "#166534",
    textAlign: "center",
    fontWeight: "500",
  },
  form: { flex: 1 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "#EF4444" },
  inputIcon: { marginLeft: 16, marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, paddingRight: 16, fontSize: 16, color: "#1F2937" },
  eyeIcon: { padding: 16 },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { color: "#006633", fontSize: 14, fontWeight: "500" },
  signInButton: {
    backgroundColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  signInButtonDisabled: { opacity: 0.6 },
  signInButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  signUpContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24 },
  signUpText: { color: "#6B7280", fontSize: 14 },
  signUpLink: { color: "#006633", fontSize: 14, fontWeight: "600" },
})

export default SignInScreen
