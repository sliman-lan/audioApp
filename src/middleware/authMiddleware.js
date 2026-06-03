const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // التحقق من وجود الرمز في ترويسة Authorization
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // استخراج الرمز
            token = req.headers.authorization.split(" ")[1];

            // فك تشفير الرمز والتحقق منه
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // جلب بيانات المستخدم (بدون كلمة المرور)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                res.status(401);
                throw new Error("المستخدم غير موجود");
            }

            next();
        } catch (error) {
            if (error && error.name === "TokenExpiredError") {
                console.warn("JWT expired:", error.expiredAt);
                return res
                    .status(401)
                    .json({ success: false, message: "الرمز منتهي الصلاحية" });
            }

            console.error(error);
            return res
                .status(401)
                .json({ success: false, message: "غير مصرح، رمز غير صالح" });
        }
    }

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "غير مصرح، لا يوجد رمز" });
    }
};

module.exports = { protect };
