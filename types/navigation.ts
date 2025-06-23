import type { StackNavigationProp } from "@react-navigation/stack"
import type { RouteProp } from "@react-navigation/native"

export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  SignIn: { onAuthChange?: () => void } | undefined
  SignUp: undefined
  ForgotPassword: undefined
  Home: undefined
  Profile: undefined
  EditProfile: undefined
  ChangePassword: undefined
  CourseSelection: undefined
  WassceInput: { selectedCourse: string }
  ProgramRecommendations: { course: string; results: Record<string, string> }
  Chat: undefined
  FAQ: undefined
  InquiryHistory: undefined
  SavedPrograms: undefined
  Support: undefined
  About: undefined
  Programs: undefined
}

export type NavigationProp = StackNavigationProp<RootStackParamList>

export type ScreenRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>

// Helper type for screens that need navigation prop
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>
  route: RouteProp<RootStackParamList, T>
}
