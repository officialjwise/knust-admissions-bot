import { MaterialIcons } from "@expo/vector-icons"
import * as SecureStore from "expo-secure-store"
import { useEffect, useRef, useState } from "react"
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { MarkdownText } from "../components/MarkdownText"

import type { StackNavigationProp } from "@react-navigation/stack"

type ChatScreenProps = {
  navigation: StackNavigationProp<any>
}

const ChatScreen = ({ navigation }: ChatScreenProps) => {
  type Message = {
    id: string
    text: string
    sender: "user" | "bot"
    timestamp: Date
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your KNUST application assistant. How can I help you today? You can ask me about:\n\n• Application deadlines\n• Program requirements\n• Tuition fees\n• Campus life\n• Admission processes",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView | null>(null)

  const quickQuestions = [
    "Application deadlines",
    "Tuition fees",
    "Program requirements",
    "How to apply",
    "Campus accommodation",
    "Academic calendar",
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const token = await SecureStore.getItemAsync("idToken")
    if (!token) {
      // Clear all stored tokens and navigate to login
      await SecureStore.deleteItemAsync("idToken").catch(() => {})
      await SecureStore.deleteItemAsync("refreshToken").catch(() => {})
      await SecureStore.deleteItemAsync("userEmail").catch(() => {})
      await SecureStore.deleteItemAsync("userUid").catch(() => {})
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }]
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }
    const message = text.trim()
    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    try {
      console.log("Sending this message:", message, "Token:", token)
      const response = await fetch("https://knust-chat-bot-backend.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message,
          sender: "user",
        }),
      })
      console.log("Response:", response)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid, clear storage and redirect to login
          await SecureStore.deleteItemAsync("idToken").catch(() => {})
          await SecureStore.deleteItemAsync("refreshToken").catch(() => {})
          await SecureStore.deleteItemAsync("userEmail").catch(() => {})
          await SecureStore.deleteItemAsync("userUid").catch(() => {})
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }]
          })
          return
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (error: any) {
      console.error("Error fetching bot response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          error.message === "Access denied: Invalid or insufficient token permissions."
            ? "Authentication error: Please log in again or contact support."
            : "Sorry, something went wrong. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${formattedHours}:${formattedMinutes} ${ampm}`
  }

  const renderMessage = (message: Message) => {
    const isUser = message.sender === "user"

    return (
      <View
        key={message.id}
        style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.userMessageText]}>
              {message.text}
            </Text>
          ) : (
            <MarkdownText style={[styles.messageText, styles.botMessageText]}>
              {message.text}
            </MarkdownText>
          )}
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.botMessageTime]}>
              {formatTime(message.timestamp)}
            </Text>
            {!isUser && (
              <View style={styles.messageActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="thumb-up" size={14} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="thumb-down" size={14} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="content-copy" size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessageContainer]}>
      <View style={styles.botAvatar}>
        <Text style={styles.botAvatarText}>🤖</Text>
      </View>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.assistantAvatar}>
            <Text style={styles.assistantAvatarText}>🤖</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>KNUST Assistant</Text>
            <Text style={styles.headerStatus}>Online • Ready to help</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickQuestionsContainer}>
        <Text style={styles.quickQuestionsLabel}>Quick questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQuestionsScroll}>
          {quickQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickQuestionButton}
              onPress={() => handleQuickQuestion(question)}
            >
              <Text style={styles.quickQuestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && renderTypingIndicator()}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about KNUST..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
          >
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  assistantAvatar: {
    width: 40,
    height: 40,
    backgroundColor: "#FFC107",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  assistantAvatarText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerStatus: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  quickQuestionsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  quickQuestionsLabel: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 8,
  },
  quickQuestionsScroll: {
    flexDirection: "row",
  },
  quickQuestionButton: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickQuestionText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 24,
    height: 24,
    backgroundColor: "#FFC107",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 20,
  },
  botAvatarText: {
    fontSize: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: "#006633",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  botMessageText: {
    color: "#1F2937",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  botMessageTime: {
    color: "#6B7280",
  },
  messageActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9CA3AF",
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: "#1F2937",
  },
  sendButton: {
    backgroundColor: "#006633",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})

export default ChatScreen