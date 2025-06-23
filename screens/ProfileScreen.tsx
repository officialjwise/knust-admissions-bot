import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import type { NavigationProp } from "../types/navigation"

type ProfileScreenProps = {
  onLogout?: () => void
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  // The function must return JSX (ReactNode), which it already does below.
  const [userProfile, setUserProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "demo@knust.edu.gh",
    phone: "+233 24 123 4567",
    studentId: "KN2024001",
    program: "BSc Computer Science",
    level: "100",
  })
  type SettingsKey = "notifications" | "emailUpdates" | "darkMode" | "biometric"
  
  const [settings, setSettings] = useState<{
    notifications: boolean
    emailUpdates: boolean
    darkMode: boolean
    biometric: boolean
  }>({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    biometric: false,
  })

  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    loadUserProfile()
    loadSettings()
  }, [])

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("userProfile")
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile))
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("userSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const updateSetting = async (key: SettingsKey, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    try {
      await AsyncStorage.setItem("userSettings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["userToken", "userEmail", "userProfile"])
            if (onLogout) {
              onLogout()
            }
          } catch (error) {
            console.error("Error logging out:", error)
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert("Account Deleted", "Your account has been deleted successfully.")
        },
      },
    ])
  }

  const profileMenuItems = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "edit",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      id: "change-password",
      title: "Change Password",
      subtitle: "Update your account password",
      icon: "lock",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      id: "inquiry-history",
      title: "Inquiry History",
      subtitle: "View your past questions and answers",
      icon: "history",
      onPress: () => navigation.navigate("InquiryHistory"),
    },
    {
      id: "saved-programs",
      title: "Saved Programs",
      subtitle: "Programs you've bookmarked",
      icon: "bookmark",
      onPress: () => {
        Alert.alert("Coming Soon", "Saved Programs feature will be available soon!")
      },
    },
  ]

  const appMenuItems = [
    {
      id: "faq",
      title: "FAQ",
      subtitle: "Frequently asked questions",
      icon: "help",
      onPress: () => navigation.navigate("FAQ"),
    },
    {
      id: "support",
      title: "Support",
      subtitle: "Get help and contact us",
      icon: "support",
      onPress: () => {
        Alert.alert("Support", "Contact us at support@knust.edu.gh for assistance.")
      },
    },
    {
      id: "about",
      title: "About",
      subtitle: "App version and information",
      icon: "info",
      onPress: () => {
        Alert.alert("About", "KNUST Pathfinder v1.0.0\n\nYour comprehensive guide to KNUST admissions.")
      },
    },
  ]

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <MaterialIcons name={item.icon} size={20} color="#006633" />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  )

  const renderSettingItem = (key: SettingsKey, title: string, subtitle: string) => (
    <View key={key} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: "#D1D5DB", true: "#BBF7D0" }}
        thumbColor={settings[key] ? "#006633" : "#F3F4F6"}
      />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {userProfile.firstName.charAt(0)}
                {userProfile.lastName.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Text style={styles.profileEmail}>{userProfile.email}</Text>
              <Text style={styles.profileProgram}>{userProfile.program}</Text>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>Level {userProfile.level}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {profileMenuItems.map(renderMenuItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            {renderSettingItem("notifications", "Push Notifications", "Receive app notifications")}
            {renderSettingItem("emailUpdates", "Email Updates", "Get updates via email")}
            {renderSettingItem("darkMode", "Dark Mode", "Use dark theme")}
            {renderSettingItem("biometric", "Biometric Login", "Use fingerprint or face ID")}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {appMenuItems.map(renderMenuItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>KNUST Pathfinder v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 KNUST. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#006633",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#006633",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  profileProgram: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  settingsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 12,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
})

export default ProfileScreen
