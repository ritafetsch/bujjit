// Import required dependencies 
import React, { useEffect, useState }from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView} from 'react-native';
import Navigation from './Navigation';
import { Picker } from '@react-native-picker/picker';

const Summary = ({navigation}) => {

  // Define and initalize summary data state variable
  const [summaryData, setSummaryData] = useState({
    monthlyNetIncome: [],
    fixedMonthlyExpenses: [],
    variableMonthlyExpenses: [],
    totalMonthlyIncome: 0,
    totalFixedBills: 0,
    totalVariableExpenses: 0,
  });

  // Get current date data 
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  // Add 1 to month - zero based
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const initialMonth = `${currentMonth}`;
  const initialYear = String(currentYear);
  // Store month data 
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  // Store year data
  const years = [
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
  ];
  // Define and initalize state variables with current month and year
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  // Function for fetching summary data 
  const fetchSummaryData = async (selectedMonth) => {
    try {
      // GET request for fetching summary data bsaed on selected year and month
      const response = await fetch(`http://192.168.0.6:3000/summary/${selectedYear}/${selectedMonth}`);
      const data = await response.json();
      // Update summaryData with fetched data
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  useEffect(() => {
    // fetch summary data based on selected month and year
    fetchSummaryData(selectedMonth);
  }, [selectedMonth, selectedYear]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" /> 
      <View style={styles.container}>
          {/* Nav Section */}
          <Navigation navigation={navigation} />
          <ScrollView showsVerticalScrollIndicator={false}> 
          {/* Month Picker Section */}
          <View style={styles.monthPickerContainer}>
            {/* Render MonthPicker component */}
            <View style={styles.pickerOuterContainer}>
              <View style={styles.pickerContainer}>
                <View style={styles.picker}>
                  <Picker
                    // Set selected value to selected month
                    selectedValue={selectedMonth} 
                    // Update month on value change from picker
                    onValueChange={(month) => {
                      setSelectedMonth(month); 
                      // Fetch summary data for newly selected month
                      fetchSummaryData(`${selectedYear}-${month}`); 
                      }}
                    >
                    {/* Render list of months for selection */}
                    {months.map((month) => (
                      <Picker.Item key={month.value} label={month.label} value={month.value} />
                    ))}
                </Picker>
                </View>
                <View style={styles.picker}>
                  <Picker
                    // Set selected value to selected year 
                    selectedValue={selectedYear}
                    // Update year on value change from picker
                    onValueChange={(year) => {
                      setSelectedYear(year);
                      // Fetch summary data for newly selected year / construct date string in yyyy-mm format
                      fetchSummaryData(`${year}-${selectedMonth.substring(5)}`); 
                    }}
                  >
                    {/* Reder list of years for selection */}
                    {years.map((year) => (
                      <Picker.Item key={year.value} label={year.label} value={year.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

          </View>
          {/* Display selected month */}
          <Text style={styles.selectedMonthText}>{months.find((m) => m.value === selectedMonth)?.label} {selectedYear}</Text>

          {/* Render the summary data */}
          {summaryData && (
        
          <View style={styles.summaryContainer}>
          {/* Monthly net income */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>MONTHLY NET INCOME</Text>
            <View style={styles.listContainer}>
              {/* Render list of monthly net income */}
              {summaryData.monthlyNetIncome.map((item) => (
                <View key={item.category_name} style={styles.itemContainer}>
                  <Text style={[styles.categoryName, styles.transactionDataText]}>{item.category_name}</Text>
                  <Text style={[styles.total, styles.transactionDataText]}>{item.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.line} />
            {/* Display total monthly income */}
            <Text style={styles.sectionTotal}>TOTAL MONTHLY INCOME</Text>
            <View style={styles.totalsContainer}>
              <Text style={styles.sectionTotalText}>{summaryData.totalMonthlyIncome.toFixed(2)}</Text>
            </View>
          </View>

          {/* Fixed Monthly expenses */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>FIXED MONTHLY EXPENSES</Text>
            <View style={styles.listContainer}>
              {/* Render list of fixed monthly expenses */}
              {summaryData.fixedMonthlyExpenses.map((item) => (
                <View key={item.category_name} style={styles.itemContainer}>
                  <Text style={[styles.categoryName, styles.transactionDataText]}>{item.category_name}</Text>
                  <Text style={[styles.total, styles.transactionDataText]}>{item.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.line} />
            {/* Display total fixed bills */}
            <Text style={styles.sectionTotal}>TOTAL FIXED BILLS</Text>
            <View style={styles.totalsContainer}>
              <Text style={styles.sectionTotalText}>{summaryData.totalFixedBills.toFixed(2)}</Text>
            </View>
          </View>

          {/* Variable monthly expenses */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>VARIABLE MONTHLY EXPENSES</Text>
            <View style={styles.listContainer}>
              {/* Render list of variable monthly expenses */}
              {summaryData.variableMonthlyExpenses.map((item) => (
                <View key={item.category_name} style={styles.itemContainer}>
                  <Text style={[styles.categoryName, styles.transactionDataText]}>{item.category_name}</Text>
                  <Text style={[styles.total, styles.transactionDataText]}>{item.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.line} />
            {/* Display total variable expenses */}
            <Text style={styles.sectionTotal}>TOTAL VARIABLE EXPENSES</Text>
            <View style={styles.totalsContainer}>
              <Text style={styles.sectionTotalText}>{summaryData.totalVariableExpenses.toFixed(2)}</Text>
            </View>
          </View>

          {/* Total monthly expenses */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>TOTAL MONTHLY EXPENSES</Text>
            <View style={styles.finalTotal}> 
              <Text style={styles.finalTotalsText}> {(summaryData.totalFixedBills + summaryData.totalVariableExpenses).toFixed(2)}</Text>
            </View>
          </View>

          {/* Net savings */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>INCOME - EXPENSES = NET SAVINGS / LOSS</Text>
            <View  style={styles.finalTotal}>
              <Text style={styles.finalTotalsText}>{(summaryData.totalMonthlyIncome - (summaryData.totalFixedBills + summaryData.totalVariableExpenses)).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Summary;
// Summary component styles 
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  pickerOuterContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignItems: 'flex-start',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',    
    width: '100%',
    marginBottom: 40,
    marginTop: 30
  },
  picker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 5,
    overflow: 'hidden'
  },
  selectedMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  summaryContainer: {
    marginVertical: 16,
  },
  sectionContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  totalsContainer:{
    alignItems: 'flex-end',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%', 
    padding: 10
  },
  categoryName: {
    flex: 1,
    color: 'blue',
  },
  total: {
    flex: 1,
    textAlign: 'right',
    color: 'green',
  },
  transactionDataText:{
    fontSize: 20
  },
  finalTotalsText:{
    fontSize: 22, 
  }, 
  finalTotal:{
    alignItems: 'flex-end'
  },
  sectionTotalText:{
    fontSize: 20
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    width: '85%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
});