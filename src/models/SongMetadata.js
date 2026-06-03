const mongoose = require("mongoose");

const songMetadataSchema = new mongoose.Schema(
    {
        // رابط اختياري لنموذج Track إذا أراد المستخدم ربط تسجيله بمعلومات أغنية موجودة
        track: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Track",
        },
        // المعرف الفريد من MusicBrainz
        musicbrainzId: {
            type: String,
            unique: true,
            sparse: true,
        },
        // المعرف من TheAudioDB (إن وجد)
        theaudiodbId: {
            type: String,
        },
        title: {
            type: String,
            required: true,
        },
        artist: {
            type: String,
            required: true,
        },
        album: {
            type: String,
        },
        albumArtUrl: {
            type: String,
        },
        // سنة الإصدار
        year: {
            type: String,
        },
        // النوع الموسيقي (Genre)
        genre: {
            type: String,
        },
        // لتخزين أي بيانات إضافية من API (ككائن JSON)
        rawData: {
            type: Object,
        },
    },
    {
        timestamps: true,
    },
);

// فهرس لتسريع البحث عن طريق اسم الأغنية والفنان
songMetadataSchema.index({ title: "text", artist: "text" });

const SongMetadata = mongoose.model("SongMetadata", songMetadataSchema);

module.exports = SongMetadata;
