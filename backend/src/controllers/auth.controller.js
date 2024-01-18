const jwt = require('jsonwebtoken');

// Mock user data (replace this with a database)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

function loginUser(req, res) {
  const { username, password } = req.body;

  // Check if user exists and credentials are valid (replace with database check)
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT token
  const token = jwt.sign({ userId: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });

  // Store the token in the session
  req.session.token = token;

  res.json({ message: 'Login successful', token });
}

function logoutUser(req, res) {
  // Destroy the session on logout
  req.session.destroy();

  res.json({ message: 'Logout successful' });
}

module.exports = {
  loginUser,
  logoutUser,
};
