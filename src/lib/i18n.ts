export type UILanguage = 'en' | 'id';

export interface UILanguageOption {
  id: UILanguage;
  label: string;
  flag: string;
  desc: string;
}

export const UI_LANGUAGE_OPTIONS: UILanguageOption[] = [
  { id: 'en', label: 'English', flag: '🇺🇸', desc: 'English (International)' },
  { id: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩', desc: 'Indonesian (Default)' },
];

export interface TranslationSchema {
  nav: {
    home: string;
    vocabulary: string;
    review: string;
    languages: string;
    settings: string;
    mainMenu: string;
    accountDetail: string;
    signOut: string;
    collapse: string;
    openSidebar: string;
  };
  settings: {
    title: string;
    subtitle: string;
    accountTitle: string;
    email: string;
    userId: string;
    languageTitle: string;
    themeTitle: string;
    light: string;
    dark: string;
    system: string;
    accentTitle: string;
    dailyGoalTitle: string;
    dailyGoalDesc: string;
    wordsPerDay: string;
    privacyTitle: string;
    privacyDesc: string;
  };
  modals: {
    signOutTitle: string;
    signOutDesc: string;
    confirmSignOut: string;
    cancel: string;
    deleteWordTitle: string;
    deleteWordDesc: (word: string) => string;
    confirmDelete: string;
    deleteLanguageTitle: string;
    deleteLanguageDesc: (name: string) => string;
  };
  review: {
    all: string;
    emptyTitle: string;
    emptyDesc: (status: string, flag: string, name: string) => string;
    reviewAll: (count: number) => string;
    viewVocabulary: string;
    singleReviewed: (word: string) => string;
    leveledUp: string;
    demoted: string;
    recognitionUpdated: string;
    recallUpdated: string;
    backToWord: string;
    practiceReverse: string;
    sessionComplete: string;
    sessionCompleteDesc: (count: number, flag: string, name: string) => string;
    promoted: string;
    kept: string;
    demotedStat: string;
    reviewAgain: string;
    switchDirection: string;
    wordProgress: (current: number, total: number) => string;
    shuffle: string;
    meaningLabel: string;
  };
  flashcard: {
    whatDoesWordMean: (langName: string) => string;
    showAnswer: string;
    pressSpaceOrClick: string;
    meaningTranslation: string;
    wordInLang: (langName: string) => string;
    listenPronunciation: string;
    repeatAgain: string;
    demoteStatus: string;
    keepInNew: string;
    keep: (status: string) => string;
    needsPractice: string;
    maintainMastered: string;
    easyLevelUp: string;
    completed: string;
  };
  status: {
    all: string;
    new: string;
    learning: string;
    familiar: string;
    strong: string;
    mastered: string;
  };
  vocabulary: {
    searchPlaceholder: string;
    allWords: string;
    sortRecentlyAdded: string;
    sortNextReview: string;
    sortRecentlyReviewed: string;
    sortAlphabetical: string;
    sortMostForgotten: string;
    sortCustom: string;
    addWord: string;
  };
  languages: {
    searchPlaceholder: string;
    addLanguage: string;
    noLanguagesFound: string;
    clearSearch: string;
  };
}

export const en: TranslationSchema = {
  nav: {
    home: 'Home',
    vocabulary: 'Vocabulary',
    review: 'Review',
    languages: 'Languages',
    settings: 'Settings',
    mainMenu: 'MAIN MENU',
    accountDetail: 'Account Details',
    signOut: 'Sign Out',
    collapse: 'Collapse sidebar',
    openSidebar: 'Open sidebar',
  },
  settings: {
    title: 'Settings & Profile',
    subtitle: 'Manage your appearance, language preferences, and daily learning targets.',
    accountTitle: 'Account Details',
    email: 'Account Email',
    userId: 'User ID',
    languageTitle: 'Language / Bahasa',
    themeTitle: 'Theme Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System Auto',
    accentTitle: 'Accent Color',
    dailyGoalTitle: 'Daily Review Target',
    dailyGoalDesc: 'How many words you aim to practice each day.',
    wordsPerDay: 'words/day',
    privacyTitle: 'Data Isolation & Privacy',
    privacyDesc: 'Your vocabulary collection, review history, and learning progress are strictly isolated to your authenticated session.',
  },
  modals: {
    signOutTitle: 'Sign out from Lingo Fox?',
    signOutDesc: 'Are you sure you want to end your current learning session? Your saved vocabulary and review progress remain safely synced.',
    confirmSignOut: 'Sign Out',
    cancel: 'Cancel',
    deleteWordTitle: 'Delete Vocabulary Word?',
    deleteWordDesc: (word) =>
      `Are you sure you want to delete "${word}"? This action cannot be undone and review history for this word will be removed.`,
    confirmDelete: 'Delete',
    deleteLanguageTitle: 'Remove Language?',
    deleteLanguageDesc: (name) =>
      `Are you sure you want to remove ${name}? All vocabulary under this language will be removed.`,
  },
  review: {
    all: 'All',
    emptyTitle: 'No Words in This Status',
    emptyDesc: (status, flag, name) =>
      `No vocabulary items currently in "${status}" for ${flag} ${name}.`,
    reviewAll: (count) => `Review All Words (${count})`,
    viewVocabulary: 'View Vocabulary',
    singleReviewed: (word) => `Word "${word}" has been successfully reviewed and updated.`,
    leveledUp: '(Leveled Up! 🎉)',
    demoted: '(Demoted)',
    recognitionUpdated: 'Recognition Practice (Reading) · Retention score updated',
    recallUpdated: 'Recall Practice (Production) · Retention score updated',
    backToWord: 'Back to Word Details',
    practiceReverse: 'Practice Reverse Direction ⇄',
    sessionComplete: 'Review Session Complete!',
    sessionCompleteDesc: (count, flag, name) =>
      `You have reviewed ${count} words in ${flag} ${name}.`,
    promoted: 'Promoted',
    kept: 'Kept',
    demotedStat: 'Demoted',
    reviewAgain: 'Review This Deck Again',
    switchDirection: 'Click to switch review direction',
    wordProgress: (current, total) => `Word ${current} of ${total}`,
    shuffle: 'Reshuffle card order',
    meaningLabel: 'Meaning',
  },
  flashcard: {
    whatDoesWordMean: (langName) => `What is this word in ${langName}?`,
    showAnswer: 'Show Answer',
    pressSpaceOrClick: 'Press Space or click card',
    meaningTranslation: 'Meaning / Translation',
    wordInLang: (langName) => `${langName} Word`,
    listenPronunciation: 'Listen to pronunciation',
    repeatAgain: 'Repeat Again',
    demoteStatus: 'Demote Status',
    keepInNew: 'Keep in New',
    keep: (status) => `Keep in ${status}`,
    needsPractice: 'Needs More Practice',
    maintainMastered: 'Maintain Mastered',
    easyLevelUp: 'Easy / Level Up!',
    completed: 'Completed',
  },
  status: {
    all: 'All',
    new: 'New',
    learning: 'Learning',
    familiar: 'Familiar',
    strong: 'Strong',
    mastered: 'Mastered',
  },
  vocabulary: {
    searchPlaceholder: 'Search vocabulary by word, meaning...',
    allWords: 'All Words',
    sortRecentlyAdded: 'Recently Added',
    sortNextReview: 'Review Priority',
    sortRecentlyReviewed: 'Recently Reviewed',
    sortAlphabetical: 'Alphabetical (A-Z)',
    sortMostForgotten: 'Most Forgotten',
    sortCustom: 'Custom Order',
    addWord: 'Add Word',
  },
  languages: {
    searchPlaceholder: 'Search languages by name...',
    addLanguage: 'Add Language',
    noLanguagesFound: 'No languages found matching your search',
    clearSearch: 'Clear search filter',
  },
};

export const id: TranslationSchema = {
  nav: {
    home: 'Beranda',
    vocabulary: 'Kosakata',
    review: 'Review',
    languages: 'Bahasa',
    settings: 'Pengaturan',
    mainMenu: 'MENU UTAMA',
    accountDetail: 'Detail Akun',
    signOut: 'Keluar',
    collapse: 'Ciutkan bilah samping',
    openSidebar: 'Buka bilah samping',
  },
  settings: {
    title: 'Pengaturan & Profil',
    subtitle: 'Kelola preferensi tema, bahasa antarmuka, dan target belajar harian Anda.',
    accountTitle: 'Detail Akun',
    email: 'Email Akun',
    userId: 'ID Pengguna',
    languageTitle: 'Language / Bahasa',
    themeTitle: 'Tampilan Tema',
    light: 'Terang',
    dark: 'Gelap',
    system: 'Sistem Otomatis',
    accentTitle: 'Warna Aksen',
    dailyGoalTitle: 'Target Review Harian',
    dailyGoalDesc: 'Berapa banyak kosakata yang ingin Anda latih setiap hari.',
    wordsPerDay: 'kata/hari',
    privacyTitle: 'Isolasi & Privasi Data',
    privacyDesc: 'Koleksi kosakata, riwayat review, dan perkembangan belajar Anda tersimpan secara aman dan terisolasi khusus untuk akun Anda.',
  },
  modals: {
    signOutTitle: 'Keluar dari Lingo Fox?',
    signOutDesc: 'Apakah Anda yakin ingin mengakhiri sesi belajar saat ini? Data kosakata dan progres review Anda tetap tersimpan dengan aman.',
    confirmSignOut: 'Keluar',
    cancel: 'Batal',
    deleteWordTitle: 'Hapus Kosakata Ini?',
    deleteWordDesc: (word) =>
      `Apakah Anda yakin ingin menghapus "${word}"? Tindakan ini tidak dapat dibatalkan dan riwayat review untuk kata ini akan dihapus.`,
    confirmDelete: 'Hapus',
    deleteLanguageTitle: 'Hapus Bahasa Ini?',
    deleteLanguageDesc: (name) =>
      `Apakah Anda yakin ingin menghapus ${name}? Semua kosakata dalam bahasa ini akan ikut terhapus.`,
  },
  review: {
    all: 'Semua',
    emptyTitle: 'Tidak Ada Kata di Status Ini',
    emptyDesc: (status, flag, name) =>
      `Belum ada kosakata di status "${status}" untuk ${flag} ${name}.`,
    reviewAll: (count) => `Review Semua Kata (${count})`,
    viewVocabulary: 'Lihat Kosakata',
    singleReviewed: (word) => `Kata "${word}" telah berhasil direview dan diperbarui.`,
    leveledUp: '(Naik Level! 🎉)',
    demoted: '(Mundur Level)',
    recognitionUpdated: 'Latihan Recognition (Reading) · Skor retensi diperbarui',
    recallUpdated: 'Latihan Recall (Production) · Skor retensi diperbarui',
    backToWord: 'Kembali ke Detail Kata',
    practiceReverse: 'Latih Arah Sebaliknya ⇄',
    sessionComplete: 'Sesi Review Selesai!',
    sessionCompleteDesc: (count, flag, name) =>
      `Anda telah mereview ${count} kata di ${flag} ${name}.`,
    promoted: 'Maju Status',
    kept: 'Tetap',
    demotedStat: 'Mundur',
    reviewAgain: 'Review Ulang Deck Ini',
    switchDirection: 'Klik untuk membalik arah review',
    wordProgress: (current, total) => `Kata ${current} dari ${total}`,
    shuffle: 'Acak ulang urutan kartu',
    meaningLabel: 'Arti',
  },
  flashcard: {
    whatDoesWordMean: (langName) => `Apa kata bahasa ${langName}-nya?`,
    showAnswer: 'Tampilkan Jawaban',
    pressSpaceOrClick: 'Tekan Spasi atau klik kartu',
    meaningTranslation: 'Arti / Terjemahan',
    wordInLang: (langName) => `Kata ${langName}`,
    listenPronunciation: 'Dengarkan pengucapan',
    repeatAgain: 'Ulangi Lagi',
    demoteStatus: 'Mundur Status',
    keepInNew: 'Tetap di New',
    keep: (status) => `Tetap ${status}`,
    needsPractice: 'Perlu Latihan Lagi',
    maintainMastered: 'Pertahankan Mastered',
    easyLevelUp: 'Sudah Gampang!',
    completed: 'Selesai',
  },
  status: {
    all: 'Semua',
    new: 'New',
    learning: 'Learning',
    familiar: 'Familiar',
    strong: 'Strong',
    mastered: 'Mastered',
  },
  vocabulary: {
    searchPlaceholder: 'Cari kosakata kata, arti...',
    allWords: 'Semua Kata',
    sortRecentlyAdded: 'Baru Ditambahkan',
    sortNextReview: 'Prioritas Review',
    sortRecentlyReviewed: 'Baru Direview',
    sortAlphabetical: 'Alfabetis (A-Z)',
    sortMostForgotten: 'Paling Sering Lupa',
    sortCustom: 'Urutan Manual',
    addWord: 'Tambah Kata',
  },
  languages: {
    searchPlaceholder: 'Cari bahasa berdasarkan nama...',
    addLanguage: 'Tambah Bahasa',
    noLanguagesFound: 'Tidak ada bahasa yang cocok dengan pencarian',
    clearSearch: 'Hapus filter pencarian',
  },
};

export function getTranslation(lang: UILanguage): TranslationSchema {
  return lang === 'id' ? id : en;
}

