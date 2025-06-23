import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MaterialIcons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NavigationProp, ScreenRouteProp } from "../types/navigation"

type CourseKey =
  | "general-science"
  | "business"
  | "general-arts"
  | "visual-arts"
  | "home-economics"
  | "agricultural-science"

type WassceInputScreenProps = {}

const WassceInputScreen: React.FC<WassceInputScreenProps> = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<ScreenRouteProp<"WassceInput">>()
  const { selectedCourse = "general-science" } = route.params || {}

  const [results, setResults] = useState<{ [key: string]: string }>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const coreSubjects = ["Mathematics (Core)", "English Language", "Integrated Science", "Social Studies"]

  const courseSubjects: { [key in CourseKey]: string[] } = {
    "general-science": ["Physics", "Chemistry", "Biology", "Elective Mathematics"],
    business: ["Economics", "Accounting", "Business Management", "Elective Mathematics"],
    "general-arts": ["History", "Geography", "Literature in English", "Government", "Economics", "French"],
    "visual-arts": [
      "Graphic Design",
      "Picture Making",
      "Sculpture",
      "Textiles",
      "Ceramics",
      "General Knowledge in Art",
    ],
    "home-economics": [
      "Food and Nutrition",
      "Clothing and Textiles",
      "Management in Living",
      "General Knowledge in Home Economics",
    ],
    "agricultural-science": ["Animal Husbandry", "Crop Husbandry", "General Agriculture", "Agricultural Economics"],
  }

  const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"]

  useEffect(() => {
    loadSavedResults()
  }, [selectedCourse])

  useEffect(() => {
    if (Object.keys(results).length > 0) {
      saveResults()
    }
  }, [results, selectedCourse])

  const loadSavedResults = async () => {
    try {
      const saveKey = `knust-wassce-${selectedCourse}`
      const saved = await AsyncStorage.getItem(saveKey)
      if (saved) {
        const savedResults = JSON.parse(saved)
        setResults(savedResults)
      }
    } catch (error) {
      console.error("Failed to load saved results:", error)
    }
  }

  const saveResults = async () => {
    try {
      const saveKey = `knust-wassce-${selectedCourse}`
      await AsyncStorage.setItem(saveKey, JSON.stringify(results))
    } catch (error) {
      console.error("Failed to save results:", error)
    }
  }

  const handleGradeChange = (subject: string, grade: string) => {
    setResults((prev) => ({
      ...prev,
      [subject]: grade,
    }))
  }

  const clearForm = () => {
    Alert.alert("Clear Form", "Are you sure you want to clear all entered grades?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setResults({})
          const saveKey = `knust-wassce-${selectedCourse}`
          await AsyncStorage.removeItem(saveKey)
        },
      },
    ])
  }

  const getSubjectsForCourse = (): string[] => {
    const electiveSubjects = courseSubjects[selectedCourse as CourseKey] || []
    return [...coreSubjects, ...electiveSubjects]
  }

  const hasValidResults = Object.keys(results).length >= 6

  const getCourseName = (): string => {
    const courseNames: { [key in CourseKey]: string } = {
      "general-science": "General Science",
      business: "Business",
      "general-arts": "General Arts",
      "visual-arts": "Visual Arts",
      "home-economics": "Home Economics",
      "agricultural-science": "Agricultural Science",
    }
    return courseNames[selectedCourse as CourseKey] || "your course"
  }

  const handleGetRecommendations = () => {
    if (!hasValidResults) {
      Alert.alert(
        "Incomplete Results",
        "Please enter at least 6 subjects including core subjects for personalized recommendations.",
        [{ text: "OK" }],
      )
      return
    }

    navigation.navigate("ProgramRecommendations", {
      course: selectedCourse,
      results: results,
    })
  }

  const handleSkipToChat = () => {
    navigation.navigate("Chat")
  }

  const renderGradeSelector = (subject: string, isCore = false) => {
    return (
      <View key={subject} style={[styles.subjectCard, isCore && styles.coreSubjectCard]}>
        <View style={styles.subjectRow}>
          <View style={styles.subjectInfo}>
            <Text style={styles.subjectName}>{subject}</Text>
            {isCore && <View style={styles.coreIndicator} />}
          </View>

          <View style={styles.gradeSelector}>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
              <Text style={[styles.dropdownButtonText, !results[subject] && styles.placeholderText]}>
                {results[subject] || "Select Grade"}
              </Text>
              <MaterialIcons
                name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {grades.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[styles.dropdownItem, results[subject] === grade && styles.selectedDropdownItem]}
                      onPress={() => {
                        handleGradeChange(subject, grade)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <Text
                        style={[styles.dropdownItemText, results[subject] === grade && styles.selectedDropdownItemText]}
                      >
                        {grade}
                      </Text>
                      {results[subject] === grade && <MaterialIcons name="check" size={16} color="#006633" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>WASSCE Results</Text>
          <Text style={styles.headerSubtitle}>Enter your {getCourseName()} grades</Text>
        </View>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 2 of 3</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionsContent}>
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>
              <Text style={styles.optionalText}>Optional: </Text>
              Enter at least 6 subjects including core subjects for personalized program recommendations.
            </Text>
            <Text style={styles.instructionsSubtext}>Showing subjects relevant to {getCourseName()}</Text>
          </View>
          <TouchableOpacity onPress={clearForm} style={styles.clearButton}>
            <MaterialIcons name="refresh" size={16} color="#D97706" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Core Subjects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CORE SUBJECTS</Text>
          <View style={styles.subjectsContainer}>
            {coreSubjects.map((subject) => renderGradeSelector(subject, true))}
          </View>
        </View>

        {/* Elective Subjects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ELECTIVE SUBJECTS</Text>
          <View style={styles.subjectsContainer}>
            {courseSubjects[selectedCourse as CourseKey]?.length > 0 ? (
              courseSubjects[selectedCourse as CourseKey].map((subject) => renderGradeSelector(subject, false))
            ) : (
              <View style={styles.noElectivesContainer}>
                <Text style={styles.noElectivesText}>No elective subjects defined for this course</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {Object.keys(results).length} of {getSubjectsForCourse().length} subjects entered
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(Object.keys(results).length / getSubjectsForCourse().length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          onPress={handleGetRecommendations}
          style={[styles.primaryButton, !hasValidResults && styles.disabledButton]}
          disabled={!hasValidResults}
        >
          <Text style={[styles.primaryButtonText, !hasValidResults && styles.disabledButtonText]}>
            Get Recommendations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkipToChat} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Skip - General Chat</Text>
        </TouchableOpacity>
      </View>
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  stepIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  instructionsContainer: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  instructionsText: {
    flex: 1,
    marginRight: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  optionalText: {
    fontWeight: "bold",
  },
  instructionsSubtext: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 4,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  clearButtonText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subjectsContainer: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  coreSubjectCard: {
    borderColor: "#10B981",
    borderWidth: 2,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  coreIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 8,
  },
  gradeSelector: {
    width: 120,
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  dropdownMenu: {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedDropdownItem: {
    backgroundColor: "#F0FDF4",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1F2937",
  },
  selectedDropdownItemText: {
    color: "#006633",
    fontWeight: "500",
  },
  noElectivesContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  noElectivesText: {
    color: "#6B7280",
    fontSize: 14,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#006633",
    borderRadius: 2,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  primaryButton: {
    backgroundColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#D1D5DB",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#006633",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default WassceInputScreen
