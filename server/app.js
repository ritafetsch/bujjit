// Import required dependences 
const express = require('express');
const app = express();
// Set port for app to run on 
const port = 3000; 
const bodyParser = require('body-parser');

// Setup middleware for json parsing
app.use(express.json());
app.use(bodyParser.json());

// Import sqlite3
const sqlite3 = require('sqlite3').verbose();

// Define path to database file
const databasePath = './db/bujjit.db'; 
// Create new instance
const db = new sqlite3.Database(databasePath);

// Get endpoint for root path
app.get('/', (req, res) => {
  // Fetch first entry from transactions table 
  db.all('SELECT * FROM Transactions LIMIT 1', (err, rows) => {
    if (err) {
      console.error('Error fetching data from the database:', err);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    } else {
      res.json(rows);
    }
  });
});

// Post enpoint for login path 
app.post('/login', (req, res) => {
  // Get usernmae and password from request body
  const { username, password } = req.body;
  // Query database to check if username and password match any entries 
  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      // If matching record found
      if (row) {
        // Send a success response along with the user data
        return res.json({ authenticated: true, userData: row });
      } else {
        return res.json({ authenticated: false });
      }
    }
  );
});

// Post endpoint for register path
app.post('/register', (req, res) => {
  // Get user registration data from request body 
  const { username, email, password, defaultCurrency } = req.body;
  // Check if any required fields are missing
  if (!username || !email || !password || !defaultCurrency) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  // Check if a user with the entered email already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    // If user match, return error that email is already taken
    if (row) {
      return res.status(409).json({ error: 'Email already taken' });
    }
    // Insert new user into the database using incoming values from form
    db.run(
      'INSERT INTO users (username, email, password, default_currency) VALUES (?, ?, ?, ?)',
      [username, email, password, defaultCurrency],
      (err) => {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        // If registration successful, success true
        res.json({ success: true });
      }
    );
  });
});


// Get endpoint for fetching all transactions
app.get('/transactions', (req, res) => {
  const query = 'SELECT * FROM Transactions;';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Error fetching transactions.' });
    } else {
      res.json(rows);
    }
  });
});

// Get endpoint for fetching a single transaction based on id
app.get('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Transactions WHERE id = ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Error fetching the transaction.' });
    } else {
      if (row) {
        res.json(row);
      } else {
        res.status(404).json({ error: 'Transaction not found.' });
      }
    }
  });
});

// Put endpoint for updating transaction based on id
app.put('/transactions/:id', (req, res) => {
  // Get data from req, params 
  const { id } = req.params;
  const { description, amount, transaction_type, category_id, date, is_recurring, currency_id } = req.body;
  // Update transaction using sql statement 
  const updateQuery = `
    UPDATE Transactions
    SET description = ?, amount = ?, transaction_type = ?, category_id = ?, date = ?, is_recurring = ?, currency_id = ?
    WHERE id = ?;
  `;
  // Run the query to update transaction with data from above
  db.run(
    updateQuery,
    [description, amount, transaction_type, category_id, date, is_recurring, currency_id, id],
    (err) => {
      if (err) {
        console.error('Error updating the transaction:', err.message);
        res.status(500).json({ error: 'Error updating the transaction.' });
      } else {
        res.json({ message: 'Transaction updated successfully.' });
      }
    }
  );
});

// Delete endpoint for transaction based on id
app.delete('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM Transactions WHERE id = ?;';
  db.run(deleteQuery, [id], (err) => {
    if (err) {
      console.error('Error deleting the transaction:', err.message);
      res.status(500).json({ error: 'Error deleting the transaction.' });
    } else {
      res.json({ message: 'Transaction deleted successfully.' });
    }
  });
});

// Get endpoint for getting all category data 
app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM Categories';
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return list of all category data 
      res.json(rows);
    }
  });
});

