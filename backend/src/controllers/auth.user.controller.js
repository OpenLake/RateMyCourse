const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otp.model");
const { sendVerificationEmail } = require("../../utils/mailSender");

const saltRounds = 10;

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_USER_SECRET_KEY,
      { expiresIn: "1h" }
    );

    req.session.token = token;

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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

async function sendOTPForNewUser(req, res) {
  const { email } = req.body;

  try {
    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });
    // If user found with provided email
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User is already registered",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function createUser(req, res) {
  const { username, password, email, otp } = req.body;

  try {
    // Verify OTP
    const otpDocument = await OTP.findOne({ email, otp });
    if (!otpDocument) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Create user if OTP is valid
    const hash = await createHash(password);

    const newUser = new User({
      username: username,
      password: hash,
      email: email,
    });

    const savedUser = await newUser.save();
    console.log("User Saved!", savedUser);
    res.json({ message: "User saved successfully", user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
}

function logoutUser(req, res) {
  req.session.destroy();

  res.json({ message: "Logout successful" });
}

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  sendOTPForNewUser,
};
