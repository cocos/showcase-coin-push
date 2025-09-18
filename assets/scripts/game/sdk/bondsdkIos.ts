
import { _decorator, Component, Node } from 'cc';
import { uiManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'
import { gameConstants } from '../gameConstants';
import { constant } from '../../framework/constant';

const { ccclass, property } = _decorator;
const SDK_DATA = {
    OPENMEDIATIONADAPTER_ID: "my7gE4Mos2RTZDlWN8piV3EAyTiAiAKR",
    REWARD_ID: "10390",
}

const VIDEO_NAME = {
    CLOSE: 'videoAdSuccess',
    FAIL: 'videoAdFail',
    REWARD: 'videoAdShouldReward',
    LOADSUCCESS: 'videoAdDidLoad',
    LOADFAIL: 'videoAdDidFailToLoad',
}

const i18n_ZH = {
    VIDEO_FAIL: '请观看完完整视频',
    VIDEO_LOAD_FAIL: '视频加载失败',
}

const I18N_EN = {
    VIDEO_FAIL: 'Watch the full video',
    VIDEO_LOAD_FAIL: 'Video loading failure',
}

@ccclass('BondsdkIos')
export class BondsdkIos {
    public static rewardVideoSuccessCb: any = null; //激励视频成功回调

    /**
     * 输出
     * @param tex 
     */
    public static log (tex: String) {
        console.log('[BondsdkIos] ' + tex);
    }

    /**
     * 输出
     * @param tex 
     */
    public static error (tex: String) {
        console.error('[BondsdkIos] ' + tex);
    }

    /**
     * 初始化sdk相关内容
     */
    public static init () {
        return;
        BondsdkIos.log('init window.onVideoAdCallback')

        window.onVideoAdCallback = (name: any, code: any, msg: any) => {
            BondsdkIos.log('!!!!!!window.onVideoAdCallback' + name + code + msg)
            let nowLanguage;
            switch (name) {
                case VIDEO_NAME.CLOSE:
                    break;
                case VIDEO_NAME.FAIL:
                    if (i18n._language === constant.I18_LANGUAGE.CHINESE) {
                        nowLanguage = i18n_ZH.VIDEO_FAIL;
                    } else {
                        nowLanguage = I18N_EN.VIDEO_FAIL;
                    }
                    uiManager.instance.showTips(nowLanguage);
                    break;
                case VIDEO_NAME.REWARD:
                    BondsdkIos.rewardVideoSuccessCb && BondsdkIos.rewardVideoSuccessCb();
                    BondsdkIos.rewardVideoSuccessCb = null;
                    break;
                case VIDEO_NAME.LOADSUCCESS:
                    break;
                case VIDEO_NAME.LOADFAIL:
                    if (i18n._language === constant.I18_LANGUAGE.CHINESE) {
                        nowLanguage = i18n_ZH.VIDEO_LOAD_FAIL;
                    } else {
                        nowLanguage = I18N_EN.VIDEO_LOAD_FAIL;
                    }
                    uiManager.instance.showTips(nowLanguage);
                    break;
                default:
                    BondsdkIos.error('not define type name:' + name);
                    break;
            }
        }

        jsb.reflection.callStaticMethod("BondSDKOpenMediationAdapter", "initSDK:", SDK_DATA.OPENMEDIATIONADAPTER_ID);

        // window.onInterstitialAdCallback = (name, code, msg) => {
        //     console.log('!!!!!!window.onInterstitialAdCallback', name, code, msg)
        // }

        // window.onAdCallback = (name, code, msg) => {
        //     console.log('!!!!!!window.onAdCallback', name, code, msg)
        // }

        // window.onBannerAdCallback = (name, code, msg) => {
        //     console.log('!!!!!!window.onBannerAdCallback', name, code, msg)
        // }
    }

    /**
     * 显示激励视频
     * @param cb 
     */
    public static showRewardVideo (cb: any) {
        cb && cb();
        return;
        BondsdkIos.rewardVideoSuccessCb = cb;
        jsb.reflection.callStaticMethod("BondSDKOpenMediationAdapter", "showRewardedVideoAd:", SDK_DATA.REWARD_ID)
    }
}

