const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization || req.cookies.token;
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  jwt.verify(token, process.env.JWT_ADMIN_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    req.user = decoded;

    next();
  });
}

function checkSuperAdmin(req, res, next) {
  // console.log(req.headers);

  const adminType = req.headers.admintype; 
  // console.log(adminType);
  if (adminType == 2) {
    next();
  } else {
    return res
      .status(401)
      .json({
        message: 'Unauthorized: Upgrade your privilege to perform this action, PEASANT.',
      });
  }
}


module.exports = {authenticateAdmin, checkSuperAdmin};
