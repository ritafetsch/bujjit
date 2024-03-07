// Import required dependencies 
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Registration = ({ navigation, setIsAuthenticated, setUserData , userData}) => {

  // Define and initialize state variables 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');

  // Function for handling navigation back to login 
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };
  // Function for handling registration 
  const handleRegistration = async () => {
    // API call to backend to register new user in database 
    try {
      const response = await fetch('http://192.168.0.6:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Send form variables in body
          email,
          username,
          password,
          defaultCurrency,
        }),
      });
      const data = await response.json();
      // If registration is successful 
      if (data.success) {
        // Call handleRegistrationSuccess function passing in new user data 
        handleRegistrationSuccess(data);
      } else {
        alert('Registration failed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred.');
    }
  };
  
  // Function for handling registration success
  const handleRegistrationSuccess = async (userData) => {
    try {
      // Save the user data and authentication status in AsyncStorage
      await AsyncStorage.setItem('authToken', 'dummyToken');
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // Save userId
      if (userData.id) {
        await AsyncStorage.setItem('userId', userData.id.toString());
      }
  
      // Update authentication state upon succesful login and set 'userData'
      setIsAuthenticated(true); 
      setUserData(userData);
  
      // Redirect user to Dashboard and pass in user data 
      navigation.navigate('Dashboard', { userData });
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };
  
  
  return (
    <View style={styles.container}>
      {/* Back to login button */}
       <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>

      </TouchableOpacity>
      {/* Registration Form */}

        <View style={styles.logoContainer}>
          {/* Logo */}
          <Image source={require('../assets/images/bujjit-logo.png')} style={styles.logoImage} />
        </View>

        {/* Email input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        {/* Username input */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={text => setUsername(text)}
        />
        {/* Password input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={text => setPassword(text)}
        />
        {/* Currecy input */}
        <TextInput
          style={styles.input}
          placeholder="Preferred Currency"
          value={defaultCurrency}
          onChangeText={setDefaultCurrency}
        />

        {/* Register button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
     
    </View>

    
  );
};
// Registration component styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer:{
    marginTop: 200,
    marginBottom: 20
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    width: '80%',
  },
  registerButton: {
    backgroundColor: '#61acc9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    width: '80%',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  logoImage: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    marginLeft: 15
  },
});

export default Registration;
