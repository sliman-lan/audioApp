const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// تهيئة Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد تخزين Multer لرفع الملفات الصوتية إلى Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "audio-app-tracks", // اسم المجلد في Cloudinary
        resource_type: "auto", // يسمح برفع أي نوع ملف (فيديو/صوت)
        allowed_formats: ["mp3", "wav", "ogg", "m4a", "flac"],
        transformation: [{ quality: "auto" }], // تحسين الجودة تلقائياً
    },
});

// إنشاء Middleware للرفع (يدعم ملف واحد بحقل اسمه 'audio')
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // الحد الأقصى 50 ميجابايت
}).single("audio");

// دالة مساعدة لحذف ملف من Cloudinary باستخدام public_id
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        return true;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return false;
    }
};

module.exports = { upload, deleteFromCloudinary, cloudinary };
