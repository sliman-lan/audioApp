const Track = require("../models/Track");
const { deleteFromCloudinary } = require("../services/uploadService");
const { v4: uuidv4 } = require("uuid");

// @desc    رفع مقطع صوتي جديد
// @route   POST /api/tracks/upload
// @access  Private
const uploadTrack = async (req, res) => {
    try {
        // الملف تم رفعه بواسطة Multer وبياناته في req.file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "الرجاء اختيار ملف صوتي",
            });
        }

        const { title, description, tags } = req.body;

        const track = await Track.create({
            user: req.user._id,
            title: title || "بدون عنوان",
            description: description || "",
            audioFileUrl: req.file.path, // رابط Cloudinary
            duration: 0, // يمكنك حسابه لاحقاً باستخدام مكتبة مثل music-metadata
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
            // نضيف public_id لتسهيل الحذف لاحقاً
            cloudinaryPublicId: req.file.filename,
        });

        res.status(201).json({
            success: true,
            data: track,
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل رفع المقطع الصوتي",
            error: error.message,
        });
    }
};

// @desc    جلب جميع مقاطع المستخدم الحالي
// @route   GET /api/tracks
// @access  Private
const getUserTracks = async (req, res) => {
    try {
        const tracks = await Track.find({ user: req.user._id }).sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            count: tracks.length,
            data: tracks,
        });
    } catch (error) {
        console.error("Get Tracks Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل جلب المقاطع",
            error: error.message,
        });
    }
};

// @desc    جلب مقطع واحد بواسطة ID
// @route   GET /api/tracks/:id
// @access  Private (أو Public إذا كان isPublic=true)
const getTrackById = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "المقطع غير موجود",
            });
        }

        // التحقق من الصلاحية: المستخدم هو المالك أو المقطع عام
        if (
            track.user.toString() !== req.user._id.toString() &&
            !track.isPublic
        ) {
            return res.status(403).json({
                success: false,
                message: "غير مصرح بالوصول إلى هذا المقطع",
            });
        }

        res.json({
            success: true,
            data: track,
        });
    } catch (error) {
        console.error("Get Track Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل جلب المقطع",
            error: error.message,
        });
    }
};

// @desc    تحديث بيانات المقطع (العنوان، الوصف، الوسوم، الحالة العامة)
// @route   PUT /api/tracks/:id
// @access  Private
const updateTrack = async (req, res) => {
    try {
        const { title, description, tags, isPublic } = req.body;

        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "المقطع غير موجود",
            });
        }

        // التأكد من أن المستخدم هو المالك
        if (track.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "غير مصرح بتعديل هذا المقطع",
            });
        }

        // تحديث الحقول
        track.title = title || track.title;
        track.description =
            description !== undefined ? description : track.description;
        track.isPublic = isPublic !== undefined ? isPublic : track.isPublic;
        if (tags) {
            track.tags = tags.split(",").map((tag) => tag.trim());
        }

        const updatedTrack = await track.save();

        res.json({
            success: true,
            data: updatedTrack,
        });
    } catch (error) {
        console.error("Update Track Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل تحديث المقطع",
            error: error.message,
        });
    }
};

// @desc    حذف مقطع صوتي
// @route   DELETE /api/tracks/:id
// @access  Private
const deleteTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "المقطع غير موجود",
            });
        }

        // التأكد من أن المستخدم هو المالك
        if (track.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "غير مصرح بحذف هذا المقطع",
            });
        }

        // حذف الملف من Cloudinary
        if (track.cloudinaryPublicId) {
            await deleteFromCloudinary(track.cloudinaryPublicId);
        }

        // حذف الوثيقة من قاعدة البيانات
        await track.deleteOne();

        res.json({
            success: true,
            message: "تم حذف المقطع بنجاح",
        });
    } catch (error) {
        console.error("Delete Track Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل حذف المقطع",
            error: error.message,
        });
    }
};

// @desc    إنشاء رابط مشاركة للمقطع
// @route   POST /api/tracks/:id/share
// @access  Private
const generateShareLink = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "المقطع غير موجود",
            });
        }

        if (track.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "غير مصرح بإنشاء رابط مشاركة لهذا المقطع",
            });
        }

        // توليد معرف فريد إذا لم يكن موجوداً
        if (!track.shareableId) {
            track.shareableId = uuidv4();
            await track.save();
        }

        const shareUrl = `${req.protocol}://${req.get("host")}/api/tracks/share/${track.shareableId}`;

        res.json({
            success: true,
            shareUrl,
            shareableId: track.shareableId,
        });
    } catch (error) {
        console.error("Share Link Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل إنشاء رابط المشاركة",
            error: error.message,
        });
    }
};

// @desc    الوصول إلى مقطع مشارك عبر الرابط (بدون تسجيل دخول)
// @route   GET /api/tracks/share/:shareableId
// @access  Public
const getSharedTrack = async (req, res) => {
    try {
        const track = await Track.findOne({
            shareableId: req.params.shareableId,
        });

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "المقطع غير موجود أو الرابط غير صالح",
            });
        }

        res.json({
            success: true,
            data: track,
        });
    } catch (error) {
        console.error("Get Shared Track Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل جلب المقطع المشترك",
            error: error.message,
        });
    }
};

module.exports = {
    uploadTrack,
    getUserTracks,
    getTrackById,
    updateTrack,
    deleteTrack,
    generateShareLink,
    getSharedTrack,
};
