const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const SECRET = "secretkey";

// EMAIL SETUP (temporary)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password"
  }
});

// PASSWORD VALIDATION
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Weak password" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  const user = new User({
    email,
    password: hashed,
    verificationToken: token
  });

  await user.save();

  const url = `http://localhost:5000/api/auth/verify/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Verify Email",
    html: `<a href="${url}">Verify</a>`
  });

  res.json({ message: "Verification email sent" });
});

// VERIFY
router.get("/verify/:token", async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });

  if (!user) return res.send("Invalid token");

  user.isVerified = true;
  user.verificationToken = null;

  await user.save();

  res.send("Email verified!");
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (!user.isVerified) {
    return res.status(400).json({ message: "Verify email first" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});

module.exports = router;