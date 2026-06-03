const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/auth/register
// @desc    تسجيل مستخدم جديد
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    تسجيل دخول المستخدم
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/auth/profile
// @desc    جلب بيانات المستخدم الحالي
// @access  Private
router.get("/profile", protect, getUserProfile);

module.exports = router;
