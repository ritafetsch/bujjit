// Import required dependencies 
import React, { useState, useEffect } from 'react';
import {View,Modal,Text,TextInput,TouchableOpacity,Switch,Alert} from 'react-native';
import { StyleSheet,TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectCategoryOverlay from './SelectCategoryOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';



// AddTransactionOverlay.js
const AddTransactionOverlay = ({fetchTransactions , onTransactionAdded  }) => {
  // Define and initialize state variables using useState hooks 
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('expense');
  const [isRecurring, setIsRecurring] = useState(false);
  const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [currencies, setCurrencies] = useState([]); 
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [categorySelectorVisible, setCategorySelectorVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);


  // Function for fetching categories from the server
  const fetchCategories = async () => {
    try {
      // Get request to server for fetching categories 
      const response = await fetch('http://192.168.0.6:3000/categories');
      // Parse response body as JSON 
      const data = await response.json();
      // Set 'categories' variable to fetched category data 
      setCategories(data);
      // Else if error, set 'categories' variable to empty array
    } catch (error) {
      setCategories([]);
    }
  };

  // Function for validating form input 
  const validateForm = () => {
    // Set validation state to true by default 
    let formIsValid = true;
    // Initailize empty object for errors
    const errors = {};

    // If no amount input
    if (!amount) {
      // Update validation state to false 
      formIsValid = false;
      // Set amount errors method 
      errors.amount = 'Amount is required.';
      // Ensure amount can be parsed as a number
    } else if (isNaN(parseFloat(amount))) {
      formIsValid = false;
      errors.amount = 'Amount must be a number.';
    }
    // Ensure description isn't empty (trim removes whitespace)
    if (!description.trim()) {
      formIsValid = false;
      errors.description = 'Description is required.';
    }
    // Ensure category is not empty 
    if (!selectedCategory) {
      formIsValid = false;
      errors.selectedCategory = 'Category is required.';
    }
    // Update 'errors' state with validation errors if there is any (will otherwise still be empty)
    setErrors(errors);
    // Retuen boolean result of whether or not form is valid 
    return formIsValid;
  };

  // Function for reseting form fields 
  const resetForm = () => {
    setDescription('');
    setAmount('');
    setSelectedType('expense');
    setSelectedCategory(null);
    setSelectedDate(new Date());
    setIsRecurring(false);
    setSelectedCurrency('GBP');
  };
  
  // Function to toggle visibility of the Add Transaction modal 
  const toggleAddTransactionModal = () => {
    setAddTransactionModalVisible((prevVisible) => !prevVisible);
  };

  // Function to get user id from AsyncStorage
  const getUserIdFromUserData = async () => {
    try {
      // Retrieve userData as JSON from AsyncStorage
      const userDataJSON = await AsyncStorage.getItem('userData');
  
      if (userDataJSON) {
        // Parse JSON string to get the userData as object
        const userData = JSON.parse(userDataJSON);
        // Extract id from userData object
        const userId = userData.id;
        return userId;
      } else {
        // If user data not found
        console.error('User data not found in AsyncStorage.');
        return null;
      }
    } catch (error) {
      // Console.log error 
      console.error('Error while getting user ID:', error);
      return null;
    }
  };
    
  // Function for handling new transaction data submission
  const handleTransactionSubmit = async () => {
    // call function above to get user id 
    const userId = await getUserIdFromUserData();

    // Check if user is id obtained, if not handle error 
    if (!userId) {
      console.error('User ID not found in AsyncStorage.');
      return;
    }
    // Check if required fields are filled, if not send alert 
    if (!description.trim() || !amount || (!selectedCategory && !newCategoryName)) {
      Alert.alert('Error', 'Amount, Description, and Category are required fields.');
      return;
    }
    // Validate the form using function above
    if (validateForm()) {
      let categoryId;
      // Check if its a new category based on selected category data 
      if (selectedCategory && selectedCategory.id !== 'new') {
        // If an existing category is selected, set category id of existing selection 
        categoryId = selectedCategory.id;
      } else {
        // Else if it's a new category, you can either create a new category set temporary id to 'temp'
        categoryId = 'temp';
      }
      // Create newTrasaction object with all variables necessary and fetched 
      const newTransaction = {
        user_id: userId,
        amount: parseFloat(amount),
        description: description,
        transaction_type: selectedType,
        category_id: categoryId, 
        date: selectedDate.toISOString().slice(0, 10),
        is_recurring: isRecurring ? 1 : 0,
        currency_id: selectedCurrency,
      };
      // POST request to server to add new transaction
      try {
        const response = await fetch('http://192.168.0.6:3000/addTransaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTransaction),
        });
        const data = await response.json();
        // Flag new transaction added for other parts of app to update accordingly (value passed in from Dashboard as props)
        onTransactionAdded(newTransaction);
        // Set modal visible to false 
        setAddTransactionModalVisible(false);
        // Reset form
        resetForm();
        // Send alert that transaction has successible been updated 
        Alert.alert('Success', 'Transaction added successfully.');
        // Fetch updated transactions
        fetchTransactions();
  
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    } else {
      console.log('Form validation failed:', errors);
    }
  };
    
    
  // Function for updating 'categories' with the new category
  const handleCategoryAdd = (newCategory) => {
    setCategories([...categories, newCategory]);
  };
  // Function for setting 'selectedCategory' 
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Function for handlling date selection
  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setIsDatePickerVisible(false); 
  };

  // Function for fetching currencies from database 
  const fetchCurrencies = async () => {
    try {
      const response = await fetch('http://192.168.0.6:3000/currencies');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // If response ok, set 'currecies' to incoming data 
      setCurrencies(data);
    } catch (error) {
      // Else log error 
      console.error('Error fetching currencies:', error);
    }
  };

  useEffect(() => {
    // Fetch currencies and categories when component mounts
    fetchCurrencies();
    fetchCategories();
  }, []);
   
    return (
      <React.Fragment>
        {/* Modal for adding new transaction */}
        <Modal visible={addTransactionModalVisible} transparent animationType="fade" >
          {/* Toggle modal on add transaction button press */}
          <TouchableWithoutFeedback onPress={toggleAddTransactionModal}>
            <View style={styles.transactionDetailsModalContainer}>
              <View style={styles.transactionDetailsModal}>
                <View style={styles.selectionContainer}> 

                  {/* Reset form button */}
                  <TouchableOpacity style={styles.clearButton} onPress={resetForm}>
                    <Text style={styles.clearButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>

                {/* Input field for transaction amount */}
                <View style={styles.topModal}>
                  <View style={styles.formRow}>
                    <Text style={styles.addTransactionFieldTitle}>Amount:</Text>
                    <TextInput
                      style={styles.addTransactionInput}
                      placeholder="Enter amount..."
                      value={amount}
                      keyboardType="numeric"
                      // set amount state to value of input as it changes 
                      onChangeText={(text) => setAmount(text)}
                    />
                  </View>

                 {/* Input field for transaction description */}
                <View contentContainerStyle={styles.addTransactionForm}>
                  <View style={styles.formRow}>
                    <Text style={styles.addTransactionFieldTitle}>Description:</Text>
                    <TextInput
                      style={styles.addTransactionInput}
                      placeholder="Enter description..."
                      value={description}
                      // set description state to value of input as it changes 
                      onChangeText={(text) => setDescription(text)}
                    />
                    {errors.description && !isDescriptionFocused && (
                    <WarningMessage message={errors.description} />
                     )}
                </View>

                 {/* Input field for transaction type */}
                <View style={styles.formRow}>
                  <Text style={styles.addTransactionFieldTitle}>Type:</Text>
                  <TouchableOpacity
                     style={[
                      styles.dropdownButton,
                      styles.addTransactionInput,
                      // Use different styling based on whether it is expense or income 
                      selectedType === 'expense' ? styles.expenseBackground : styles.incomeBackground,
                    ]}
                    onPress={() => {
                      // Toggle selected type on press
                      setSelectedType(selectedType === 'expense' ? 'income' : 'expense');
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {/* Capitalise selected type */}
                      {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </View>

               {/* Input field for transaction category */}
              <View style={styles.formRow}>
                <Text style={styles.addTransactionFieldTitle}>Category:</Text>
                <TouchableOpacity
                  style={[styles.categoryInput, styles.addTransactionInput]}
                  onPress={() => setCategorySelectorVisible(true)}
                >
                  <Text style={styles.categoryTitle}>
                    {/* Holding text for category picker */}
                    {selectedCategory ? selectedCategory.name : 'Select a category'}
                  </Text>
                </TouchableOpacity>

                {/* Conditionally render select cateogory overlay and populate chosen category with picked result   */}
                <SelectCategoryOverlay
                  isVisible={categorySelectorVisible}
                  categories={categories}
                  setCategories={setCategories}
                  onClose={() => setCategorySelectorVisible(false)}
                  onCategorySelect={handleCategorySelect}
                  onCategoryAdd={handleCategoryAdd}
                />
              </View>
            
              {/* Input field for Date */}
              <View style={styles.formRow}>
                <Text style={styles.addTransactionFieldTitle}>Date:</Text>
                <TouchableOpacity 
                  onPress={() => setIsDatePickerVisible(true)}
                  style={styles.addTransactionInput}
                >
                  <View style={styles.dateInputContainer}>
                    {/* Format date rom picker */}
                    <Text style={styles.dateText}>{selectedDate.toISOString().slice(0, 10)}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Conditionally render the DateTimePicker and update date on change */}
                {isDatePickerVisible && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateSelection(date)}
                  />
                )}

              {/* Input field for transaction currency */}
              <View style={styles.formRow}>
                <Text style={styles.addTransactionFieldTitle}>Currency:</Text>
                <Picker
                  mode="dropdown"
                  selectedValue={selectedCurrency}
                  onValueChange={(value) => setSelectedCurrency(value)}
                  style={styles.addTransactionInput}
                >
                  {/* Fetch currencies as items for picker */}
                  {currencies.map((currency) => (
                    <Picker.Item key={currency.id} label={currency.code} value={currency.id} />
                  ))}
                </Picker>
              </View>

                 {/* Input field for transaction recurring */}
                <View style={styles.formRow}>
                  <Text style={styles.addTransactionFieldTitle}>Recurring:</Text>
                  <Switch
                    value={isRecurring}
                    onValueChange={(value) => setIsRecurring(value)}
                    style={[styles.switch, styles.addTransactionInput]}
                  />
                </View>
                </View>

                 {/* Add Transaction Submission Button */}
                <View style={styles.bottomModal}>
                  <TouchableOpacity style={styles.addTransactionButton} onPress={handleTransactionSubmit}>
                    <Text style={styles.addTransactionButtonText}>Add Transaction</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    


      {/* Sticky bar for adding transaction */}
      <View style={styles.stickyBar}>
        <TouchableOpacity style={styles.promptAddTransactionModalButton} onPress={toggleAddTransactionModal}>
          <Text style={styles.addTransactionText}>+</Text>
        </TouchableOpacity>
      </View>

    </React.Fragment>

    );
  };
  
export default AddTransactionOverlay;
  
// AddTransactionOverlay component styles 
export const styles = StyleSheet.create({
  transactionDetailsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  transactionDetailsModal: {
    flex: 1,
    width: '80%', 
    maxHeight: '60%', 
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addTransactionFieldTitle: {
    flex: 5,
    marginRight: 10,
    fontSize: 16,
  },
  addTransactionInput: {
    flex: 8,
    padding: 8,
    fontSize: 16,
  },
  categoryInput:{
    fontSize: 20
  },
  addTransactionButton: {
    backgroundColor: '#15203d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addTransactionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  promptAddTransactionModalButton: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(35,53,101,255)', 
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 25, 
    alignSelf: 'center',
    elevation: 5,
  },
  addTransactionText:{
    fontSize: 30,
    color: 'white'
  }, 
  dropdownButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    marginLeft: 'auto',
  },
  stickyBar: {
    height: 50,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  warningContainercontainer: {
    backgroundColor: '#ffe6e6', 
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  warningText: {
    color: 'red',
  },
  expenseBackground:{
    backgroundColor: '#Ffe5e5'
  },
  incomeBackground:{
    backgroundColor: '#E5ffe5'
  },
  clearButton: {
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    width: '22%'
  },
  clearButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectionContainer:{
    alignItems: 'flex-end'
  }
});