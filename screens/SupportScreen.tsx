import { MaterialIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type SupportScreenProps = {
  navigation: StackNavigationProp<any>;
};

const SupportScreen = ({ navigation }: SupportScreenProps) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const supportCategories = [
    {
      id: 'technical',
      title: 'Technical Issues',
      description: 'App crashes, login problems, performance issues',
      icon: 'build',
      color: '#EF4444',
    },
    {
      id: 'content',
      title: 'Content Questions',
      description: 'Program information, admission requirements',
      icon: 'school',
      color: '#3B82F6',
    },
    {
      id: 'account',
      title: 'Account Support',
      description: 'Profile issues, password reset, data concerns',
      icon: 'person',
      color: '#8B5CF6',
    },
    {
      id: 'feature',
      title: 'Feature Requests',
      description: 'Suggest new features or improvements',
      icon: 'lightbulb',
      color: '#F59E0B',
    },
  ];

  const quickActions = [
    {
      title: 'Email Support',
      subtitle: 'support@knust.edu.gh',
      icon: 'email',
      onPress: () => handleEmailPress(),
    },
    {
      title: 'Call KNUST',
      subtitle: '+233 3220 60331',
      icon: 'phone',
      onPress: () => handlePhonePress(),
    },
    {
      title: 'Visit Website',
      subtitle: 'knust.edu.gh',
      icon: 'language',
      onPress: () => handleWebsitePress(),
    },
    {
      title: 'Live Chat',
      subtitle: 'Chat with assistant',
      icon: 'chat',
      onPress: () => navigation.navigate('Chat'),
    },
  ];

  const handleEmailPress = () => {
    const email = 'support@knust.edu.gh';
    const subject = 'KNUST Pathfinder Support Request';
    const body = `Dear Support Team,\n\nI need assistance with the KNUST Pathfinder app.\n\nCategory: ${selectedCategory || 'General'}\n\nDescription:\n${feedbackText}\n\nBest regards`;
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+233322060331');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.knust.edu.gh');
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Missing Information', 'Please enter your feedback or question.');
      return;
    }

    Alert.alert(
      'Feedback Submitted',
      'Thank you for your feedback! We will review it and get back to you soon.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFeedbackText('');
            setSelectedCategory('');
          },
        },
      ]
    );
  };

  const renderCategoryCard = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        selectedCategory === category.id && styles.selectedCategoryCard,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
        <MaterialIcons name={category.icon as any} size={24} color={category.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      {selectedCategory === category.id && (
        <View style={styles.checkIcon}>
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderQuickAction = (action: any, index: number) => (
    <TouchableOpacity key={index} style={styles.quickActionCard} onPress={action.onPress}>
      <View style={styles.quickActionIcon}>
        <MaterialIcons name={action.icon as any} size={24} color="#006633" />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            We're here to assist you with any questions or issues you might have with KNUST Pathfinder.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map(renderQuickAction)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Feedback</Text>
          <Text style={styles.sectionSubtitle}>
            Tell us about any issues you're experiencing or suggestions you have.
          </Text>

          <Text style={styles.inputLabel}>Select Category</Text>
          <View style={styles.categoriesContainer}>
            {supportCategories.map(renderCategoryCard)}
          </View>

          <Text style={styles.inputLabel}>Describe Your Issue or Feedback</Text>
          <TextInput
            style={styles.feedbackInput}
            multiline
            numberOfLines={6}
            placeholder="Please describe your issue, question, or feedback in detail..."
            placeholderTextColor="#9CA3AF"
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <TouchableOpacity
            style={styles.faqButton}
            onPress={() => navigation.navigate('FAQ')}
          >
            <MaterialIcons name="help" size={20} color="#006633" />
            <Text style={styles.faqButtonText}>View FAQ</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Support Hours: Monday - Friday, 8:00 AM - 5:00 PM</Text>
          <Text style={styles.footerText}>Response Time: Within 24 hours</Text>
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
  welcomeSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryCard: {
    borderColor: '#006633',
    backgroundColor: '#F0FDF4',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#006633',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#006633',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  faqButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#006633',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default SupportScreen;
