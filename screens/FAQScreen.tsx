import * as React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import * as SecureStore from "expo-secure-store"

import type { StackNavigationProp } from "@react-navigation/stack"

type FAQScreenProps = {
  navigation: StackNavigationProp<any>
}

const FAQScreen = ({ navigation }: FAQScreenProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({})
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  interface ExpandedItems {
    [id: number]: boolean
  }

  // Fetch FAQs from API on component mount
  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true)
      setError(null)

      const token = await SecureStore.getItemAsync("idToken")
      if (!token) {
        setError("Authentication error: No token found. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("https://knust-chat-bot-backend.onrender.com/faqs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 401) {
            throw new Error("Authentication failed: Please log in again.")
          }
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const apiFaqs = await response.json()
        // Map API data to match FAQItem interface, assigning categories based on content
        const mappedFaqs: FAQItem[] = apiFaqs.map((faq: any, index: number) => {
          let category = "admission" // Default category
          const questionLower = faq.question.toLowerCase()
          const answerLower = faq.answer.toLowerCase()
          if (questionLower.includes("fee") || questionLower.includes("payment") || answerLower.includes("fee")) {
            category = "fees"
          } else if (
            questionLower.includes("program") ||
            questionLower.includes("course") ||
            answerLower.includes("program")
          ) {
            category = "programs"
          } else if (
            questionLower.includes("campus") ||
            questionLower.includes("accommodation") ||
            answerLower.includes("campus")
          ) {
            category = "campus"
          }
          return {
            id: parseInt(faq.id, 10) || index + 1, 
            category,
            question: faq.question,
            answer: faq.answer,
          }
        })
        setFaqs(mappedFaqs)
      } catch (err: any) {
        console.error("Error fetching FAQs:", err)
        setError(
          err.message === "Authentication failed: Please log in again."
            ? "Authentication error: Please log in again or contact support."
            : "Failed to load FAQs. Please try again later."
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev: ExpandedItems) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filterByCategory = (categoryId: string): FAQItem[] => {
    return filteredFAQs.filter((faq: FAQItem) => faq.category === categoryId)
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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading FAQs...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true)
                setError(null)
                // Trigger re-fetch by resetting faqs and calling useEffect again
                setFaqs([])
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#006633",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default FAQScreen