import type React from "react"
import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"

// Import navigation types
import type { RootStackParamList } from "./types/navigation"

// Import all screens
import SplashScreen from "./screens/SplashScreen"
import OnboardingScreen from "./screens/OnboardingScreen"
import SignInScreen from "./screens/SignInScreen"
import SignUpScreen from "./screens/SignUpScreen"
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen"
import HomeScreen from "./screens/HomeScreen"
import ProfileScreen from "./screens/ProfileScreen"
import EditProfileScreen from "./screens/EditProfileScreen"
import ChangePasswordScreen from "./screens/ChangePasswordScreen"
import CourseSelectionScreen from "./screens/CourseSelection"
import WassceInputScreen from "./screens/WassceInputScreen"
import ProgramRecommendationsScreen from "./screens/ProgramRecommendations"
import ChatScreen from "./screens/ChatScreen"
import FAQScreen from "./screens/FAQScreen"
import InquiryHistoryScreen from "./screens/InquiryHistoryScreen"

const Stack = createStackNavigator<RootStackParamList>()

type AppProps = {}

const App: React.FC<AppProps> = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAppState()
  }, [])

  const checkAppState = async () => {
    try {
      // Check if this is the first launch
      const hasLaunched = await AsyncStorage.getItem("hasLaunched")
      setIsFirstLaunch(hasLaunched === null)

      // Check authentication status
      try {
        const idToken = await SecureStore.getItemAsync("idToken")
        setIsAuthenticated(!!idToken)
      } catch (secureStoreError) {
        console.log("SecureStore not available, using AsyncStorage fallback")
        const idToken = await AsyncStorage.getItem("idToken")
        setIsAuthenticated(!!idToken)
      }

      // Simulate splash screen delay
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error("Error checking app state:", error)
      setIsLoading(false)
    }
  }

  const handleAuthChange = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      // Clear both SecureStore and AsyncStorage
      try {
        await SecureStore.deleteItemAsync("idToken")
        await SecureStore.deleteItemAsync("userEmail")
        await SecureStore.deleteItemAsync("userUid")
      } catch (secureStoreError) {
        console.log("SecureStore not available for logout")
      }

      await AsyncStorage.multiRemove(["idToken", "userEmail", "userUid", "userProfile"])
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Error during logout:", error)
      setIsAuthenticated(false)
    }
  }

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {isFirstLaunch ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} initialParams={{ onAuthChange: handleAuthChange }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home">{(props) => <HomeScreen {...props} onLogout={handleLogout} />}</Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
            <Stack.Screen name="WassceInput" component={WassceInputScreen} />
            <Stack.Screen name="ProgramRecommendations" component={ProgramRecommendationsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="InquiryHistory" component={InquiryHistoryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
