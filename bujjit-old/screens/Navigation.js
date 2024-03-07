// Import required dependencies 
import React, {useState} from 'react';
import {View,Text,TouchableOpacity,TouchableWithoutFeedback,Image,Modal,StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Navigation = ({navigation, setIsAuthenticated, userData, setUserData }) => {

  // Define state variable
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Function to toggle menu from kebab icon when tapped
  const toggleKebabMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };
  // Function to handle closing menu
  const closeKebabMenu = () => {
    setIsMenuVisible(false);
  };

  // Function for handling logout functionality
  const handleLogout = async () => {
    try {
      // Clear user data and authentication status from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userId');

      // Reset the authentication state 
      setIsAuthenticated(false);
      setUserData(null);

      // Redirect user to login page passing in userData and setIsAuthenticated as context
      navigation.navigate('Login', { userData: userData, setIsAuthenticated: setIsAuthenticated });

    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
    
  return (
    <View style={styles.navContainer}>
      <View style={styles.navTopRow}>
        {/* Bujjit logo */}
        <Image source={require('../assets/images/bujjit-logo.png')} style={styles.logoImage} />
        {/* Kebab menu */}
        <TouchableOpacity style={styles.kebabMenu} onPress={toggleKebabMenu}>
          <Text style={styles.kebabMenuText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Nav links  */}
      <View style={styles.navBottomRow}>
        <TouchableOpacity style={styles.navLinkContainer} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.navLink}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navLinkContainer} onPress={() => navigation.navigate('Summary')}>
          <Text style={styles.navLink}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navLinkContainer} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.navLink}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Kebab menu modal */}
      {isMenuVisible && (
        <Modal visible={isMenuVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={closeKebabMenu}>
            <View style={styles.kebabModalOverlay} />
          </TouchableWithoutFeedback>
          {/* Have it contain links to settings and the logout button */}
          <View style={styles.kebabModalContent}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.kebabModalText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.kebabModalText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default Navigation;

// Navigation component styles
const styles = StyleSheet.create({
navContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  logoImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginLeft: 15
  },
  kebabMenu: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kebabMenuText:{
    ze: 22,
  },
  navTopRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  navBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  navLink: {
    fontSize: 16,
    marginBottom: 10
  },
  navLinkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kebabModalOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  kebabModalContent: {
    width: 150, 
    height: 150,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end', 
  },
  kebabModalText: {
    fontSize: 16,
    paddingBottom: 15
  },
});