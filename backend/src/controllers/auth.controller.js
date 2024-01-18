const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    // Check if user exists and credentials are valid (replace with database check)
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Store the token in the session
    req.session.token = token;

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function createUser(req,res){
  const {username, password, email}=req.body;

  try {
    
  } catch (error) {
    console.log(error);
    res.status(500).json({message: ''})
  }
}

function logoutUser(req, res) {
  req.session.destroy();

  res.json({ message: 'Logout successful' });
}

module.exports = {
  loginUser,
  logoutUser,
};
