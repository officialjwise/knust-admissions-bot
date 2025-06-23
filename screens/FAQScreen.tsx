import * as React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

import type { StackNavigationProp } from "@react-navigation/stack"

type FAQScreenProps = {
  navigation: StackNavigationProp<any>
}

const FAQScreen = ({ navigation }: FAQScreenProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({})

  const faqCategories: FAQCategory[] = [
    {
      id: "admission",
      title: "Admission Process",
      icon: "school",
      color: "#006633",
    },
    {
      id: "fees",
      title: "Fees & Payment",
      icon: "payment",
      color: "#FFC107",
    },
    {
      id: "programs",
      title: "Academic Programs",
      icon: "book",
      color: "#FF6B35",
    },
    {
      id: "campus",
      title: "Campus Life",
      icon: "location-city",
      color: "#8B5CF6",
    },
  ]

  const faqData = [
    {
      id: 1,
      category: "admission",
      question: "What are the admission requirements for KNUST?",
      answer:
        "General admission requirements include:\n\n• WASSCE certificate with at least 6 subjects\n• Core subjects: English Language (A1-C6), Mathematics (A1-C6), Integrated Science (A1-C6), Social Studies (A1-C6)\n• Three elective subjects relevant to your chosen program\n• Aggregate score between 6-36 depending on the program\n• Some programs may require additional entrance exams",
    },
    {
      id: 2,
      category: "admission",
      question: "When is the application deadline?",
      answer:
        "The application deadline for the 2024/2025 academic year has been extended to March 31st, 2025. Late applications may be considered on a case-by-case basis, but it's recommended to apply before the deadline.",
    },
    {
      id: 3,
      category: "admission",
      question: "How do I apply to KNUST?",
      answer:
        "You can apply to KNUST through:\n\n1. Online application portal (recommended)\n2. Purchase application forms from KNUST campus\n3. Authorized vendors nationwide\n\nThe online application process includes:\n• Creating an account\n• Filling the application form\n• Uploading required documents\n• Paying the application fee\n• Submitting the application",
    },
    {
      id: 4,
      category: "fees",
      question: "What are the tuition fees at KNUST?",
      answer:
        "KNUST tuition fees vary by program and stream:\n\n• Regular stream: GHS 2,500 - 4,000 per year\n• Fee-paying stream: GHS 8,000 - 15,000 per year\n• Parallel stream: GHS 12,000 - 20,000 per year\n\nAdditional costs include:\n• Accommodation fees\n• Meal plans\n• Registration fees\n• Laboratory fees (for science programs)\n• Field trip costs",
    },
    {
      id: 5,
      category: "fees",
      question: "Are there scholarship opportunities?",
      answer:
        "Yes, KNUST offers various scholarship opportunities:\n\n• Merit-based scholarships for top performers\n• Need-based financial aid\n• Government scholarships (GETFUND)\n• Corporate sponsorships\n• International scholarships\n• Sports scholarships\n\nContact the Financial Aid Office for more information and application procedures.",
    },
    {
      id: 6,
      category: "programs",
      question: "What programs does KNUST offer?",
      answer:
        "KNUST offers undergraduate and postgraduate programs across six colleges:\n\n• College of Engineering\n• College of Science\n• College of Agriculture and Natural Resources\n• College of Architecture and Planning\n• College of Health Sciences\n• College of Humanities and Social Sciences\n\nPrograms include Engineering, Medicine, Agriculture, Business, Arts, and many more.",
    },
    {
      id: 7,
      category: "programs",
      question: "Can I change my program after admission?",
      answer:
        "Yes, you may be able to change your program under certain conditions:\n\n• Must meet the admission requirements for the new program\n• Change request must be made within the first semester\n• Subject to availability of space in the desired program\n• May require additional documentation\n• Some programs may require entrance exams\n\nContact the Academic Affairs Office for the change of program procedure.",
    },
    {
      id: 8,
      category: "campus",
      question: "Is accommodation available on campus?",
      answer:
        "Yes, KNUST provides on-campus accommodation in various halls of residence:\n\n• Traditional halls (Unity Hall, University Hall, etc.)\n• New hostels with modern facilities\n• Both male and female halls available\n• Room allocation is competitive\n\nFactors considered for allocation:\n• Academic performance\n• Distance from home\n• Special needs\n• Year of study\n\nOff-campus accommodation is also available in nearby communities.",
    },
    {
      id: 9,
      category: "campus",
      question: "What facilities are available on campus?",
      answer:
        "KNUST campus offers comprehensive facilities:\n\n• Modern lecture halls and laboratories\n• Central and departmental libraries\n• Sports complex and gymnasium\n• Health center and clinic\n• Banking services\n• Restaurants and cafeterias\n• Shopping centers\n• Transportation services\n• Internet and Wi-Fi access\n• Recreation centers",
    },
    {
      id: 10,
      category: "campus",
      question: "What student organizations can I join?",
      answer:
        "KNUST has numerous student organizations:\n\n• Student Representative Council (SRC)\n• Hall committees\n• Academic and professional societies\n• Religious organizations\n• Sports clubs and teams\n• Cultural groups\n• Volunteer organizations\n• Debate societies\n• Drama and music groups\n\nThese organizations provide opportunities for leadership, networking, and personal development.",
    },
  ]

  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  interface ExpandedItems {
    [id: number]: boolean
  }

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev: ExpandedItems) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  interface FAQCategory {
    id: string
    title: string
    icon: keyof typeof MaterialIcons.glyphMap
    color: string
  }

  interface FAQItem {
    id: number
    category: string
    question: string
    answer: string
  }

  const filterByCategory = (categoryId: string): FAQItem[] => {
    return filteredFAQs.filter((faq: FAQItem) => faq.category === categoryId)
  }

  interface RenderCategoryCardProps {
    category: FAQCategory
  }
  interface RenderCategoryCardProps {
    category: FAQCategory
  }

  const renderCategoryCard = (category: FAQCategory): React.ReactElement => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, { backgroundColor: category.color }]}
      onPress={() => {
        const categoryFAQs = filterByCategory(category.id)
        if (categoryFAQs.length > 0) {
          // You could implement scrolling to specific section here
        }
      }}
    >
      <MaterialIcons name={category.icon} size={32} color="#FFFFFF" />
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <Text style={styles.categoryCount}>{filterByCategory(category.id).length} questions</Text>
    </TouchableOpacity>
  )

  interface RenderFAQItemProps {
    faq: FAQItem
  }

  const renderFAQItem = (faq: FAQItem): React.ReactElement => {
    const isExpanded = expandedItems[faq.id]
    const category = faqCategories.find((cat) => cat.id === faq.category)

    return (
      <View key={faq.id} style={styles.faqItem}>
        <TouchableOpacity style={styles.faqHeader} onPress={() => toggleExpanded(faq.id)}>
          <View style={styles.faqHeaderContent}>
            <View style={[styles.categoryIndicator, { backgroundColor: category?.color }]} />
            <Text style={styles.faqQuestion}>{faq.question}</Text>
          </View>
          <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={24} color="#6B7280" />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
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
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="clear" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {searchQuery === "" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <View style={styles.categoriesGrid}>{faqCategories.map(renderCategoryCard)}</View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredFAQs.length})` : "All Questions"}
          </Text>

          {filteredFAQs.length === 0 ? (
            <View style={styles.noResults}>
              <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
              <Text style={styles.noResultsText}>No questions found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search terms or browse by category</Text>
            </View>
          ) : (
            <View style={styles.faqList}>{filteredFAQs.map(renderFAQItem)}</View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.supportCard}>
            <MaterialIcons name="support-agent" size={48} color="#006633" />
            <Text style={styles.supportTitle}>Still have questions?</Text>
            <Text style={styles.supportDescription}>
              Can't find what you're looking for? Our AI assistant is here to help with personalized answers.
            </Text>
            <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate("Chat")}>
              <Text style={styles.supportButtonText}>Chat with Assistant</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  categoryCount: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  supportCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: "#006633",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default FAQScreen
