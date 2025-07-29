import { MaterialIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type AboutScreenProps = {
  navigation: StackNavigationProp<any>;
};

const AboutScreen = ({ navigation }: AboutScreenProps) => {
  const socialLinks = [
    {
      name: 'X (Twitter)',
      icon: 'alternate-email',
      url: 'https://twitter.com/rocksonofficial',
      color: '#1DA1F2',
    },
    {
      name: 'Instagram',
      icon: 'camera-alt',
      url: 'https://instagram.com/rocksonofficial',
      color: '#E4405F',
    },
    {
      name: 'Snapchat',
      icon: 'camera',
      url: 'https://snapchat.com/add/rocksonofficial',
      color: '#FFFC00',
    },
    {
      name: 'LinkedIn',
      icon: 'business',
      url: 'https://linkedin.com/in/rocksonofficial',
      color: '#0077B5',
    },
  ];

  const handleSocialPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.appInfoSection}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>🎓</Text>
          </View>
          <Text style={styles.appName}>KNUST Pathfinder</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Project</Text>
          <Text style={styles.description}>
            KNUST Pathfinder is a comprehensive mobile application designed to guide prospective students through the admission process at Kwame Nkrumah University of Science and Technology (KNUST).
            {'\n\n'}
            This intelligent chatbot assistant helps students discover suitable academic programs based on their Senior High School background, provides detailed information about admission requirements, deadlines, and university life.
            {'\n\n'}
            The app features personalized program recommendations, real-time chat assistance, and up-to-date information about KNUST's various schools and departments.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Information</Text>
          <View style={styles.developerCard}>
            <View style={styles.developerHeader}>
              <View style={styles.developerAvatar}>
                <Text style={styles.developerAvatarText}>RR</Text>
              </View>
              <View style={styles.developerInfo}>
                <Text style={styles.developerName}>Rockson Rockson</Text>
                <Text style={styles.developerTitle}>Final Year Computer Science Student</Text>
                <Text style={styles.developerUniversity}>KNUST</Text>
              </View>
            </View>
            <Text style={styles.developerDescription}>
              Scisca Financial Secretary and passionate software developer with a focus on educational technology and mobile app development.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect with the Developer</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { borderColor: social.color }]}
                onPress={() => handleSocialPress(social.url)}
              >
                <MaterialIcons name={social.icon as any} size={24} color={social.color} />
                <Text style={[styles.socialText, { color: social.color }]}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Context</Text>
          <Text style={styles.academicText}>
            This application was developed as a final year project, demonstrating the practical application of computer science principles in solving real-world educational challenges.
            {'\n\n'}
            The project showcases modern mobile development technologies, artificial intelligence integration, and user-centered design principles.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 KNUST Pathfinder</Text>
          <Text style={styles.footerText}>Built with ❤️ for KNUST Community</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#006633',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#006633',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appIconText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  developerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  developerAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#006633',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  developerAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  developerTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  developerUniversity: {
    fontSize: 14,
    color: '#006633',
    fontWeight: '500',
  },
  developerDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  academicText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default AboutScreen;
