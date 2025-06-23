import React, { useEffect } from "react"
import { View, Text, StyleSheet, Animated, StatusBar, Image } from "react-native"

const SplashScreen: React.FC = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          {/* Using the KNUST logo from assets/images/icon.png */}
          <Image source={require("../assets/images/icon.png")} style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={styles.title}>KNUST Pathfinder</Text>
        <Text style={styles.subtitle}>Your Academic Journey Starts Here</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Kwame Nkrumah University of Science and Technology</Text>
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, { opacity: 0.7 }]} />
          <View style={[styles.loadingDot, { opacity: 0.4 }]} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#006633",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 100,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFC107",
    marginHorizontal: 4,
  },
})

export default SplashScreen
