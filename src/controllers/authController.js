const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "المستخدم موجود مسبقاً بهذا البريد أو اسم المستخدم",
            });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: error.message,
        });
    }
};

// @desc    تسجيل دخول المستخدم
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "بيانات الدخول غير صحيحة",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "بيانات الدخول غير صحيحة",
            });
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: error.message,
        });
    }
};

// @desc    جلب بيانات المستخدم الحالي
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: error.message,
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
