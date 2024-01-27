const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    req.session.token = token;

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function createHash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
}

async function createUser(req, res) {
  const { username, password, email } = req.body;

  try {
    const hash = await createHash(password);

    const newUser = new User({
      username: username,
      password: hash,
      email: email,
    });

    const savedUser = await newUser.save();
    console.log('User Saved!', savedUser);
    res.json({ message: 'User saved successfully', user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
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
