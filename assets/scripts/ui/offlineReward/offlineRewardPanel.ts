
import { _decorator, Component, Node, Label } from 'cc';
import { AudioManager } from '../../framework/audioManager';
import { clientEvent } from '../../framework/clientEvent';
import { playerData } from '../../framework/playerData';
import { uiManager } from '../../framework/uiManager';
import { gameConstants } from '../../game/gameConstants';
const { ccclass, property } = _decorator;

@ccclass('OfflineRewardPanel')
export class OfflineRewardPanel extends Component {
    @property(Label)
    lbGetGold: Label = null!;

    private _nowGetGold: number = 0;

    show(nowGetGold: number) {
        this._nowGetGold = nowGetGold;
        this.lbGetGold.string = (this._nowGetGold).toString();
    }

    /**
     * 关闭当前界面
     */
    private _closePanel() {
        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.COUNTDOWNGETGOLD);

        clientEvent.dispatchEvent(gameConstants.EVENT_LIST.GOLD_SHOW_UPDATE);

        uiManager.instance.hideDialog(gameConstants.PANEL_PATH_LIST.OFFLINEREWARD);
    }

    public onBtnDouble() {
        playerData.instance.updatePlayerInfo('gold', this._nowGetGold * 2);
        this._closePanel();
    }

    public onBtnClose() {
        playerData.instance.updatePlayerInfo('gold', this._nowGetGold);
        this._closePanel();
    }
}
