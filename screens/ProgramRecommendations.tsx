import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { StackScreenProps } from "@react-navigation/stack"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"
import type { ReactElement } from "react"
import React, { useEffect, useState } from "react"
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

type RootStackParamList = {
  ProgramRecommendations: { course: string; results: Record<string, string>; gender?: string }
  Chat: undefined
}

type Props = StackScreenProps<RootStackParamList, "ProgramRecommendations">

interface ChanceColor {
  backgroundColor: string
  color: string
}

type AdmissionChance = "High" | "Medium" | "Low" | string

interface TypeColor {
  backgroundColor: string
  color: string
}

type ProgramType = "Regular" | "Fee-Paying" | "Parallel" | string

interface ElectiveRequirement {
  type: string;
  subject?: string;
  options?: string[];
  note?: string;
}

interface Program {
  docId: string;
  name: string
  college: string
  admissionChance: AdmissionChance
  type: ProgramType
  requirements: string
  description: string
  fees: string
}

interface RecommendationResponse {
  aggregate: number
  recommendations: {
    name: string
    college: string
    coreRequirements: string[]
    electiveRequirements: string[]
    cutoff: number
    cutoffSource: string
    fees: { regular_freshers: number; fee_paying_freshers: number; residential_freshers: number }
  }[]
  warnings: string[]
}

