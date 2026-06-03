const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "عنوان المقطع مطلوب"],
            trim: true,
            maxlength: [100, "العنوان لا يمكن أن يتجاوز 100 حرف"],
        },
        description: {
            type: String,
            maxlength: [500, "الوصف لا يمكن أن يتجاوز 500 حرف"],
        },
        // رابط الملف الصوتي المخزن في السحابة (Cloudinary أو S3)
        audioFileUrl: {
            type: String,
            required: [true, "الملف الصوتي مطلوب"],
        },
        // المدة الزمنية للمقطع بالثواني
        duration: {
            type: Number,
            default: 0,
        },
        // لتخزين بيانات الموجة الصوتية (Waveform) بصيغة JSON
        // مثلاً: { peaks: [0.1, 0.5, ...], duration: 30 }
        waveformData: {
            type: Object,
        },
        // هل المقطع عام (يمكن لأي شخص الوصول إليه عبر رابط المشاركة)؟
        isPublic: {
            type: Boolean,
            default: false,
        },
        // معرف فريد لإنشاء رابط المشاركة
        shareableId: {
            type: String,
            unique: true,
            sparse: true, // يسمح بقيم null دون تعارض مع unique
        },
        // وسوم لتصنيف المقطع
        tags: [String],
        cloudinaryPublicId: {
            type: String,
            required: true,
        },
    },

    {
        timestamps: true,
    },
);

// إضافة فهرس (Index) لتسريع البحث عن المقاطع حسب المستخدم
trackSchema.index({ user: 1, createdAt: -1 });

const Track = mongoose.model("Track", trackSchema);

module.exports = Track;
