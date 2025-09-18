
import { _decorator, Component, Node, Label, geometry, find, Camera, PhysicsSystem, instantiate, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { playerData } from '../../framework/playerData';
import { uiManager } from '../../framework/uiManager';
import { gameConstants } from '../../game/gameConstants';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'
import { AudioManager } from '../../framework/audioManager';
import { gameManager } from '../../game/gameManager';

const { ccclass, property } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends Component {
    @property(Label)
    lbCountdownTime: Label = null!; //倒计时显示

    private _comCamera: Camera = null!;
    private _countdownTime: number = 0; //倒计时增加金币
    private _checkCanClick: Boolean = true; //可点击生成金币
    private _checkCanClickTime: number = 0; //可点击时间间隔计算
    private _isFirstClick: boolean = true; //是否为第一次点击（隐藏新手引导）

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
    }

    onLoad() {
        this._comCamera = find('Main Camera')?.getComponent(Camera)!;
    }

    private _onTouchStart(e: any) {
        if (!this._checkCanClick) return;

        //若显示新手引导 隐藏
        if (this._isFirstClick) {
            this._isFirstClick = false;
            clientEvent.dispatchEvent(gameConstants.EVENT_LIST.TOUCH_HIDE_TOUCHPLANE, false);
        }

        if (this._getPlayerGold() > 0) {
            const outRay = new geometry.Ray();
            const touchPoint = e.touch._point;
            this._comCamera.screenPointToRay(touchPoint.x, touchPoint.y, outRay);
            if (PhysicsSystem.instance.raycast(outRay, gameConstants.GROUP_MASK_LIST.PUSH_TOUCH), 50) {
                //点击到推动台的位置 永远只会有一个
                if (PhysicsSystem.instance.raycastResults.length <= 0) return;
                this._checkCanClick = false;
                this._checkCanClickTime = 0;

                playerData.instance.updatePlayerInfo('gold', -1);
                clientEvent.dispatchEvent(gameConstants.EVENT_LIST.GOLD_SHOW_UPDATE);

                // const randomEul = () => {
                //     return Math.random() * 180 * (Math.random() > 0.5 ? 1 : -1);
                // }
                const hitPoint = PhysicsSystem.instance.raycastResults[0].hitPoint;
                clientEvent.dispatchEvent(gameConstants.EVENT_LIST.TOUCH_CREATE_GOLD,
                    true,
                    new Vec3(hitPoint.x, hitPoint.y, hitPoint.z - Math.random() * gameConstants.PUSH_RANGE_Z),
                    new Vec3(0, 0, 0));//randomEul(), randomEul(), randomEul()
            }
        } else {
            uiManager.instance.showDialog('common/tipsMoney');
        }
    }

    show() {
        clientEvent.dispatchEvent(gameConstants.EVENT_LIST.TOUCH_HIDE_TOUCHPLANE, true);

        this._countdownTime = gameConstants.OFFLINE_ADD_GOLD_TIME + 1;
        this._updateTime();

        //存在离线时间
        if (playerData.instance.settings.hideTime) {
            const subTime = Date.now() - playerData.instance.settings.hideTime;
            const hour = Math.floor(subTime / 1000 / 60);
            let addGold;
            if (hour >= gameConstants.OFFLINE_MAX_GOLD * (gameConstants.OFFLINE_ADD_GOLD_TIME / 60)) {
                //大于等于最大上限时间
                addGold = gameConstants.OFFLINE_MAX_GOLD;
            } else {
                addGold = Math.floor(hour / (gameConstants.OFFLINE_ADD_GOLD_TIME / 60));
            }
            if (addGold > 0) {
                uiManager.instance.showDialog(gameConstants.PANEL_PATH_LIST.OFFLINEREWARD, [addGold]);
            }
        }
    }

    /**
     * 获取玩家金币数量
     */
    private _getPlayerGold() {
        return playerData.instance.playerInfo['gold'];
    }

    /**
     * 更新时间显示
     */
    private _updateTime() {
        if (this._countdownTime < 0) {
            AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

            this._countdownTime = gameConstants.OFFLINE_ADD_GOLD_TIME + 1;
            playerData.instance.updatePlayerInfo('gold', 1);
            clientEvent.dispatchEvent(gameConstants.EVENT_LIST.GOLD_SHOW_UPDATE);
        }
        const timeS = Math.floor(this._countdownTime % 60);
        if (timeS < 10) {
            this.lbCountdownTime.string = '0' + Math.floor(this._countdownTime / 60 % 60) + ':0' + timeS;
        } else {
            this.lbCountdownTime.string = '0' + Math.floor(this._countdownTime / 60 % 60) + ':' + timeS;
        }
    }

    public onBtnSetting() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.CLICK);

        uiManager.instance.showDialog(gameConstants.PANEL_PATH_LIST.SETTING);
    }

    public onBtnVideoGetGold() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

        gameManager.scriptsBondsdk.showRewardVideo(() => {
            AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.VIDEOGETGOLD);

            playerData.instance.updatePlayerInfo('gold', gameConstants.GAMEPANEL_VIDEO_GET_GOLD);
            clientEvent.dispatchEvent(gameConstants.EVENT_LIST.GOLD_SHOW_UPDATE);
        });
    }

    update(dt: number) {
        this._countdownTime -= dt;
        this._updateTime();

        if (this._checkCanClick) return;
        this._checkCanClickTime += dt;
        if (this._checkCanClickTime >= gameConstants.GAMEPANEL_CAN_CLICK_INTERVAL) {
            this._checkCanClick = true;
        }
    }
}