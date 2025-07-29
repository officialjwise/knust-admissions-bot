import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type SavedProgramsScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface SavedProgram {
  id: string;
  programName: string;
  course: string;
  savedAt: string;
}

const SavedProgramsScreen = ({ navigation }: SavedProgramsScreenProps) => {
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || "https://knust-chat-bot-backend.onrender.com";

  useEffect(() => {
    fetchSavedPrograms();
  }, []);

  const fetchSavedPrograms = async () => {
    try {
      let idToken: string | null = null;
      try {
        idToken = await SecureStore.getItemAsync("idToken");
      } catch (error) {
        idToken = await AsyncStorage.getItem("idToken");
      }

      if (!idToken) {
        Alert.alert("Error", "Please sign in again to view saved programs.");
        navigation.navigate("SignIn");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/saved-programs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        Alert.alert("Session Expired", "Please sign in again.");
        navigation.navigate("SignIn");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSavedPrograms(data.savedPrograms || []);
    } catch (error) {
      console.error('Error fetching saved programs:', error);
      Alert.alert('Error', 'Failed to load saved programs. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedPrograms();
  };

  const deleteProgram = async (programId: string) => {
    try {
      let idToken: string | null = null;
      try {
        idToken = await SecureStore.getItemAsync("idToken");
      } catch (error) {
        idToken = await AsyncStorage.getItem("idToken");
      }

      if (!idToken) {
        Alert.alert("Error", "Please sign in again.");
        navigation.navigate("SignIn");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/saved-programs/${programId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        Alert.alert("Session Expired", "Please sign in again.");
        navigation.navigate("SignIn");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setSavedPrograms(prev => prev.filter(program => program.id !== programId));
      Alert.alert('Success', 'Program removed from saved programs.');
    } catch (error) {
      console.error('Error deleting program:', error);
      Alert.alert('Error', 'Failed to remove program. Please try again.');
    }
  };

  const confirmDelete = (programId: string, programName: string) => {
    Alert.alert(
      'Remove Program',
      `Are you sure you want to remove "${programName}" from your saved programs?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteProgram(programId) }
      ]
    );
  };

  const renderSavedProgram = (program: SavedProgram) => (
    <View key={program.id} style={styles.programCard}>
      <View style={styles.programHeader}>
        <View style={styles.programIcon}>
          <MaterialIcons name="bookmark" size={24} color="#006633" />
        </View>
        <View style={styles.programInfo}>
          <Text style={styles.programName}>{program.programName}</Text>
          <Text style={styles.programCourse}>{program.course}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(program.id, program.programName)}
        >
          <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.programFooter}>
        <Text style={styles.savedDate}>
          Saved on {new Date(program.savedAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#006633" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#006633" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Programs</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006633" />
          <Text style={styles.loadingText}>Loading saved programs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Programs</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('ProgramSearch')}
        >
          <MaterialIcons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {savedPrograms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="bookmark-border" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Saved Programs</Text>
            <Text style={styles.emptyDescription}>
              You haven't saved any programs yet. Start exploring programs and save the ones you're interested in.
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('ProgramSearch')}
            >
              <Text style={styles.exploreButtonText}>Explore Programs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.programsList}>
            <Text style={styles.sectionTitle}>
              {savedPrograms.length} Saved Program{savedPrograms.length !== 1 ? 's' : ''}
            </Text>
            {savedPrograms.map(renderSavedProgram)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#006633',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#006633',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  programsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programIcon: {
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  programCourse: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 4,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  savedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#006633',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default SavedProgramsScreen;
