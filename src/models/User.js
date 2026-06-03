const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "اسم المستخدم مطلوب"],
            unique: true,
            trim: true,
            minlength: [3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"],
        },
        email: {
            type: String,
            required: [true, "البريد الإلكتروني مطلوب"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "يرجى إدخال بريد إلكتروني صالح",
            ],
        },
        password: {
            type: String,
            required: [true, "كلمة المرور مطلوبة"],
            minlength: [6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"],
            select: false,
        },
        profilePicture: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

// ===== التعديل الأساسي هنا =====
// لا نستخدم وسيط "next" بل نعتمد على async/await فقط
userSchema.pre("save", async function () {
    // إذا لم تتغير كلمة المرور، لا تفعل شيئاً
    if (!this.isModified("password")) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        // في حالة حدوث خطأ، نرميه ليتم التقاطه من قبل Mongoose
        throw new Error("فشل تشفير كلمة المرور");
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
