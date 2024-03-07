// Import required dependencies 
import React, {useState, useEffect} from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar} from 'react-native';
import AddTransactionOverlay from './AddTransactionOverlay';
import DashboardSummary from './DashboardSummary'; 
import Navigation from './Navigation';
import DashboardTransactionList from './DashboardTransactionList'; 



const Dashboard = ({ userData, navigation, setIsAuthenticated, setUserData , route }) => {

  // Define transaction and filtered transactions state variables 
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]); 


  // Function to fetch transaction data from database 
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://192.168.0.6:3000/transactions');
      const data = await response.json();

      // Update 'transactions' and 'filteredTransactions' with fetched data 
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      // If error, display error to console and set variables to empty arrays 
      console.error('Error fetching transactions:', error);
      setTransactions([]); 
      setFilteredTransactions([]); 
    }
  };
  // Function for updating transactions state with new transactoin
  const addNewTransaction = (newTransaction) => {
    setTransactions([newTransaction, ...transactions]);
  };

  useEffect(() => {
    // Fetch transactions when component mounts 
    fetchTransactions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar backgroundColor="white" /> 

      <View style={styles.container}>
        {/* Nav section - pass in props */}
        <View style={styles.dashNavContainer}> 
        <Navigation
            navigation={navigation}
            setIsAuthenticated={setIsAuthenticated}
            setUserData={setUserData}
            userData={userData}  
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Summary section - pass in props */}
          <View style={styles.dashSummaryContainer}>
          <DashboardSummary transactions={transactions} />
          <View style={styles.separator}></View>
          </View>

          {/* Transaction section - pass in props */}
          <DashboardTransactionList
            transactions={transactions}
            setTransactions={setTransactions}
            filteredTransactions={filteredTransactions} 
            setFilteredTransactions={setFilteredTransactions} 
            fetchTransactions={fetchTransactions}
          />
        </ScrollView>

        {/* Add transaction section - pass in props */}
        <AddTransactionOverlay onTransactionAdded={addNewTransaction} />
      </View>
      
    </SafeAreaView>
  );
};
// Dashboard component styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc', 
  },
  dashSummaryContainer:{
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dashNavContainer:{
    paddingHorizontal: 35,
    paddingTop: 30,
  }
});

export default Dashboard;




