const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.headers.authorization || req.cookies.token;
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Attach the decoded user information to the request for later use
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  });
}

module.exports = authenticateUser;
