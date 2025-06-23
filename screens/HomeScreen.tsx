import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import React, { JSX, useEffect, useState } from "react"
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

type RootStackParamList = {
  Chat: undefined;
  Programs: undefined;
  FAQ: undefined;
  Profile: undefined;
}

const { width } = Dimensions.get("window")

const HomeScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [userName, setUserName] = useState("Student")
  const [currentTime, setCurrentTime] = useState(new Date())
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    loadUserData()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail")
      if (email) {
        const name = email.split("@")[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const quickActions: QuickActionProps[] = [
    {
      id: 1,
      title: "Chat Assistant",
      description: "Get instant help",
      icon: "chat",
      color: "#006633",
      onPress: () => navigation.navigate("Chat"),
    },
    {
      id: 2,
      title: "Find Programs",
      description: "Discover courses",
      icon: "school",
      color: "#FFC107",
      onPress: () => navigation.navigate("Programs"),
    },
    {
      id: 3,
      title: "FAQ",
      description: "Common questions",
      icon: "help",
      color: "#FF6B35",
      onPress: () => navigation.navigate("FAQ"),
    },
    {
      id: 4,
      title: "My Profile",
      description: "Account settings",
      icon: "person",
      color: "#8B5CF6",
      onPress: () => navigation.navigate("Profile"),
    },
  ]

  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Application Deadline Extended",
      description: "The deadline for 2024/2025 applications has been extended to March 31st, 2025.",
      type: "important",
      date: "2024-12-20",
    },
    {
      id: 2,
      title: "New Engineering Programs",
      description: "KNUST introduces new specialized engineering programs for the upcoming academic year.",
      type: "info",
      date: "2024-12-18",
    },
    {
      id: 3,
      title: "Virtual Campus Tour",
      description: "Join our virtual campus tour every Saturday at 10:00 AM.",
      type: "event",
      date: "2024-12-15",
    },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Application Submission",
      date: "2025-03-31",
      daysLeft: 90,
    },
    {
      id: 2,
      title: "Document Upload",
      date: "2025-04-15",
      daysLeft: 105,
    },
    {
      id: 3,
      title: "Interview Period",
      date: "2025-05-01",
      daysLeft: 121,
    },
  ]

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["userToken", "userEmail"])
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

  interface QuickActionProps {
    id: number;
    title: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    onPress: () => void;
  }

  interface QuickActionIconProps {
    name: keyof typeof MaterialIcons.glyphMap;
    size: number;
    color: string;
  }

  const renderQuickAction = (action: QuickActionProps): JSX.Element => (
    <TouchableOpacity
                          key={action.id}
                          style={[styles.quickActionCard, { backgroundColor: action.color }]}
                          onPress={action.onPress}
                        >
                          <MaterialIcons 
                            name={action.icon} 
                            size={32} 
                            color="#FFFFFF" 
                          />
                          <Text style={styles.quickActionTitle}>{action.title}</Text>
                          <Text style={styles.quickActionDescription}>{action.description}</Text>
                        </TouchableOpacity>
  )

  interface Announcement {
    id: number;
    title: string;
    description: string;
    type: 'important' | 'info' | 'event';
    date: string;
  }

  interface QuickActionIconProps {
    name: keyof typeof MaterialIcons.glyphMap;
    size: number;
    color: string;
  }

  interface QuickActionTextProps {
    children: string;
    style: any; // Keeping as 'any' since StyleSheet types are defined elsewhere
  }

  const renderAnnouncement = (announcement: Announcement): JSX.Element => (
      <View key={announcement.id} style={styles.announcementCard}>
        <View style={styles.announcementHeader}>
          <View
            style={[
              styles.announcementType,
              announcement.type === "important" && styles.typeImportant,
              announcement.type === "info" && styles.typeInfo,
              announcement.type === "event" && styles.typeEvent,
            ]}
          >
            <Text style={styles.announcementTypeText}>{announcement.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.announcementDate}>{announcement.date}</Text>
        </View>
        <Text style={styles.announcementTitle}>{announcement.title}</Text>
        <Text style={styles.announcementDescription}>{announcement.description}</Text>
      </View>
    )

    interface Deadline {
    id: number;
    title: string;
    date: string;
    daysLeft: number;
    }

    const renderDeadline = (deadline: Deadline): JSX.Element => (
    <View key={deadline.id} style={styles.deadlineCard}>
      <View style={styles.deadlineInfo}>
        <Text style={styles.deadlineTitle}>{deadline.title}</Text>
        <Text style={styles.deadlineDate}>{deadline.date}</Text>
      </View>
      <View style={styles.deadlineDays}>
        <Text style={styles.deadlineDaysNumber}>{deadline.daysLeft}</Text>
        <Text style={styles.deadlineDaysText}>days left</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName}!</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Welcome to KNUST Pathfinder</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>{quickActions.map(renderQuickAction)}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Announcements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {announcements.map(renderAnnouncement)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          {upcomingDeadlines.map(renderDeadline)}
        </View>

        <View style={styles.section}>
          <View style={styles.helpCard}>
            <MaterialIcons name="support-agent" size={48} color="#006633" />
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpDescription}>
              Our AI assistant is here to help you with any questions about KNUST applications.
            </Text>
            <TouchableOpacity style={styles.helpButton} onPress={() => navigation.navigate("Chat")}>
              <Text style={styles.helpButtonText}>Start Chat</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  seeAllText: {
    color: "#006633",
    fontSize: 14,
    fontWeight: "500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  quickActionDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  announcementType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeImportant: {
    backgroundColor: "#FEE2E2",
  },
  typeInfo: {
    backgroundColor: "#DBEAFE",
  },
  typeEvent: {
    backgroundColor: "#F0FDF4",
  },
  announcementTypeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
  announcementDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  announcementDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  deadlineCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  deadlineDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  deadlineDays: {
    alignItems: "center",
  },
  deadlineDaysNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#006633",
  },
  deadlineDaysText: {
    fontSize: 12,
    color: "#6B7280",
  },
  helpCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  helpButton: {
    backgroundColor: "#006633",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  helpButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default HomeScreen
