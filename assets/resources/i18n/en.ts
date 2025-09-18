
const win = window as any;

export const languages = {
    // Data
    "offlineRewardPanel": {
        "title": "offline reward",
        'double': 'double',
    },
    "gamePanel": {
        "freeGold": "free gold",
        'shortGold': "You dont't have enough coins",
    },
    "settingPanel": {
        "title": "setting",
        'languageChange': 'switch the language',
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;