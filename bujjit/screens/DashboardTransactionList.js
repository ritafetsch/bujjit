// Import required dependencies 
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, TouchableWithoutFeedback , StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DashboardTransactionList = ({ transactions, setFilteredTransactions, fetchTransactions }) => {
  // Define state variables 
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modifiedDescription, setModifiedDescription] = useState('');
  const [modifiedDate, setModifiedDate] = useState('');
  const [modifiedAmount, setModifiedAmount] = useState(0); 
  const [transactionUser, setTransactionUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [modifiedUsername, setModifiedUsername] = useState('');
  const [modifiedCategory, setModifiedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [transactionsUserMap, setTransactionsUserMap] = useState({});


  // Fetch logged in user's data from AsyncStorage 
  const fetchLoggedInUserData = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataJson);
      setUserData(userData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  }
  // Fetch user data from database 
  const fetchUser = async (user_id) => {
    try {
      const response = await fetch(`http://192.168.0.6:3000/users/${user_id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };
  // Fetch category from database based on category id 
  const fetchCategory = (category_id) => {
    return fetch(`http://192.168.0.6:3000/categories/${category_id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        return data; 
      })
      .catch(error => {
        console.error('Error fetching category data:', error);
        return null; 
      });
  };
  // Fetch all categories from database 
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://192.168.0.6:3000/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };
  


  // Function for handling search functionality - taking incoming query 
  const handleSearch = (query) => {
    // Update searchQuery variable with user's input 
    setSearchQuery(query);
    // filter transactions based on query - make lowercase so its irrespective of case 
    const filtered = transactions.filter((transaction) =>
      transaction.description.toLowerCase().includes(query.toLowerCase())
    );
    // update filteredTransactions variable to the filtered search so only filtered selected appears on page 
    setFilteredTransactions(filtered);
  };


   // Function for handling changes to modal description field 
   const handleDescriptionChange = (text) => {
     setModifiedDescription(text);
   };
   // Function for handling changes to modal amount field 
   const handleAmountChange = (amount) => {
     setModifiedAmount(amount);
   };
   // Function  for handling changes to modal date field 
   const handleDateChange = (date) => {
    setModifiedDate(date);
    // Hide picker after selecting date
    setIsDatePickerVisible(false);
  };
  // Function for handling changes to modal category field 
  const handleCategoryChange = (categoryId) => {
    setModifiedCategory(categoryId); 
    setSelectedTransaction((prevTransaction) => ({
      ...prevTransaction,
      category_id: categoryId,
    }));
  };

  // Function for handling case when a transaction in dashboard list is tapped on 
  const handleTransactionTap = (transaction) => {

    // Set modified state variables to selected transaction data 
    setSelectedTransaction(transaction);
    setModifiedDescription(transaction.description);
    setModifiedDate(transaction.date);
    setModifiedAmount(transaction.amount);
  
    // Access category data (fetched in useEffect)
    const categoryData = categories.find((category) => category.id === transaction.category_id);
    if (categoryData) {
      setModifiedCategory(categoryData.id);
    } else {
      setModifiedCategory(null);
    }
  
    // Access user data (fetched in useEffect)
    const userData = transactionsUserMap[transaction.user_id];
    if (userData) {
      setTransactionUser(userData);
      setModifiedUsername(userData.username);
    } else {
      setTransactionUser(null);
      setModifiedUsername('No user associated with transaction');
    }
    // After setting all variables, show modal 
    setIsModalVisible(true);
  };
  
  // Function to handle update transaction data upon submission
  const handleUpdateTransaction = async () => {
    try {
      // Construct updated transaction with modified values
      const updatedTransaction = {
        ...selectedTransaction,
        description: modifiedDescription,
        amount: modifiedAmount,
        date: modifiedDate,
        category: modifiedCategory
      };
  
      // POST update transaction in the database 
      await fetch(`http://192.168.0.6:3000/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
      });
  
      // Refresh transactions list after updating
      fetchTransactions();
  
      // Close modal after successful update
      setSelectedTransaction(null);
    
     } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  // Function for handling transaction deletion 
  const handleDeleteTransaction = async () => {
    try {
      // Show confirmation alert message before deletion
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              // API call to delete selected transaction from dataase 
              await fetch(`http://192.168.0.6:3000/transactions/${selectedTransaction.id}`, {
                method: 'DELETE',
              });
  
              // Refresh transactions list after deletion
              fetchTransactions();
  
              // Close modal after successful deletion
              setSelectedTransaction(null);
              // Close modal after successful update
              setIsModalVisible(false); 
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };


  // Upon component mounting
  useEffect(() => {
    // Call functions to fetch data 
    fetchLoggedInUserData();
    fetchCategories();
    fetchTransactions();

    // If a transaction is selected (for editing)
    if (selectedTransaction) {
      // Get transaction category 
      fetchCategory(selectedTransaction.category_id);
      // Get associated user 
      fetchUser(selectedTransaction.user_id)
        .then((userData) => {
          // Update transactionsUserMap state with new or updated userData
          setTransactionsUserMap((prevMap) => ({ ...prevMap, [userData.id]: userData }));
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, [selectedTransaction]);


   
  
  return (
    <View style={styles.transactionListContainer}> 
      <React.Fragment>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Transactions..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

         {/* Transaction list  */}
        <FlatList
          // Sort transactions by date 
          data={transactions.sort((a, b) => new Date(b.date) - new Date(a.date))}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.transactionItemContainer}
              onPress={() => handleTransactionTap(item)}
            >
              
              {/* Top section: Description */}
              <View style={styles.topTransaction}>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
  
              {/* Bottom section: Amount */}
              <View style={styles.bottomTransaction}>
                <Text
                  // Style depending on whether it is income or expense  
                  style={item.transaction_type === 'expense' ? styles.expenseAmount : styles.incomeAmount}
                >
                  {/* Use symbol depending on whether it is income or expense */}
                  {item.transaction_type === 'expense' ? '-' : '+'}
                  {item.amount.toFixed(2)} GBP
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Modal for transaction details */}
        <Modal
          visible={selectedTransaction !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedTransaction(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedTransaction(null)}>
          
          <View style={styles.transactionDetailsModalContainer}>
            {/* Background overlay */}
            <View style={styles.modalOverlay} />
            
           
            {selectedTransaction && (
              // Transaction details editing form 
              <View style={styles.transactionDetailsModal}>

                {/* Delete button inside overlay */}
                <View style={styles.deleteTransactionContainer}> 
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTransaction}>
                    <Text style={styles.deleteButtonText}>-</Text>
                  </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={styles.transactionDetailsModalRow}>
                  <Text style={styles.transactionDetailsModalLabel}>Description:</Text>
                  <TextInput
                    style={styles.transactionDetailsModalInput}
                    value={modifiedDescription}
                    onChangeText={handleDescriptionChange}
                    placeholder="Enter description..."
                  />
                </View>

                {/* Date */}
                <View style={styles.transactionDetailsModalRow}>
                  <Text style={styles.transactionDetailsModalLabel}>Date:</Text>
                  <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
                    <View style={styles.dateInputContainer}>
                      <Text style={styles.dateText}>{modifiedDate}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                
                {/* Category */}
                <View style={styles.transactionDetailsModalRow}>
                  <Text style={styles.transactionDetailsModalLabel}>Category:</Text>
                  
                  {/* Handle category picker */}
                  <Picker
                    mode="dropdown"
                    // Either get modified Category if category has been modified, or else category associated with selected transaction
                    selectedValue={modifiedCategory || selectedTransaction.category_id} 
                    onValueChange={(categoryId) => handleCategoryChange(categoryId)}
                    style={[styles.picker, styles.transactionDetailsModalInput]}
                  >
                    {/* Default select category option */}
                    <Picker.Item label="Select a category" value={null} />
                    {/* Iterate over cateogires to get picker component options */}
                    {categories.map((category) => (
                      <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                  </Picker>
                </View>

                {/* Amount */}
                <View style={styles.transactionDetailsModalRow}>
                  <Text style={styles.transactionDetailsModalLabel}>Amount:</Text>
                  <TextInput
                    style={styles.transactionDetailsModalInput}
                    value={modifiedAmount.toString()}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric" 
                  />
                </View>

                 {/* Associated user */}
                <View style={styles.transactionDetailsModalRow}>
                  <Text style={[styles.transactionDetailsModalLabel]}>Username:</Text>
                  <Text
                    style={[styles.transactionDetailsModalText, styles.transactionDetailsModalInput]}
                  >
                    {transactionUser?.username}
                  </Text>
                </View>

                {/* Submit - update details in database */}
                <TouchableOpacity onPress={handleUpdateTransaction}>
                  <Text style={styles.modalButton}>Update Transaction</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Conditionally render dateTimePicker */}
            {isDatePickerVisible && (
              <DateTimePicker
                value={new Date(modifiedDate)} 
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) {
                    // Format selected date 
                    const selectedDate = date.toISOString().slice(0, 10);
                    // Update date to selected one from picker
                    handleDateChange(selectedDate); 
                  }
                  // Hide picker after selection
                  setIsDatePickerVisible(false); 
                }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </React.Fragment>
    </View>
  );
};

  
// DashboardTransactionList component styles 
const styles = StyleSheet.create({
  transactionListContainer:{
    padding: 16,
  },
  transactionItemContainer: {
    flexDirection: 'column',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 15,
  },
  bottomTransaction:{
    paddingTop: 40,
    alignItems: 'flex-end',
  },
  descriptionText: {
    fontSize: 16,
  },
  expenseAmount:{
    fontSize: 24,
  },
  incomeAmount:{
    fontSize: 24,
    color: 'green'
  },
  transactionDetailsModalContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  transactionDetailsModal:{
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  transactionDetailsModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  transactionDetailsModalLabel: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 10,
  },
  transactionDetailsModalInput: {
    flex: 2,
    height: 40,
    paddingLeft: 10,
    fontSize: 17
  },
  transactionDetailsModalText:{
    paddingTop: 12
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#315665',
    color: 'white',
    textAlign: 'center',
    borderRadius: 4,
  },
  searchBarContainer: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 40,
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  picker:{
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, 
  },
  deleteButton: {
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 10,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 24
  },
  deleteTransactionContainer:{
    alignItems: 'flex-end',
    marginBottom: 10
  }

});

  
export default DashboardTransactionList;