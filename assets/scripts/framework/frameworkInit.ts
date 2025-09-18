import { Game, game, sys } from "cc";
import { AudioManager } from "./audioManager";
import { constant } from "./constant";
import { playerData } from "./playerData";
import * as i18n from '../../../extensions/i18n/assets/LanguageData'
import { StorageManager } from "./storageManager";

const frameworkInit = {
    /**
     * 框架代码初始化
     */
    init (exitsCb?: any) {
        //@ts-ignore
        if (window.cocosAnalytics) {
            //@ts-ignore
            window.cocosAnalytics.init({
                appID: "630610516",              // 游戏ID
                version: '1.0.0',           // 游戏/应用版本号
                storeID: sys.platform.toString(),     // 分发渠道
                engine: "cocos",            // 游戏引擎
            });
        }

        //存储数据处理
        playerData.instance.loadGlobalCache();
        if (!playerData.instance.userId) {
            playerData.instance.generateRandomAccount();
            console.log("###生成随机userId", playerData.instance.userId);
        }
        playerData.instance.loadFromCache();
        if (!playerData.instance.playerInfo || !playerData.instance.playerInfo.createDate) {
            playerData.instance.createPlayerInfo();
        }

        //音频初始化
        AudioManager.instance.init();

        //记录离线时间
        game.on(Game.EVENT_HIDE, () => {
            if (!playerData.instance.settings) {
                playerData.instance.settings = {};
            }

            exitsCb && exitsCb();

            playerData.instance.settings.hideTime = Date.now();
            playerData.instance.saveAll();
            StorageManager.instance.save();
        })
    },
}
export { frameworkInit };