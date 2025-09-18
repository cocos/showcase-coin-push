
const win = window as any;

export const languages = {
    // Data
    "offlineRewardPanel": {
        "title": "离 线 奖 励",
        'double': '翻倍',
    },
    "gamePanel": {
        "freeGold": "免费金币",
        'shortGold': '金币不足',
    },
    "settingPanel": {
        "title": "设置",
        'languageChange': '切换语言',
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.zh = languages;