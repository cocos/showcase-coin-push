import { _decorator, Component, Vec3, tween, isValid, UIOpacity, Label, UITransform } from 'cc';
import { LocalizedSprite } from '../../../../extensions/i18n/assets/LocalizedSprite';
import { poolManager } from './../../framework/poolManager';
const { ccclass, property } = _decorator;

@ccclass('tipsMoney')
export class tipsMoney extends Component {
    public show(callback?: Function) {
        this.node.getComponent(LocalizedSprite)!.fetchRender();
        const UIOpacityBg = this.node.getComponent(UIOpacity)!;
        UIOpacityBg.opacity = 255;
        this.node.setPosition(0, 220, 0);

        this.scheduleOnce(() => {
            tween(this.node)
                .to(0.9, { position: new Vec3(0, 450, 0) }, { easing: 'smooth' })
                .call(() => {
                    callback && callback();
                    poolManager.instance.putNode(this.node);
                })
                .start();

            tween(UIOpacityBg)
                .to(0.6, { opacity: 220 }, { easing: 'smooth' })
                .to(0.3, { opacity: 0 }, { easing: 'smooth' })
                .start();
        }, 0.8);
    }
}
