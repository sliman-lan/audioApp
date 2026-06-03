const axios = require("axios");
const { MusicBrainzApi } = require("musicbrainz-api");

// تهيئة MusicBrainz API مع معلومات التطبيق (مطلوب للاستخدام المسؤول)
const mbApi = new MusicBrainzApi({
    appName: "MyAudioApp",
    appVersion: "1.0.0",
    appContactInfo: process.env.APP_CONTACT_EMAIL || "user@example.com",
});

// مفتاح TheAudioDB (يمكنك الحصول عليه مجاناً من موقعهم)
const AUDIO_DB_API_KEY = process.env.AUDIODB_API_KEY || "2"; // المفتاح الافتراضي للاختبار '2'

/**
 * البحث في TheAudioDB عن فنان
 */
const searchArtistAudioDB = async (artistName) => {
    try {
        const response = await axios.get(
            `https://www.theaudiodb.com/api/v1/json/${AUDIO_DB_API_KEY}/search.php?s=${encodeURIComponent(artistName)}`,
        );
        return response.data.artists || [];
    } catch (error) {
        console.error("TheAudioDB Error:", error.message);
        return [];
    }
};

/**
 * البحث في TheAudioDB عن ألبوم
 */
const searchAlbumAudioDB = async (albumName) => {
    try {
        const response = await axios.get(
            `https://www.theaudiodb.com/api/v1/json/${AUDIO_DB_API_KEY}/searchalbum.php?a=${encodeURIComponent(albumName)}`,
        );
        return response.data.album || [];
    } catch (error) {
        console.error("TheAudioDB Error:", error.message);
        return [];
    }
};

/**
 * البحث في MusicBrainz عن تسجيل (Recording) أو فنان
 */
const searchMusicBrainz = async (query, type = "recording") => {
    try {
        const result = await mbApi.search(type, { query });
        return result[`${type}s`] || [];
    } catch (error) {
        console.error("MusicBrainz Error:", error.message);
        return [];
    }
};

/**
 * خدمة بحث موحدة تجمع النتائج من المصدرين
 */
const unifiedSearch = async (query) => {
    const [audioDBArtists, mbRecordings] = await Promise.all([
        searchArtistAudioDB(query),
        searchMusicBrainz(query, "recording"),
    ]);

    return {
        artists: audioDBArtists,
        recordings: mbRecordings.slice(0, 10), // نحدد النتائج لتجنب الكم الكبير
    };
};

module.exports = {
    searchArtistAudioDB,
    searchAlbumAudioDB,
    searchMusicBrainz,
    unifiedSearch,
};
