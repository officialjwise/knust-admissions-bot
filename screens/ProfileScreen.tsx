import { MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import axios from "axios"
import type React from "react"
import { useEffect, useState } from "react"
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import type { NavigationProp } from "../types/navigation"

type ProfileScreenProps = {
  onLogout?: () => void
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    program: "",
    level: "",
  })

  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/profile")
      if (response.data) {
        setUserProfile(response.data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
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
      onPress: () => navigation.navigate("Support"),
    },
    {
      id: "about",
      title: "About",
      subtitle: "App version and information",
      icon: "info",
      onPress: () => navigation.navigate("About"),
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
                {userProfile.firstName ? userProfile.firstName[0] : "?"}
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
          <Text style={styles.appInfoText}>© 2025 KNUST. All rights reserved.</Text>
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
