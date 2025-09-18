
import { _decorator, Component, Node, profiler, Sprite, SpriteFrame } from 'cc';
import { AudioManager } from '../../framework/audioManager';
import { StorageManager } from '../../framework/storageManager';
import { uiManager } from '../../framework/uiManager';
import { gameConstants } from '../../game/gameConstants';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'
import { frameworkInit } from '../../framework/frameworkInit';
import { constant } from '../../framework/constant';
const { ccclass, property } = _decorator;

const STATE_LIST = {
    OPEN: 0,
    CLOSE: 1,
}
@ccclass('SettingPanel')
export class SettingPanel extends Component {
    private _isDebugOpen: boolean = false;
    private _isMusicOpen: boolean = false;

    @property(Sprite)
    public spBtnDebug: Sprite = null!;

    @property(Sprite)
    public spBtnMusic: Sprite = null!;

    @property(SpriteFrame)
    sfDebugList: Array<SpriteFrame> = [];

    @property(SpriteFrame)
    sfMusicList: Array<SpriteFrame> = [];

    show() {
        this._isMusicOpen = AudioManager.instance.getAudioSetting(true);
        this._changeState(this.spBtnMusic, this.sfMusicList, this._isMusicOpen);

        this._isDebugOpen = StorageManager.instance.getGlobalData("debug") ?? false;
        this._changeState(this.spBtnDebug, this.sfDebugList, this._isDebugOpen);
    }

    private _changeState(spParget: Sprite, list: Array<SpriteFrame>, isOpen: boolean) {
        if (isOpen) {
            spParget.spriteFrame = list[STATE_LIST.OPEN];
        } else {
            spParget.spriteFrame = list[STATE_LIST.CLOSE];
        }
    }

    public onBtnClose() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

        uiManager.instance.hideDialog(gameConstants.PANEL_PATH_LIST.SETTING);
    }

    public onBtnDebug() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

        this._isDebugOpen = !this._isDebugOpen;
        this._changeState(this.spBtnDebug, this.sfDebugList, this._isDebugOpen);
        StorageManager.instance.setGlobalData("debug", this._isDebugOpen);

        this._isDebugOpen === true ? profiler.showStats() : profiler.hideStats();
    }

    public onBtnMusic() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

        this._isMusicOpen = !this._isMusicOpen;
        this._changeState(this.spBtnMusic, this.sfMusicList, this._isMusicOpen);

        if (this._isMusicOpen) {
            AudioManager.instance.openMusic();
            AudioManager.instance.openSound();
        } else {
            AudioManager.instance.closeMusic();
            AudioManager.instance.closeSound();
        }
    }

    public onBtnLanguage() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

        let nowLanguage;
        if (i18n._language === constant.I18_LANGUAGE.CHINESE) {
            nowLanguage = constant.I18_LANGUAGE.ENGLISH;
        } else {
            nowLanguage = constant.I18_LANGUAGE.CHINESE;
        }
        
        i18n.init(nowLanguage);
        i18n.updateSceneRenderers();
    }
}