const ProgramRecommendationsScreen = ({ route, navigation }: Props) => {
  const { course, results, gender = "male" } = route.params || { course: "", results: {}, gender: "male" }
  const [recommendations, setRecommendations] = useState<Program[]>([])
  const [aggregateScore, setAggregateScore] = useState<number | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || "https://knust-chat-bot-backend.onrender.com"

  useEffect(() => {
    fetchRecommendations()
  }, [])

  // Copy of getValidIdToken from ProfileScreen
  const FIREBASE_API_KEY = "AIzaSyBa3Ht1TcWCrUSsN5o3mGhGTVPjjz-8KJU";
  const getValidIdToken = async () => {
    let idToken = await SecureStore.getItemAsync("idToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (!idToken || !refreshToken) return null;
    try {
      // Test request to profile endpoint
      const testResp = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (testResp.ok) return idToken;
    } catch (error) {
      // Ignore, will try refresh
    }
    // Try to refresh token
    try {
      const firebaseResp = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        }
      );
      const firebaseData = await firebaseResp.json();
      if (firebaseData.id_token) {
        await SecureStore.setItemAsync("idToken", firebaseData.id_token);
        await SecureStore.setItemAsync("refreshToken", firebaseData.refresh_token);
        return firebaseData.id_token;
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      return null;
    }
    return null;
  }

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const idToken = await getValidIdToken();
      if (!idToken) {
        throw new Error("No authentication token found. Please sign in again.");
      }

      const requestBody = {
        grades: {
          english: results["English Language"] || "",
          math: results["Mathematics (Core)"] || "",
          integratedScience: results["Integrated Science"] || "",
          socialStudies: results["Social Studies"] || "",
          electives: Object.keys(results)
            .filter(
              (subject) =>
                !["English Language", "Mathematics (Core)", "Integrated Science", "Social Studies"].includes(subject)
            )
            .map((subject) => ({
              subject,
              grade: results[subject],
            })),
        },
        gender,
      }

      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error("Authentication failed. Please sign in again.")
        } else if (response.status === 400) {
          throw new Error(errorData.error || "Invalid grades format.")
        } else {
          throw new Error(errorData.error || `Failed to fetch recommendations: ${response.status}`)
        }
      }

      const data: RecommendationResponse = await response.json()
      console.log("API Response:", JSON.stringify(data, null, 2))

      // Map requirements and fees properly
      const programs: Program[] = data.recommendations.map((rec, index) => {
        let programType: ProgramType = "Regular"
        if (rec.name.includes("(Fee-Paying Only)")) {
          programType = "Fee-Paying"
        } else if (rec.name.includes("(Parallel)")) {
          programType = "Parallel"
        }
        // Format requirements
        let requirements = "";
        if (Array.isArray(rec.coreRequirements)) {
          requirements += rec.coreRequirements.join(", ");
        } else if (typeof rec.coreRequirements === "string") {
          requirements += rec.coreRequirements;
        }
        if (Array.isArray(rec.electiveRequirements)) {
          requirements += ", " + rec.electiveRequirements.map((er: string | ElectiveRequirement) => {
            if (typeof er === "string") return er;
            if (er.type === "required") return er.subject;
            if (er.type === "choice") return er.note ? er.note : er.options?.join(" or ");
            return JSON.stringify(er);
          }).join(", ");
        } else if (typeof rec.electiveRequirements === "string") {
          requirements += ", " + rec.electiveRequirements;
        }
        // Format fees
        let fees = "";
        if (rec.fees) {
          fees = `Regular: GH¢${rec.fees.regular_freshers}, Fee-Paying: GH¢${rec.fees.fee_paying_freshers}, Residential: GH¢${rec.fees.residential_freshers}`;
        }
        return {
          docId: `${rec.name}-${index}`,
          name: rec.name.replace(/\(.*?\)/g, "").trim(),
          college: rec.college,
          admissionChance: calculateAdmissionChance(rec.cutoff, data.aggregate),
          type: programType,
          requirements,
          description: `Study at ${rec.college}.`,
          fees,
        }
      })

      setRecommendations(programs)
      setAggregateScore(data.aggregate)
      setWarnings(data.warnings)
    } catch (error: any) {
      console.error("Error fetching recommendations:", error)
      Alert.alert(
        "Error",
        error.message || "Failed to load recommendations. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => fetchRecommendations(),
          },
          {
            text: "Go to Chat",
            onPress: () => navigation.navigate("Chat"),
          },
        ]
      )
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAdmissionChance = (cutoff: number, aggregate: number): AdmissionChance => {
    if (isNaN(cutoff)) return "Unknown"
    if (aggregate <= cutoff) return "High"
    if (aggregate <= cutoff + 5) return "Medium"
    return "Low"
  }

  const getChanceColor = (chance: AdmissionChance): ChanceColor => {
    switch (chance) {
      case "High":
        return { backgroundColor: "#DCFCE7", color: "#15803D" }
      case "Medium":
        return { backgroundColor: "#FEF9C3", color: "#CA8A04" }
      case "Low":
        return { backgroundColor: "#FEE2E2", color: "#DC2626" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#4B5563" }
    }
  }

  const getTypeColor = (type: ProgramType): TypeColor => {
    switch (type) {
      case "Regular":
        return { backgroundColor: "#DBEAFE", color: "#2563EB" }
      case "Fee-Paying":
        return { backgroundColor: "#F3E8FF", color: "#7C3AED" }
      case "Parallel":
        return { backgroundColor: "#FFEDD5", color: "#EA580C" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#4B5563" }
    }
  }

  const saveRecommendations = async () => {
    try {
      let idToken: string | null = null;
      try {
        idToken = await SecureStore.getItemAsync("idToken");
      } catch (error) {
        idToken = await AsyncStorage.getItem("idToken");
      }

      if (!idToken) {
        Alert.alert("Error", "Please sign in again to save programs.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
        return;
      }

      // Save all recommended programs
      const savePromises = recommendations.map(program =>
        fetch(`${API_BASE_URL}/saved-programs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            programName: program.name
          }),
        })
      );

      await Promise.all(savePromises);
      Alert.alert("Success", "All recommended programs have been saved to your bookmarks.");
    } catch (error) {
      console.error("Error saving programs:", error);
      Alert.alert("Error", "Failed to save programs. Please try again.");
    }
  };

  const saveProgram = async (programName: string) => {
    try {
      let idToken: string | null = null;
      try {
        idToken = await SecureStore.getItemAsync("idToken");
      } catch (error) {
        idToken = await AsyncStorage.getItem("idToken");
      }

      if (!idToken) {
        Alert.alert("Error", "Please sign in again to save programs.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/saved-programs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programName: programName
        }),
      });

      if (response.status === 401 || response.status === 403) {
        Alert.alert("Session Expired", "Please sign in again.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      Alert.alert("Success", `${programName} has been saved to your bookmarks.`);
    } catch (error) {
      console.error("Error saving program:", error);
      Alert.alert("Error", "Failed to save program. Please try again.");
    }
  };

  const toggleSaveProgram = async (docId: string, programName: string) => {
    if (savedRecommendations.includes(docId)) {
      // Remove from local state (we don't have delete endpoint in this context)
      setSavedRecommendations((prev) => prev.filter((id) => id !== docId));
    } else {
      // Save the program
      await saveProgram(programName);
      setSavedRecommendations((prev) => [...prev, docId]);
    }
  };

  const renderProgramCard: (program: Program) => ReactElement = (program) => {
    const chanceStyle = getChanceColor(program.admissionChance)
    const typeStyle = getTypeColor(program.type)
    // Removed bookmark icon and save button
    return (
      <View key={program.docId} style={styles.programCard}>
        <View style={styles.programHeader}>
          <View style={styles.programTitleContainer}>
            <Text style={styles.programName}>{program.name}</Text>
          </View>
          <Text style={styles.programFaculty}>{program.college}</Text>
        </View>
        <View style={styles.programBadges}>
          <View style={[styles.badge, chanceStyle]}>
            <Text style={[styles.badgeText, { color: chanceStyle.color }]}>{program.admissionChance} Chance</Text>
          </View>
          <View style={[styles.badge, typeStyle]}>
            <Text style={[styles.badgeText, { color: typeStyle.color }]}>{program.type}</Text>
          </View>
        </View>
        <Text style={styles.programDescription}>{program.description}</Text>
        <View style={styles.programDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="assignment" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Requirements: {program.requirements}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Fees: {program.fees}</Text>
          </View>
        </View>
        <View style={styles.programActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="info" size={16} color="#006633" />
            <Text style={styles.actionButtonText}>More Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="compare" size={16} color="#006633" />
            <Text style={styles.actionButtonText}>Compare</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Program Recommendations</Text>
          <Text style={styles.headerSubtitle}>Based on your {course} background</Text>
        </View>
        <TouchableOpacity onPress={saveRecommendations} style={styles.saveAllButton}>
          <MaterialIcons name="save" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recommendations...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="analytics" size={24} color="#006633" />
                <Text style={styles.summaryTitle}>Your Profile Summary</Text>
              </View>
              <Text style={styles.summaryText}>
                Based on your {course} background and WASSCE results, we've found {recommendations.length} programs
                that match your qualifications.{" "}
                {aggregateScore !== null && `Your aggregate score is ${aggregateScore}.`}
              </Text>
              {warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  <Text style={styles.warningsTitle}>Warnings:</Text>
                  {warnings.map((warning, index) => (
                    <Text key={index} style={styles.warningText}>
                      - {warning}
                    </Text>
                  ))}
                </View>
              )}
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {recommendations.filter((p) => p.admissionChance === "High").length}
                  </Text>
                  <Text style={styles.statLabel}>High Chance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {recommendations.filter((p) => p.admissionChance === "Medium").length}
                  </Text>
                  <Text style={styles.statLabel}>Medium Chance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {recommendations.filter((p) => p.type === "Regular").length}
                  </Text>
                  <Text style={styles.statLabel}>Regular Stream</Text>
                </View>
              </View>
            </View>

            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Filter by:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={styles.filterChip}>
                  <Text style={styles.filterChipText}>All Programs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                  <Text style={styles.filterChipText}>High Chance</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Regular Stream</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Engineering</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.programsList}>
              {recommendations.length > 0 ? (
                recommendations.map(renderProgramCard)
              ) : (
                <Text style={styles.noProgramsText}>No programs found matching your criteria.</Text>
              )}
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Chat")}>
                <Text style={styles.primaryButtonText}>Discuss with AI Assistant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>View All KNUST Programs</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#DCFCE7",
    fontSize: 14,
  },
  saveAllButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 12,
  },
  summaryText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  warningsContainer: {
    marginBottom: 16,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#006633",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  programsList: {
    marginBottom: 24,
  },
  programCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  programHeader: {
    marginBottom: 12,
  },
  programTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  programName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  programFaculty: {
    fontSize: 14,
    color: "#6B7280",
  },
  programBadges: {
    flexDirection: "row",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  programDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  programDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  programActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#006633",
    fontWeight: "500",
    marginLeft: 4,
  },
  actionContainer: {
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#006633",
    fontSize: 16,
    fontWeight: "600",
  },
  noProgramsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 20,
  },
})

export default ProgramRecommendationsScreen