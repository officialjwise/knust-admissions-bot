import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const courses = [
  {
    id: "general-science",
    name: "General Science",
    description: "Mathematics, Physics, Chemistry, Biology",
    tooltip:
      "General Science includes Core Mathematics, Elective Mathematics, Physics, Chemistry, and Biology. Perfect for students interested in engineering, medicine, and natural sciences.",
    icon: "🧪",
  },
  {
    id: "business",
    name: "Business",
    description: "Accounting, Economics, Business Management",
    tooltip:
      "Business programme covers Economics, Accounting, Business Management, and Mathematics. Ideal for future business leaders, accountants, and economists.",
    icon: "💼",
  },
  {
    id: "general-arts",
    name: "General Arts",
    description: "Literature, History, Geography, Languages",
    tooltip:
      "General Arts includes Literature in English, History, Geography, Government, Economics, and Languages. Great for law, journalism, and social sciences.",
    icon: "📚",
  },
  {
    id: "visual-arts",
    name: "Visual Arts",
    description: "Fine Art, Graphic Design, Textiles",
    tooltip:
      "Visual Arts covers Fine Art, Graphic Design, Textiles, Sculpture, and Ceramics. Perfect for creative students pursuing design and artistic careers.",
    icon: "🎨",
  },
  {
    id: "home-economics",
    name: "Home Economics",
    description: "Food & Nutrition, Clothing & Textiles",
    tooltip:
      "Home Economics includes Food and Nutrition, Clothing and Textiles, and Management in Living. Ideal for nutrition, hospitality, and family studies.",
    icon: "🏠",
  },
  {
    id: "agricultural-science",
    name: "Agricultural Science",
    description: "Animal Husbandry, Crop Science",
    tooltip:
      "Agricultural Science covers Animal Husbandry, Crop Science, and Agricultural Economics. Perfect for future farmers, veterinarians, and agricultural specialists.",
    icon: "🌾",
  },
]

import type { StackNavigationProp } from '@react-navigation/stack'

type RootStackParamList = {
  WassceInput: { selectedCourse: string }
  Chat: undefined
  // Add other routes here if needed
}

type CourseSelectionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'WassceInput'>
}

const CourseSelectionScreen = ({ navigation }: CourseSelectionScreenProps) => {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId)
  }

  const showTooltip = (tooltip: string) => {
    setModalContent(tooltip)
    setModalVisible(true)
  }

  const handleContinue = () => {
    if (selectedCourse) {
      navigation.navigate("WassceInput", { selectedCourse })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Select Your SHS Course</Text>
          <Text style={styles.headerSubtitle}>Choose your Senior High School programme</Text>
        </View>
        <Text style={styles.headerStep}>Step 1 of 3</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses found matching "{searchTerm}"</Text>
          </View>
        ) : (
          filteredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.courseCard,
                selectedCourse === course.id ? styles.selectedCourseCard : styles.unselectedCourseCard,
              ]}
              onPress={() => handleCourseSelect(course.id)}
            >
              <View style={styles.courseContent}>
                <Text style={styles.courseIcon}>{course.icon}</Text>
                <View style={styles.courseInfo}>
                  <View style={styles.courseTitleContainer}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <TouchableOpacity onPress={() => showTooltip(course.tooltip)}>
                      <MaterialIcons name="info-outline" size={16} color="#6B7280" style={styles.infoIcon} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.courseDescription}>{course.description}</Text>
                </View>
                {selectedCourse === course.id && (
                  <View style={styles.checkContainer}>
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalContent}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedCourse && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedCourse}
        >
          <Text style={styles.continueButtonText}>Continue to WASSCE Results</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate("Chat")}>
          <Text style={styles.skipButtonText}>Skip - Just Chat</Text>
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
  headerStep: {
    color: "#DCFCE7",
    fontSize: 14,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: "relative",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: "#1F2937",
  },
  searchIcon: {
    position: "absolute",
    left: 28,
    top: 28,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  courseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  selectedCourseCard: {
    borderColor: "#15803D",
    backgroundColor: "#DCFCE7",
  },
  unselectedCourseCard: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  courseContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  infoIcon: {
    marginLeft: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  checkContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#15803D",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 320,
  },
  modalText: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: "#006633",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  actionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    backgroundColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  skipButton: {
    borderWidth: 1,
    borderColor: "#15803D",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  skipButtonText: {
    color: "#15803D",
    fontSize: 18,
    fontWeight: "600",
  },
})

export default CourseSelectionScreen
