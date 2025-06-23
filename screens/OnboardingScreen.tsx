import { useState, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar, Animated } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation, NavigationProp } from "@react-navigation/native"

type RootStackParamList = {
  SignIn: undefined;
  OnboardingScreen: undefined;
};

const { width } = Dimensions.get("window")

const onboardingData = [
  {
    id: 1,
    title: "Welcome to KNUST Pathfinder",
    description:
      "Your comprehensive guide to navigating the admission process at Kwame Nkrumah University of Science and Technology.",
    icon: "🎓",
    color: "#006633",
  },
  {
    id: 2,
    title: "AI-Powered Assistance",
    description:
      "Get instant answers to your questions about programs, requirements, deadlines, and campus life from our intelligent assistant.",
    icon: "🤖",
    color: "#FFC107",
  },
  {
    id: 3,
    title: "Personalized Recommendations",
    description: "Discover the perfect academic program based on your interests, grades, and career aspirations.",
    icon: "🎯",
    color: "#FF6B35",
  },
  {
    id: 4,
    title: "Track Your Journey",
    description: "Monitor your application progress, save important information, and never miss a deadline.",
    icon: "📊",
    color: "#8B5CF6",
  },
]

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const fadeAnim = useRef(new Animated.Value(1)).current

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      })
    } else {
      handleGetStarted()
    }
  }

  const handleSkip = () => {
    handleGetStarted()
  }

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true")

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigation.navigate("SignIn")
      })
    } catch (error) {
      console.error("Error setting first launch flag:", error)
      navigation.navigate("SignIn")
    }
  }

  interface ScrollEvent {
    nativeEvent: {
      contentOffset: {
        x: number;
      };
    };
  }

  const handleScroll = (event: ScrollEvent) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / width)
    setCurrentIndex(index)
  }

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? "#006633" : "#D1D5DB",
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    )
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 48,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: "#006633",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default OnboardingScreen
