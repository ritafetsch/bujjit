
// Import required dependencies 
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import components from other screens
import Login from 'bujjit/screens/Login.js';
import Dashboard from 'bujjit/screens/Dashboard.js';
import Registration from 'bujjit/screens/Registration.js';
import Settings from 'bujjit/screens/Settings.js';
import Summary from 'bujjit/screens/Summary.js';
import SelectCategoryOverlay from 'bujjit/screens/SelectCategoryOverlay.js';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();
const Stack = createStackNavigator();

const App = () => {
 
  // Define and initialized state variables
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  // Function for checking authentication status 
  const checkAuthenticationStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // Check for authentication token, if present authenticate user
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      // If error, set user authenticated to false 
      setIsAuthenticated(false);
    }
  };
  // If user is not authenticated
  if (isAuthenticated === null) {
    return (
      // Show activity indicator while checking authentication status
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator testID="loading-indicator" size="large" />
      </View>
    );
  }

  useEffect(() => {
    // Check if user is authenticated upon app start
    checkAuthenticationStatus();
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator>
      {/* If user is authenticated  */}
      {isAuthenticated ? (
          <>
          {/* Dashboard Screen */}
          <Stack.Screen
            name="Dashboard"
            options={{ headerShown: false }}
            initialParams={{ isAuthenticated, setUserData }}
            testId="dashboard-screen"
          >
            {/* Pass in props */}
            {(props) => (
              <Dashboard
                {...props}
                navigation={props.navigation} 
                setIsAuthenticated={setIsAuthenticated}
                setUserData={setUserData}
                userData={userData}
                isAuthenticated={isAuthenticated}
              />
            )}
          </Stack.Screen>
          {/* Summary Screen */}
          <Stack.Screen
            name="Summary" 
            component={Summary}
            options={{ headerShown: false }}
          />
          {/* Settings Screen */}
           <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerShown: false }}
          />
          {/* Categories Screen */}
            <Stack.Screen
            name="Categories" 
            component={SelectCategoryOverlay}
            options={{ headerShown: false }}
          />
        </>
        ) : (
          <>
            {/* Login Screen */}
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }} 
              testID="login-screen"
            >
              {/* Pass in props */}
              {(props) => (
                <Login
                  navigation={props.navigation}
                  setIsAuthenticated={setIsAuthenticated}
                  setUserData={setUserData}
                  userData={userData}
                />
              )}
            </Stack.Screen>
              {/* Registration Screen */}
            <Stack.Screen
              name="Registration"
              options={{ headerShown: false }}
            > 
              {/* Pass in props */}
              {(props) => (
                <Registration
                  navigation={props.navigation}
                  setIsAuthenticated={setIsAuthenticated}
                  setUserData={setUserData}
                  userData={userData}
                />
              )}
              </Stack.Screen> 
            </>
          )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
