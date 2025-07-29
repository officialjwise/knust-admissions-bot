import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import axios from "axios"
import React, { JSX, useEffect, useState } from "react"
import {
    Alert,
    Dimensions,
    Linking,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import type { NavigationProp } from "../types/navigation"

const { width } = Dimensions.get("window")

const HomeScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [userName, setUserName] = useState("Student")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    fetchUserProfile()
    fetchAnnouncements()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchAnnouncements()
    setRefreshing(false)
  }

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/profile")
      if (response.data && response.data.name) {
        setUserName(response.data.name)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true)
    try {
      // In a real app, you would fetch from KNUST website API
      // For now, we'll use placeholder data that simulates fetched content
      const placeholderAnnouncements: Announcement[] = [
        {
          id: 1,
          title: "Call for Applications for KNUST Bursary for 2025/2026 Academic Year",
          description: "The deadline for 2025/2025 applications has been extended to March 31st, 2025.",
          type: "important",
          date: "2025-12-20",
          url: "https://www.knust.edu.gh/announcements/application-deadline-extended"
        },
        {
          id: 2,
          title: "New Engineering Programs",
          description: "KNUST introduces new specialized engineering programs for the upcoming academic year.",
          type: "info", 
          date: "2025-12-18",
          url: "https://www.knust.edu.gh/announcements/new-engineering-programs"
        },
        {
          id: 3,
          title: "Virtual Campus Tour",
          description: "Join our virtual campus tour every Saturday at 10:00 AM.",
          type: "event",
          date: "2025-12-15",
          url: "https://www.knust.edu.gh/announcements/virtual-campus-tour"
        },
      ]
      setAnnouncements(placeholderAnnouncements)
    } catch (error) {
      console.error("Error fetching announcements:", error)
      // Set fallback announcements on error
      setAnnouncements([
        {
          id: 1,
          title: "Welcome to KNUST Pathfinder",
          description: "Your comprehensive guide to KNUST admissions is ready to help!",
          type: "info",
          date: new Date().toISOString().split('T')[0],
        }
      ])
    } finally {
      setIsLoadingAnnouncements(false)
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
      title: "AI Assistant",
      description: "Get personalized guidance",
      icon: "smart-toy",
      color: "#006633",
      gradient: ["#006633", "#008844"],
      onPress: () => navigation.navigate("Chat"),
    },
    {
      id: 2,
      title: "Course Explorer",
      description: "Discover academic programs",
      icon: "school",
      color: "#1E40AF",
      gradient: ["#1E40AF", "#3B82F6"],
      onPress: () => navigation.navigate("CourseSelection"),
    },
    {
      id: 3,
      title: "Program Search",
      description: "Search & save programs",
      icon: "search",
      color: "#7C3AED",
      gradient: ["#7C3AED", "#A855F7"],
      onPress: () => navigation.navigate("ProgramSearch"),
    },
    {
      id: 4,
      title: "Saved Programs",
      description: "View bookmarked programs",
      icon: "bookmark",
      color: "#DC2626",
      gradient: ["#DC2626", "#EF4444"],
      onPress: () => navigation.navigate("SavedPrograms"),
    },
    {
      id: 5,
      title: "Help Center",
      description: "Common questions & answers",
      icon: "help-center",
      color: "#EA580C",
      gradient: ["#EA580C", "#F97316"],
      onPress: () => navigation.navigate("FAQ"),
    },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Application Submission",
      date: "2025-03-31",
      daysLeft: 90,
    },
  ]

  const handleReadMore = async (announcement: Announcement) => {
    if (announcement.url) {
      try {
        const supported = await Linking.canOpenURL(announcement.url)
        if (supported) {
          await Linking.openURL(announcement.url)
        } else {
          Alert.alert("Error", "Cannot open this link")
        }
      } catch (error) {
        console.error("Error opening URL:", error)
        Alert.alert("Error", "Failed to open the link")
      }
    } else {
      Alert.alert("Info", announcement.description)
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
    gradient?: string[];
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
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIconContainer, { backgroundColor: action.color }]}>
        <MaterialIcons 
          name={action.icon} 
          size={28} 
          color="#FFFFFF" 
        />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionDescription}>{action.description}</Text>
      </View>
      <View style={styles.quickActionArrow}>
        <MaterialIcons name="arrow-forward-ios" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  )

  interface Announcement {
    id: number;
    title: string;
    description: string;
    type: 'important' | 'info' | 'event';
    date: string;
    url?: string;
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
        <TouchableOpacity 
          style={styles.readMoreButton} 
          onPress={() => handleReadMore(announcement)}
        >
          <Text style={styles.readMoreText}>Read More</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#006633" />
        </TouchableOpacity>
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>

      {/* Modern Header with Profile Summary */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="account-circle" size={40} color="#FFFFFF" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Your journey to KNUST starts here</Text>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>90</Text>
            <Text style={styles.statLabel}>Days to deadline</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Programs viewed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Applications started</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View Profile</Text>
                <MaterialIcons name="arrow-forward-ios" size={12} color="#006633" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsContainer}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Latest Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>
            <TouchableOpacity>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <MaterialIcons name="arrow-forward-ios" size={12} color="#006633" />
              </View>
            </TouchableOpacity>
          </View>
          {announcements.map(renderAnnouncement)}
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Deadlines</Text>
          {upcomingDeadlines.map(renderDeadline)}
        </View>

        {/* AI Assistant Promotion */}
        <View style={styles.section}>
          <View style={styles.aiAssistantCard}>
            <View style={styles.aiAssistantHeader}>
              <View style={styles.aiIconContainer}>
                <MaterialIcons name="psychology" size={32} color="#006633" />
              </View>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiTitle}>AI Assistant</Text>
                <Text style={styles.aiSubtitle}>Get personalized guidance</Text>
              </View>
            </View>
            <Text style={styles.aiDescription}>
              Ask questions about admissions, programs, requirements, and get instant AI-powered answers tailored to your needs.
            </Text>
            <TouchableOpacity 
              style={styles.aiButton} 
              onPress={() => navigation.navigate("Chat")}
            >
              <MaterialIcons name="chat" size={18} color="#FFFFFF" />
              <Text style={styles.aiButtonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: "#006633",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#006633",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  quickActionArrow: {
    padding: 4,
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  announcementType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  announcementDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  readMoreText: {
    fontSize: 14,
    color: "#006633",
    fontWeight: "600",
    marginRight: 6,
  },
  deadlineCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deadlineDaysNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#006633",
  },
  deadlineDaysText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  aiAssistantCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiAssistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aiIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  aiDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 20,
  },
  aiButton: {
    backgroundColor: "#006633",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  aiButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomPadding: {
    height: 32,
  },
})

export default HomeScreen
