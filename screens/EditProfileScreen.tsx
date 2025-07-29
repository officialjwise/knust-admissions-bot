import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import {
    Alert,
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

const EditProfileScreen = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    program: "",
    level: "",
    dateOfBirth: "",
    address: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  type FormErrors = {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    [key: string]: string | undefined
  }
  const [errors, setErrors] = useState<FormErrors>({})

  const navigation = useNavigation()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail")
      const savedProfile = await AsyncStorage.getItem("userProfile")

      if (savedProfile) {
        setFormData(JSON.parse(savedProfile))
      } else {
        setFormData({
          firstName: "John",
          lastName: "Doe",
          email: email || "demo@knust.edu.gh",
          phone: "+233 24 123 4567",
          studentId: "KN2025001",
          program: "BSc Computer Science",
          level: "100",
          dateOfBirth: "1999-05-15",
          address: "Kumasi, Ghana",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      await AsyncStorage.setItem("userProfile", JSON.stringify(formData))
      await AsyncStorage.setItem("userEmail", formData.email)

      Alert.alert("Success", "Your profile has been updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  interface UpdateFormDataFn {
    (field: keyof typeof formData, value: string): void
  }

  const updateFormData: UpdateFormDataFn = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  interface RenderInputOptions {
    icon?: keyof typeof MaterialIcons.glyphMap
    disabled?: boolean
    textInputProps?: React.ComponentProps<typeof TextInput>
  }

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    options: RenderInputOptions = {}
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        {options.icon && <MaterialIcons name={options.icon} size={20} color="#9CA3AF" style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(text) => updateFormData(field, text)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={!options.disabled}
          {...options.textInputProps}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006633" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profilePictureSection}>
            <View style={styles.profilePicture}>
              <Text style={styles.profilePictureText}>
                {formData.firstName.charAt(0)}
                {formData.lastName.charAt(0)}
              </Text>
            </View>
            <TouchableOpacity style={styles.changePictureButton}>
              <Text style={styles.changePictureText}>Change Picture</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.nameInput]}>
                <Text style={styles.label}>First Name</Text>
                <View style={[styles.inputWrapper, errors.firstName && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData("firstName", text)}
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={[styles.inputContainer, styles.nameInput]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={[styles.inputWrapper, errors.lastName && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData("lastName", text)}
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            {renderInput("Email Address", "email", "Enter your email", {
              icon: "email",
              textInputProps: { keyboardType: "email-address", autoCapitalize: "none" },
            })}

            {renderInput("Phone Number", "phone", "Enter your phone number", {
              icon: "phone",
              textInputProps: { keyboardType: "phone-pad" },
            })}

            {renderInput("Date of Birth", "dateOfBirth", "YYYY-MM-DD", {
              icon: "cake",
            })}

            {renderInput("Address", "address", "Enter your address", {
              icon: "location-on",
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>

            {renderInput("Student ID", "studentId", "Enter your student ID", {
              icon: "badge",
              disabled: true,
            })}

            {renderInput("Program", "program", "Enter your program", {
              icon: "school",
            })}

            {renderInput("Level", "level", "Enter your level", {
              icon: "trending-up",
              textInputProps: { keyboardType: "numeric" },
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveButtonLarge, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonLargeText}>{isLoading ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </ScrollView>
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
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#006633",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profilePictureText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  changePictureButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#006633",
    borderRadius: 20,
  },
  changePictureText: {
    color: "#006633",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  saveButtonLarge: {
    backgroundColor: "#006633",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonLargeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default EditProfileScreen
