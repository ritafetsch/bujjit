// Import required dependencies 
import React , {useEffect, useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DashboardSummary = ({ transactions }) => {
  // Define total income and expense state varibles 
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Function for getting current month 
  const getMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const todaysDate = new Date();
    return months[todaysDate.getMonth()];
  };
  
  // useEffect hook for calculating totals when transactions change so Dashboard can be updated 
  useEffect(() => {
    // Filter transactions by income / expense 
    const incomeTransactions = transactions.filter(
      (transaction) => transaction.transaction_type === 'income'
    );
    const expenseTransactions = transactions.filter(
      (transaction) => transaction.transaction_type === 'expense'
    );

    // Calculate total income / expense by summing amounts
    const totalIncomeAmount = incomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,0);
    const totalExpenseAmount = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,0);

    // Update state variables with calculations 
    setTotalIncome(totalIncomeAmount);
    setTotalExpense(totalExpenseAmount);
  }, [transactions]);

  // Calcuate balance by getting difference 
  const balance = totalIncome - totalExpense;

  // Render summary data 
  return (
    <View style={styles.monthlySummaryContainer}>
      {/* Get title of the current month */}
      <Text style={styles.sumTitle}>{getMonth()}</Text>

      
      <View style={styles.summaryContainer}>
        {/* Total income */}
        <View style={styles.incomeSummary}>
          <View style={styles.topSummary}>
            <Text style={styles.summaryHeading}>Income</Text>
          </View>
          <View style={styles.bottomSummary}>
            <Text style={styles.summaryValue}>{totalIncome.toFixed(2)} GBP</Text>
          </View>
        </View>
         {/* Total expense */}
        <View style={styles.expenseSummary}>
          <View style={styles.topSummary}>
            <Text style={styles.summaryHeading}>Expenses</Text>
          </View>
          <View style={styles.bottomSummary}>
            <Text style={styles.summaryValue}>{totalExpense.toFixed(2)} GBP</Text>
          </View>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Balance:</Text>
        <Text style={styles.balanceAmount}> {balance.toFixed(2)} GBP</Text>
      </View>
    </View>
  );
};
  
// DashboardSummary component styles 
const styles = StyleSheet.create({
monthlySummaryContainer:{
    width: '100%',
  },
  sumTitle:{
    fontSize: 40,
    paddingHorizontal: 20,
    paddingVertical:20,
  },
  summaryContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSummary:{
    paddingLeft: 10,
    alignItems: 'flex-start',
  }, 
  bottomSummary:{
    alignItems: 'center',
  },
  expenseSummary:{
    backgroundColor: '#Ffe5e5',
    borderRadius: 10,
    marginLeft: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    width: '45%',
  },
  incomeSummary:{
    backgroundColor: '#E5ffe5',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    width: '45%'
  },
  summaryHeading: {
    fontSize: 18,
  },
  summaryValue: {
    fontSize: 22,
    marginTop: 20,
  },
  balanceContainer:{
    flex:1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 20, 
  },
  balanceTotalContainer:{
    width: '100%',
    alignItems: 'flex-end',  
  },
  balanceTitle: {
    fontSize: 25,
  },
  balanceAmount:{
    paddingTop: 10,
    fontSize: 30,
    fontWeight: 'bold'
  },
});

export default DashboardSummary;