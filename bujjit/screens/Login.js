// Import required dependencies 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = ({ navigation, setIsAuthenticated, setUserData , userData}) => {
    
  // Define state variables for login credentials 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async () => {
    try {
      // API call to the backend with input username and password
      const response = await fetch('http://192.168.0.6:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      // If the API response successful, update authentication state to true
      if (data.authenticated) {
        // Call function below to handle login success 
        handleLoginSuccess(data.userData);
      } else {
        // Handle unsucessful login 
        alert('Invalid username or password');
      }
    } catch (error) {
      // Error communicating with backend 
      console.error('Error logging in:', error);
    }
  };
  
  // Function to set user data when user successfully logs in 
  const handleLoginSuccess = async (userData) => {
    try {
      // Save userData in AsyncStorage
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
      console.error('Error during login:', error);
    }
  };
      

    return (
        <View style={styles.container}>
        <View style={styles.logoContainer}>
            {/* Logo */}
            <Image source={require('../assets/images/bujjit-logo.png')} style={styles.logoImage} />
        </View>

        <View style={styles.mainContentContainer}>  
        {/* Login text */}
        <View style={styles.loginTextContainer}>
            <Text style={styles.loginText}>Login</Text>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              {/* Registration link if user doesn't have an account */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Registration',{ userData: userData, setIsAuthenticated: setIsAuthenticated })}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </Text>
        </View>

        {/* Username input */}
        <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
        />

        {/* Password input */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, styles.passwordBox]}
            placeholder="Password"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={() => setShowPassword((prevState) => !prevState)}
          >
            {/* Show password eye button */}
            <IconButton
              icon={showPassword ? 'eye-off' : 'eye'}
              color="#888"
              size={24}
            />
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        </View>
        </View>
  );
};
// Login component Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '25%',
    marginBottom: 30,
  },
  loginTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  passwordBox:{
    width: '100%'
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between'
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#61acc9',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    marginLeft: 15
  },
  mainContentContainer:{
    marginTop: 100
  }
});

export default Login;
