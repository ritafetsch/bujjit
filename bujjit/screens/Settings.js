// Import required dependencies 
import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {

  // Define and initalize state variables
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCurrency, setNewCurrency] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const navigation = useNavigation();

  // Function for handling navigation to settings 
  const navigateToSettings = () => {
    navigation.navigate('Settings'); 
  };
  // Function to hanle going back to main settings page from edit mode
  const handleGoBack = () => {
    setIsEditing(false);
    if (isEditing) {
      navigateToSettings();
    } else {
      navigation.goBack();
    }
  };
  // Function to handle setting updates upon hitting save 
  const handleSave = async () => {
    // Store updated userData from form in new object updatedUserData
    const updatedUserData = {
      ...userData,
      username: newUsername || userData.username,
      email: newEmail || userData.email,
      password: newPassword || userData.password,
      default_currency: newCurrency || userData.default_currency,
    };
    try {
      // API call to update user data in database
      const response = await fetch(`http://192.168.0.6:3000/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the updated user data in the body 
        body: JSON.stringify(updatedUserData),
      });

      // Check if the update was successful
      if (response.ok) {
        // If successful, update user data in AsyncStorage and update state
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        // Exit edit mode
        setIsEditing(false);
        alert('Settings updated successfully!');
      } else {
        // If update fails 
        console.error('Failed to update user data');
        alert('An error occurred while updating settings.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('An error occurred while updating settings.');
    }
  };

  useEffect(() => {
    // Fetch user data from async storage 
    const fetchUserData = async () => {
      try {
        const userDataJson = await AsyncStorage.getItem('userData');
        const userData = JSON.parse(userDataJson);
        setUserData(userData);
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };
    // Fetch currencies from database 
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('http://192.168.0.6:3000/currencies');
        if (response.ok) {
          // Parse response data and extract currency codes
          const currenciesData = await response.json();
          const mappedCurrencies = currenciesData.map((currency) => currency.code);
          // Update 'currencies' to contain mapped currency codes 
          setCurrencies(mappedCurrencies);
        } else {
          console.error('Failed to fetch currencies');
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    // Call both functions 
    fetchUserData();
    fetchCurrencies();
  }, []);



  return (
    <View style={styles.container}>
      {/* Logo */}
      <View>
        <Image source={require('../assets/images/bujjit-logo.png')} style={styles.logoImage} />
      </View>
      {/* Render back button when in edit mode */}
      <View style={styles.backButtonContainer}> 
      {isEditing && (
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      )}
      </View>
      {/* Settings Form */}
      <View style={styles.settingsContainer}>
        {/* If user data is available */}
        {userData ? (
          <>
            {/* Username */}
            <Text style={styles.label}>Username:</Text>
            {isEditing ? (
              // Input field for editing username
              <TextInput
                style={styles.input}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder={userData.username}
              />
            ) : (
              // Else if not editing, display current username and edit button
              <View style={styles.fieldContainer}>
                <Text style={styles.userData}>{userData.username}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Email  */}
            <Text style={styles.label}>Email:</Text>
            {isEditing ? (
              // Input field for editing email
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder={userData.email}
              />
            ) : (
              // Else if not editing, display current email and edit button
              <View style={styles.fieldContainer}>
                <Text style={styles.userData}>{userData.email}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Password  */}
            <Text style={styles.label}>Password:</Text>
            {isEditing ? (
              // Input field for editing password
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Enter new password"
              />
            ) : (
              // Else if not editing, display password field as asterisks and edit button
              <View style={styles.fieldContainer}>
                <Text style={styles.userData}>********</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
             {/* Default Currency */}
            <Text style={styles.label}>Default Currency:</Text>
            {isEditing ? (
              // Picker for selecting new default currency 
              <Picker
                selectedValue={newCurrency}
                onValueChange={(itemValue) => setNewCurrency(itemValue)}
              >
                {currencies.map((currency) => (
                  <Picker.Item key={currency} label={currency} value={currency} />
                ))}
              </Picker>
              
            ) : (
              // Else if not editing, display current default currency and edit button
              <View style={styles.fieldContainer}>
                <Text style={styles.userData}>{userData.default_currency}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Save Button */}
            {isEditing && (
              // Save button (visible while editing)
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          // Loading message if user data is not available 
          <Text>Loading user data...</Text>
        )}
      </View>
    </View>
  );
};
// Settings component styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    backgroundColor: '#fff',
  },
  settingsContainer:{
    marginTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userData: {
    flex: 1,
    fontSize: 16,
    marginBottom: 15,
  },
  editButton: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginLeft: 15
    },
  picker: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    marginTop: 10,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  backButtonContainer:{
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
});


export default Settings;