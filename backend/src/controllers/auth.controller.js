const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await password===user.password)) {
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

  console.log(username);

  try {
    const newUser=new User({
      username:username,
      password:password,
      email:email
    });

    const savedUser = await newUser.save();
    console.log("User Saved!", savedUser);
    res.json({ message: 'User saved successfully', user: savedUser });

  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Something went wrong.'})
  }
}

function logoutUser(req, res) {
  req.session.destroy();

  res.json({ message: 'Logout successful' });
}

module.exports = {
  createUser,
  loginUser,
  logoutUser,
};
