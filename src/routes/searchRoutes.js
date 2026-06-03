const express = require("express");
const router = express.Router();
const { unifiedSearch } = require("../services/musicApiService");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/search?q=...
// @desc    البحث عن فنانين وتسجيلات
// @access  Private
router.get("/", protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "يرجى توفير مصطلح البحث (q)",
            });
        }

        const results = await unifiedSearch(q);

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({
            success: false,
            message: "فشل البحث",
            error: error.message,
        });
    }
});

module.exports = router;
