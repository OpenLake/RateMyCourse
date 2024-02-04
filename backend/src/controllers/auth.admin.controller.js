const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function loginAdmin(req, res) {
  const { username, password } = req.body;

  try {
    const user = await Admin.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_ADMIN_SECRET_KEY,
      { expiresIn: '1h' }
    );

    req.session.token = token;
    req.session.adminType=user.type;

    // console.log(req.session);

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

async function createAdmin(req, res) {
  const { username, password, email } = req.body;

  try {
    const hash = await createHash(password);

    const newAdmin = new Admin({
      username: username,
      password: hash,
      email: email,
    });

    const savedAdmin = await newAdmin.save();
    console.log('Admin Saved!', savedAdmin);
    res.json({ message: 'Admin saved successfully', user: savedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}

function logoutAdmin(req, res) {
  req.session.destroy();

  res.json({ message: 'Logout successful' });
}

module.exports = {
  createAdmin,
  loginAdmin,
  logoutAdmin,
};