// Get endpoint for getting a category based on id
app.get('/categories/:id', (req, res) => {
  // Parse category id from request parameters 
  const category_id = parseInt(req.params.id);
  // Check if category id is a valid integer
  if (Number.isNaN(category_id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  // Rnu query to retrieve category with given id 
  const sql = 'SELECT * FROM Categories WHERE id = ?';
  db.get(sql, [category_id], (err, row) => {
    if (err) {
      console.error('Error fetching category data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (row) {
      // If category found, send category data in response
      res.json(row);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  });
});

// Post endpoint for adding a new category 
app.post('/categories', (req, res) => {
  // Get name and color from request
  const { name, color } = req.body;
  // Make sure name and color are both present, else send json error response 
  if (!name || !color) {
    return res.status(400).json({ error: 'Both name and color are required for a new category.' });
  }
  //Run database query to insert new category into database using following sql statement
  const insertQuery = 'INSERT INTO Categories (name, color) VALUES (?, ?)';
  db.run(insertQuery, [name, color], function (err) {
    if (err) {
      console.error('Error inserting new category:', err.message);
      return res.status(500).json({ error: 'Failed to add the new category.' });
    }
    // Get id of newly inserted category 
    const categoryId = this.lastID;

    // Fetch newly inserted category from database and send in response
    const selectQuery = 'SELECT * FROM Categories WHERE id = ?';
    db.get(selectQuery, [categoryId], (err, row) => {
      if (err) {
        console.error('Error fetching the new category from the database:', err.message);
        return res.status(500).json({ error: 'Failed to fetch the new category.' });
      }
      // If category added successfully, send new category data in response
      res.json(row);
    });
  });
});


// Get endpoint for fetchin user data based on user id 
app.get('/users/:user_id', async (req, res) => {
  try {
    // Get user id from request parameters
    const { user_id } = req.params;
    // Run query using database using paramaterized sql statement 
    const query = 'SELECT * FROM users WHERE id = ?';
    // use Promise for asynchonous nature
    const user = await new Promise((resolve, reject) => {
      db.get(query, [user_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user from the database:', error);
    res.status(500).json({ error: 'Failed to fetch user from the database' });
  }
});

// Put endpoint for updating user data based on user id 
app.put('/users/:user_id', (req, res) => {
  // Get user id from request params 
  const { user_id } = req.params;
  // Get variables for user data from request body
  const { username, email, password, default_currency } = req.body;
  // Run query using sql paramaterized sql statement 
  const query = 'UPDATE users SET username = ?, email = ?, password = ?, default_currency = ? WHERE id = ?';
  const values = [username, email, password, default_currency, user_id];
  db.run(query, values, (err) => {
    if (err) {
      console.error('Error updating user data in the database:', err);
      res.status(500).json({ error: 'Failed to update user data in the database' });
    } else {
      res.json({ message: 'User data updated successfully' });
    }
  });
});

// Get request fetching list of currencies 
app.get('/currencies', (req, res) => {
  // Run query using sql statement 
  const query = 'SELECT * FROM Currencies;';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ err: 'Error fetching currencies.' });
    } else {
      res.json(rows);
    }
  });
});

// Delete request for deleting a category based on category id 
app.delete('/categories/:id', (req, res) => {
  // Get id from request params
  const categoryId = req.params.id;
  // Run query using paramaterized sql to obtain entry with incoming id and delete it
  const deleteQuery = 'DELETE FROM Categories WHERE id = ?';
  db.run(deleteQuery, [categoryId], (err) => {
    if (err) {
      console.error('Error deleting category:', err.message);
      res.status(500).json({ error: 'Error deleting category.' });
    } else {
      res.json({ message: 'Category deleted successfully.' });
    }
  });
});

// Post request for adding a transaction 
app.post('/addTransaction', (req, res) => {
  // Get transaction variables from request body 
  const {user_id,amount,description,transaction_type,category_id,date,is_recurring,currency_id,} = req.body;
  // Use obtained data for running paramaterized query 
  const insertQuery = `
    INSERT INTO Transactions (user_id, amount, description, transaction_type, category_id, date, is_recurring, currency_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;
  db.run(
    insertQuery,
    [user_id, amount, description, transaction_type, category_id, date, is_recurring, currency_id],
    (err) => {
      if (err) {
        console.error('Error inserting new transaction into the database:', err);
        return res.status(500).json({ error: 'Error adding new transaction.' });
      }
      res.json({ success: true });
    }
  );
});

// Get request for fetching summary data based on year and month
app.get('/summary/:year/:month', (req, res) => {
  // Get year and month from request params 
  const { year, month } = req.params;
  // Convert selected month to the start and end date of the month
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  // Queries for fetching the different summary data requirements using aliases 
  const incomeQuery = 'SELECT c.name as category_name, SUM(t.amount) as total FROM Transactions t JOIN Categories c ON t.category_id = c.id WHERE t.transaction_type = "income" AND t.date BETWEEN ? AND ? GROUP BY t.category_id';
  const fixedExpenseQuery = 'SELECT c.name as category_name, SUM(t.amount) as total FROM Transactions t JOIN Categories c ON t.category_id = c.id WHERE t.transaction_type = "expense" AND t.is_recurring = 1 AND t.date BETWEEN ? AND ? GROUP BY t.category_id';
  const variableExpenseQuery = 'SELECT c.name as category_name, SUM(t.amount) as total FROM Transactions t JOIN Categories c ON t.category_id = c.id WHERE t.transaction_type = "expense" AND t.is_recurring = 0 AND t.date BETWEEN ? AND ? GROUP BY t.category_id';

  // Execute query for income data 
  db.all(incomeQuery, [startDate.toISOString(), endDate.toISOString()], (err, incomeData) => {
    if (err) {
      console.error('Error fetching income data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  // Execute query for fixed expense data 
  db.all(fixedExpenseQuery, [startDate.toISOString(), endDate.toISOString()], (err, fixedExpenseData) => {
    if (err) {
      console.error('Error fetching fixed expense data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  // Execute query for variable expense data 
  db.all(variableExpenseQuery, [startDate.toISOString(), endDate.toISOString()], (err, variableExpenseData) => {
    if (err) {
      console.error('Error fetching variable expense data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Combine fetched data/ calculate totals for each section
    const summaryData = {
      monthlyNetIncome: incomeData,
      fixedMonthlyExpenses: fixedExpenseData,
      variableMonthlyExpenses: variableExpenseData,
      totalMonthlyIncome: incomeData.reduce((total, item) => total + item.total, 0),
      totalFixedBills: fixedExpenseData.reduce((total, item) => total + item.total, 0),
      totalVariableExpenses: variableExpenseData.reduce((total, item) => total + item.total, 0),
    };
    // return json response data 
    res.json(summaryData);
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
