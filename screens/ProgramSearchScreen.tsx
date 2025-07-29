import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type { NavigationProp } from '../types/navigation';

type ProgramSearchScreenProps = {};

interface Program {
  id: string;
  name: string;
  description: string;
  requirements: string;
  college?: string;
}

interface SavedProgram {
  id: string;
  programName: string;
  course: string;
  savedAt: string;
}

const colleges = [
  { id: 'all', name: 'All Colleges' },
  { id: 'science', name: 'College of Science' },
  { id: 'engineering', name: 'College of Engineering' },
  { id: 'humanities', name: 'College of Humanities and Social Sciences' },
  { id: 'agriculture', name: 'College of Agriculture and Natural Resources' },
  { id: 'health', name: 'College of Health Sciences' },
  { id: 'art', name: 'College of Art and Built Environment' },
];

const ProgramSearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || "https://knust-chat-bot-backend.onrender.com";
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  useEffect(() => {
    loadSavedPrograms();
  }, []);

  const loadSavedPrograms = async () => {
    setIsLoadingSaved(true);
    try {
      const token = await SecureStore.getItemAsync("idToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/saved-programs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPrograms(data.savedPrograms || []);
      }
    } catch (error) {
      console.error("Error loading saved programs:", error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const searchPrograms = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Search Required", "Please enter a search term to find programs.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("idToken");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }]
        });
        return;
      }

      const collegeParam = selectedCollege !== 'all' ? `&college=${selectedCollege}` : '';
      const response = await fetch(
        `${API_BASE_URL}/programs/search?query=${encodeURIComponent(searchQuery)}${collegeParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await SecureStore.deleteItemAsync("idToken").catch(() => {});
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }]
          });
          return;
        }
        throw new Error("Failed to search programs");
      }

      const data = await response.json();
      setPrograms(data.results || []);
    } catch (error: any) {
      Alert.alert("Search Error", error.message || "Failed to search programs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgram = async (program: Program) => {
    try {
      const token = await SecureStore.getItemAsync("idToken");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }]
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/saved-programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          programId: program.id,
          programName: program.name,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await SecureStore.deleteItemAsync("idToken").catch(() => {});
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }]
          });
          return;
        }
        throw new Error("Failed to save program");
      }

      const data = await response.json();
      setSavedPrograms(prev => [...prev, data]);
      Alert.alert("Success", "Program saved successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save program. Please try again.");
    }
  };

  const removeSavedProgram = async (savedProgramId: string) => {
    try {
      const token = await SecureStore.getItemAsync("idToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/saved-programs/${savedProgramId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSavedPrograms(prev => prev.filter(sp => sp.id !== savedProgramId));
        Alert.alert("Success", "Program removed from saved list.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to remove program. Please try again.");
    }
  };

  const isProgramSaved = (programId: string) => {
    return savedPrograms.some(sp => sp.id === programId || sp.programName.includes(programId));
  };

  const renderProgram = (program: Program) => (
    <View key={program.id} style={styles.programCard}>
      <View style={styles.programHeader}>
        <Text style={styles.programName}>{program.name}</Text>
        <TouchableOpacity
          onPress={() => saveProgram(program)}
          style={[styles.saveButton, isProgramSaved(program.id) && styles.savedButton]}
          disabled={isProgramSaved(program.id)}
        >
          <MaterialIcons 
            name={isProgramSaved(program.id) ? "bookmark" : "bookmark-border"} 
            size={20} 
            color={isProgramSaved(program.id) ? "#FFFFFF" : "#006633"} 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.programDescription}>{program.description}</Text>
      <View style={styles.requirementsSection}>
        <Text style={styles.requirementsTitle}>Requirements:</Text>
        <Text style={styles.requirementsText}>{program.requirements}</Text>
      </View>
    </View>
  );

  const renderSavedProgram = (savedProgram: SavedProgram) => (
    <View key={savedProgram.id} style={styles.savedProgramCard}>
      <View style={styles.savedProgramHeader}>
        <Text style={styles.savedProgramName}>{savedProgram.programName}</Text>
        <TouchableOpacity
          onPress={() => removeSavedProgram(savedProgram.id)}
          style={styles.removeButton}
        >
          <MaterialIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.savedProgramCourse}>Course: {savedProgram.course}</Text>
      <Text style={styles.savedDate}>Saved: {new Date(savedProgram.savedAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Search</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Programs</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for programs (e.g., computer science, engineering)"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchPrograms}
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={searchPrograms}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="search" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.collegeLabel}>Filter by College:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collegeScroll}>
            {colleges.map((college) => (
              <TouchableOpacity
                key={college.id}
                style={[
                  styles.collegeChip,
                  selectedCollege === college.id && styles.selectedCollegeChip
                ]}
                onPress={() => setSelectedCollege(college.id)}
              >
                <Text style={[
                  styles.collegeChipText,
                  selectedCollege === college.id && styles.selectedCollegeChipText
                ]}>
                  {college.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {programs.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Search Results ({programs.length})</Text>
            {programs.map(renderProgram)}
          </View>
        )}

        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>Saved Programs</Text>
          {isLoadingSaved ? (
            <ActivityIndicator size="large" color="#006633" style={styles.loadingIndicator} />
          ) : savedPrograms.length > 0 ? (
            savedPrograms.map(renderSavedProgram)
          ) : (
            <Text style={styles.emptyText}>No saved programs yet. Search and save programs to see them here.</Text>
          )}
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
  searchSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#006633',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  collegeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  collegeScroll: {
    flexDirection: 'row',
  },
  collegeChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCollegeChip: {
    backgroundColor: '#006633',
    borderColor: '#006633',
  },
  collegeChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedCollegeChipText: {
    color: '#FFFFFF',
  },
  resultsSection: {
    marginBottom: 32,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#006633',
    borderRadius: 8,
    padding: 8,
  },
  savedButton: {
    backgroundColor: '#006633',
    borderColor: '#006633',
  },
  programDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  requirementsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  savedSection: {
    marginBottom: 32,
  },
  savedProgramCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  savedProgramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  savedProgramName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  savedProgramCourse: {
    fontSize: 14,
    color: '#15803D',
    marginBottom: 4,
  },
  savedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

export default ProgramSearchScreen;
