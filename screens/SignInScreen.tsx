import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation, useRoute } from "@react-navigation/native"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"
import type React from "react"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
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
  const FIREBASE_API_KEY = "AIzaSyBa3Ht1TcWCrUSsN5o3mGhGTVPjjz-8KJU"

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
      // Step 1: Sign in with backend to get custom token
      console.log("Attempting to sign in with URL:", `${API_BASE_URL}/signin`)
      const signInResponse = await fetch(`${API_BASE_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const signInData = await signInResponse.json()

      if (!signInResponse.ok) {
        throw new Error(signInData.error || `Sign in failed: ${signInResponse.status} ${signInResponse.statusText}`)
      }

      const customToken = signInData.customToken
      const userId = signInData.uid

      if (!customToken) {
        throw new Error("No custom token received from server")
      }

      // Step 2: Exchange custom token for Firebase ID token
      console.log("Exchanging custom token with Firebase")
      const firebaseResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
          }),
        }
      )

      const firebaseData = await firebaseResponse.json()
      console.log(firebaseData)

      if (!firebaseResponse.ok) {
        throw new Error(firebaseData.error?.message || `Firebase authentication failed: ${firebaseResponse.status}`)
      }

      const { idToken, refreshToken } = firebaseData
      if (!idToken || !refreshToken ) {
        throw new Error("Incomplete Firebase authentication response")
      }

      // Store authentication data
      try {
        await SecureStore.setItemAsync("idToken", idToken)
        await SecureStore.setItemAsync("refreshToken", refreshToken)
        await SecureStore.setItemAsync("userEmail", formData.email)
        await SecureStore.setItemAsync("userUid", userId)
      } catch (secureStoreError) {
        await AsyncStorage.setItem("idToken", idToken)
        await AsyncStorage.setItem("refreshToken", refreshToken)
        await AsyncStorage.setItem("userEmail", formData.email)
        await AsyncStorage.setItem("userUid", userId)
      }

      if (onAuthChange) {
        onAuthChange()
      }
    } catch (error: any) {
      console.error("Signin error:", error)

      Alert.alert("Error", error.message || "Failed to sign in. Please check your internet connection and try again.")
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