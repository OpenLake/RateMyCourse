const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser'); 
const authRoutes = require('./src/routes/auth.routes'); 

const app = express();

// Use sessions to track authentication state
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
}));

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Additional middleware can be added here

// Use the authentication routes
app.use('/auth', authRoutes);

// Add any additional middleware and routes as needed

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
