import { _decorator, Component, Node, Prefab, AnimationComponent, SpriteFrame, SpriteComponent, Vec3, tween, LabelComponent } from 'cc';
import { poolManager } from '../../framework/poolManager';
import { Diamond } from './diamond';
//奖励飞入弹窗
const { ccclass, property } = _decorator;
@ccclass('FlyReward')
export class FlyReward extends Component {
    @property(Prefab)
    public pbReward: Prefab = null!;

    @property(SpriteFrame)
    public sfDiamond: SpriteFrame = null!;

    @property(Node)
    public ndRewardParent: Node = null!;

    @property(Node)
    public ndDiamond: Node = null!;

    @property(LabelComponent)
    public lbDiamondNum: LabelComponent = null!;

    public static isRewardFlying: boolean = false;//奖励是否还在飞行

    private _callback: Function = () => { };
    private _maxRewardCount: number = 15;

    public createReward (targetNum: number, callback: Function) {
        this._callback = callback;
        let targetPos = this.ndDiamond.position;
        let arrPromise: any = [];
        let costTime = 0;
        let move2TargetTime = 0;

        for (let i = 0; i < this._maxRewardCount; i++) {
            let p = new Promise((resolve, reject) => {
                let ndRewardItem = poolManager.instance.getNode(this.pbReward, this.ndRewardParent) as Node;

                let spCom = ndRewardItem.getComponent(SpriteComponent) as SpriteComponent;
                spCom.spriteFrame = this.sfDiamond;

                //配置每个动作
                let delayTime = Math.floor(Math.random() * 10) / 10;
                //随机目标位置
                let randTargetPos = new Vec3(Math.floor(Math.random() * 300) - 150, Math.floor(Math.random() * 300 - 150), 0);
                let pos = new Vec3(0, 0, 0);
                Vec3.subtract(pos, randTargetPos, new Vec3(0, 0, 0)).length() / 400;
                costTime = pos.length() / 400;

                //随机角度
                let randRotation = 120 + Math.floor(Math.random() * 60);
                randRotation = Math.floor(Math.random() * 2) === 1 ? randRotation : -randRotation;

                let pos2 = new Vec3(0, 0, 0);
                Vec3.subtract(pos2, randTargetPos, targetPos).length() / 1000;
                move2TargetTime = pos2.length() / 1000;

                FlyReward.isRewardFlying = true;

                tween(ndRewardItem)
                    .to(costTime, { position: randTargetPos })
                    .to(costTime, { eulerAngles: new Vec3(0, 0, randRotation) })
                    .to(costTime * 2 / 3, { scale: new Vec3(1.5, 1.5, 1.5) })
                    .to(costTime / 3, { scale: new Vec3(1, 1, 1) })
                    .union()
                    .call(() => {
                        ndRewardItem.getComponentInChildren(AnimationComponent)?.play();
                        tween(ndRewardItem)
                            .to(move2TargetTime, { position: targetPos })
                            .call(() => {
                                resolve(null);
                                // AudioManager.instance.playSound(gameConstants.MUSIC_LIST.GETDIAMOND);
                                poolManager.instance.putNode(ndRewardItem);
                            }).start();
                    }).start();
            })

            arrPromise.push(p);
        }

        let scriptDiamond = this.ndDiamond.getComponent(Diamond) as Diamond;
        scriptDiamond.startRaise(targetNum, 0.1, 0.25, () => {
            Promise.all(arrPromise).then(() => {
                setTimeout(() => {
                    FlyReward.isRewardFlying = false;
                    this._callback && this._callback();
                    this.node.destroy();
                }, 1000)
            }).catch((e) => {
                console.log("e", e);
            })
        });
    }
}
