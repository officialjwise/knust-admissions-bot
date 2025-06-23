import React, { useState } from "react"
import type { ReactElement } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const samplePrograms = [
  {
    id: 1,
    name: "Computer Science",
    faculty: "Faculty of Computing and Information Systems",
    admissionChance: "High",
    duration: "4 years",
    type: "Regular",
    requirements: "A1-C6 in Math (Core & Elective), Physics, Chemistry",
    description: "Study software development, algorithms, and computer systems.",
  },
  {
    id: 2,
    name: "Electrical Engineering",
    faculty: "College of Engineering",
    admissionChance: "Medium",
    duration: "4 years",
    type: "Fee-Paying",
    requirements: "A1-C6 in Math (Core & Elective), Physics, Chemistry",
    description: "Design and develop electrical systems and devices.",
  },
  {
    id: 3,
    name: "Information Technology",
    faculty: "Faculty of Computing and Information Systems",
    admissionChance: "High",
    duration: "4 years",
    type: "Regular",
    requirements: "A1-C6 in Math (Core), Physics, Any other subject",
    description: "Focus on IT infrastructure, networks, and systems administration.",
  },
  {
    id: 4,
    name: "Applied Physics",
    faculty: "College of Science",
    admissionChance: "Medium",
    duration: "4 years",
    type: "Parallel",
    requirements: "A1-C6 in Math (Core & Elective), Physics, Chemistry",
    description: "Apply physics principles to solve real-world problems.",
  },
]

import type { StackScreenProps } from "@react-navigation/stack"

type RootStackParamList = {
  ProgramRecommendations: { course: string; results: Record<string, any> }
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

interface Program {
  id: number
  name: string
  faculty: string
  admissionChance: AdmissionChance
  duration: string
  type: ProgramType
  requirements: string
  description: string
}
type RenderProgramCard = (program: Program) => ReactElement

const ProgramRecommendationsScreen = ({ route, navigation }: Props) => {
  const { course, results } = route.params || { course: "", results: {} }
  const [savedRecommendations, setSavedRecommendations] = useState<number[]>([])

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
  // You can add more helper functions here if needed in the future.
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
    const recommendationsData = {
      course,
      results,
      programs: samplePrograms,
      timestamp: new Date().toISOString(),
    }

    try {
      const existingRecommendations = JSON.parse((await AsyncStorage.getItem("knust-saved-recommendations")) || "[]")
      existingRecommendations.push(recommendationsData)
      await AsyncStorage.setItem("knust-saved-recommendations", JSON.stringify(existingRecommendations))

      Alert.alert("Success", "Your program recommendations have been saved to your profile.")
    } catch (error) {
      Alert.alert("Error", "Failed to save recommendations.")
    }
  }

  const toggleSaveProgram = (programId: number) => {
    if (savedRecommendations.includes(programId)) {
      setSavedRecommendations((prev: number[]) => prev.filter((id) => id !== programId))
    } else {
      setSavedRecommendations((prev: number[]) => [...prev, programId])
    }
  }

  const renderProgramCard: RenderProgramCard = (program) => {
    const chanceStyle = getChanceColor(program.admissionChance)
    const typeStyle = getTypeColor(program.type)
    const isSaved = savedRecommendations.includes(program.id)

    return (
      <View key={program.id} style={styles.programCard}>
        <View style={styles.programHeader}>
          <View style={styles.programTitleContainer}>
            <Text style={styles.programName}>{program.name}</Text>
            <TouchableOpacity onPress={() => toggleSaveProgram(program.id)} style={styles.saveButton}>
              <MaterialIcons
                name={isSaved ? "bookmark" : "bookmark-border"}
                size={24}
                color={isSaved ? "#006633" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.programFaculty}>{program.faculty}</Text>
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
            <MaterialIcons name="schedule" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Duration: {program.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="assignment" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Requirements: {program.requirements}</Text>
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

      {/* Header */}
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
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="analytics" size={24} color="#006633" />
            <Text style={styles.summaryTitle}>Your Profile Summary</Text>
          </View>
          <Text style={styles.summaryText}>
            Based on your {course} background and WASSCE results, we've found {samplePrograms.length} programs that
            match your qualifications.
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{samplePrograms.filter((p) => p.admissionChance === "High").length}</Text>
              <Text style={styles.statLabel}>High Chance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {samplePrograms.filter((p) => p.admissionChance === "Medium").length}
              </Text>
              <Text style={styles.statLabel}>Medium Chance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{samplePrograms.filter((p) => p.type === "Regular").length}</Text>
              <Text style={styles.statLabel}>Regular Stream</Text>
            </View>
          </View>
        </View>

        {/* Filter Options */}
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

        {/* Programs List */}
        <View style={styles.programsList}>{samplePrograms.map(renderProgramCard)}</View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Chat")}>
            <Text style={styles.primaryButtonText}>Discuss with AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View All KNUST Programs</Text>
          </TouchableOpacity>
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
  saveButton: {
    padding: 4,
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
})

export default ProgramRecommendationsScreen
