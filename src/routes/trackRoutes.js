const express = require("express");
const router = express.Router();
const {
    uploadTrack,
    getUserTracks,
    getTrackById,
    updateTrack,
    deleteTrack,
    generateShareLink,
    getSharedTrack,
} = require("../controllers/trackController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../services/uploadService");

// ملاحظة: مسار المشاركة العامة يجب أن يكون قبل المسارات المحمية التي تبدأ بـ /:id
router.get("/share/:shareableId", getSharedTrack);

// المسارات المحمية
router.use(protect); // جميع المسارات التالية تتطلب تسجيل دخول

router.post("/upload", upload, uploadTrack);
router.get("/", getUserTracks);
router.get("/:id", getTrackById);
router.put("/:id", updateTrack);
router.delete("/:id", deleteTrack);
router.post("/:id/share", generateShareLink);

module.exports = router;
