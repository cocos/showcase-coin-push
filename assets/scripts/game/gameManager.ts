
import { _decorator, Component, Node, RigidBody, Vec3, Prefab, BoxCollider, instantiate, find, Animation, director, sys } from 'cc';
import { AudioManager } from '../framework/audioManager';
import { clientEvent } from '../framework/clientEvent';
import { EffectManager } from '../framework/effectManager';
import { playerData } from '../framework/playerData';
import { poolManager } from '../framework/poolManager';
import { resourceUtil } from '../framework/resourceUtil';
import { uiManager } from '../framework/uiManager';
import { gameConstants } from './gameConstants';
import { NumFont } from './numFont';
// import { Goods } from './goods'; 
import * as i18n from '../../../extensions/i18n/assets/LanguageData'
import { BondsdkIos } from './sdk/bondsdkIos';
import { Bondsdk } from './sdk/bondsdk';
import { frameworkInit } from '../framework/frameworkInit';
import { constant } from '../framework/constant';
const { ccclass, property } = _decorator;

/*
注意事项：
物理系统的具体选择可参考文档
https://docs.cocos.com/creator/3.3/manual/zh/physics/physics-item.html
ios:
    1.阴影不支持1024*1024
    2.物理使用physx，性能表现最好
网页:
    1.阴影可修改为自己需要的具体参数
    2.物理使用bullet(ammo)，性能表现最好
*/

//test
const TEST_DROP_TIME = .3; //测试 金币自动下落时间
const TEST_MAX_GOLD = 200; //测试 最大金币数
//test
@ccclass('gameManager')
export class gameManager extends Component {
    @property(Node)
    ndPush: Node = null!; //推动层节点
    @property(Node)
    ndCoinParent: Node = null!; //金币父节点
    @property(Prefab)
    preCoin: Prefab = null!; //金币预制体
    @property(Node)
    ndTouchPlane: Node = null!; //点击平面节点
    @property(Node)
    preDrawWall: Node = null!; //绘制碰撞预制体
    @property(NumFont)
    scriptGoldNumFont: NumFont = null!; //金币的numfont脚本

    private _linearVelocity = new Vec3(0, 0, gameConstants.PUSH_LINEAR_VELOCITY_Z); //推动层线性速度
    private _checkGoodsIndex = 0; //金币分帧判断
    private _lastPresentIndex: number = -1; //上一个礼物id
    private _waitPresentTime: number = 0; //等待生成礼物时间
    private _waitPresentCheck: boolean = false; //是否一定时间后生成礼物
    private _delayCreatePresent: boolean = false; //延迟生成礼物

    public static scriptsBondsdk: any = null; //sdk脚本
    //test
    private _alwaysDropGold: boolean = false; //测试 是否一直自动掉落金币切不消耗金币池
    private _dropTime: number = 0; //测试 自动金币下落时间
    //test

    onLoad () {
        // window.test = this; //测试使用
        frameworkInit.init(this._saveStandsGoodsData.bind(this));

        this._initLanguage();

        this._checkPlatform();

        //摄像机移动结束后相关操作
        find('Main Camera')!.getComponent(Animation)!.once(Animation.EventType.FINISHED, () => {
            uiManager.instance.showDialog(gameConstants.PANEL_PATH_LIST.GAME);

            if (this._delayCreatePresent) {
                this._createPresent();
            }

            //摄像机以外的两个灯条特效销毁
            const effParent = find('effParent');
            effParent?.getChildByName('board3')?.destroy();
            effParent?.getChildByName('board4')?.destroy();
        })

        this._initGame();
    }

    /**
     * 初始化i18n
     * @param nowLanguage 
     */
    private _initLanguage (nowLanguage?: string) {
        if (!nowLanguage) {
            nowLanguage = constant.I18_LANGUAGE.CHINESE;
        }
        i18n.init(nowLanguage);
    }

    /**
     * 判断平台
     */
    private _checkPlatform () {
        if (sys.platform === sys.Platform.IOS) {
            gameManager.scriptsBondsdk = BondsdkIos;
        } else {
            gameManager.scriptsBondsdk = Bondsdk;
        }

        gameManager.scriptsBondsdk.init();
    }

    /**
     * 事件初始化
     */
    private _initEvent () {
        clientEvent.on(gameConstants.EVENT_LIST.TOUCH_CREATE_GOLD, this._createCoin, this);
        clientEvent.on(gameConstants.EVENT_LIST.TOUCH_HIDE_TOUCHPLANE, this._hideTouchPlane, this);
        clientEvent.on(gameConstants.EVENT_LIST.GOLD_SHOW_UPDATE, this._updateGoldNum, this);
    }

    /**
     * 点击区域节点 显示删除
     */
    private _hideTouchPlane (isShow: boolean) {
        if (isShow) {
            this.ndTouchPlane.active = true;
        } else {
            this.ndTouchPlane.destroy();
        }
    }

    /**
     * 初始化游戏
     */
    private async _initGame () {
        this._updateGoldNum();

        this.ndTouchPlane.active = false;
        //初始化推动层位置
        this.ndPush.setPosition(new Vec3(gameConstants.PUSH_INIT_POS_X, gameConstants.PUSH_INIT_POS_Y, gameConstants.PUSH_MIN_POS_Z));

        await this._initSceneWall();

        this._initEvent();

        setTimeout(() => {
            //初始化台面物品
            if (playerData.instance.playerInfo.standsData &&
                playerData.instance.playerInfo.standsData.goldList) {
                //上次存储的数据
                const standsData = playerData.instance.playerInfo.standsData as
                    {
                        goldList: Array<{ pos: Array<number>, eul: Array<number> }>,
                        presentData: { index: number, pos: Array<number>, eul: Array<number> },
                    }
                //初始化金币
                for (let i = 0; i < standsData.goldList.length; i++) {
                    const nowData = standsData.goldList[i];
                    this._createCoin(false,
                        new Vec3(nowData.pos[0], nowData.pos[1], nowData.pos[2]),
                        new Vec3(nowData.eul[0], nowData.eul[1], nowData.eul[2]));
                }
                //初始化礼物
                if (standsData.presentData.index !== -1) {
                    this._createPresent(standsData.presentData);
                } else {
                    this._delayCreatePresent = true;
                }
            } else {
                this._createInitCoin();
                this._delayCreatePresent = true;
            }
        }, 0);

        setTimeout(() => {
            EffectManager.instance.playIdle();
        }, 2);
    }

    /**
     * 初始化平台上平铺的金币
     */
    private _createInitCoin () {
        this.ndCoinParent.destroyAllChildren();
        let x = 0;
        let z = gameConstants.GOLD_ON_STAND_POS_MIN_Z;
        let pos = new Vec3();
        let eul = new Vec3(0, 0, 0);
        let isOnColliderEvent = false;
        while (z < gameConstants.GOLD_ON_STAND_POS_MAX_Z) {
            if (x === 0) {
                pos.set(x, gameConstants.GOLD_ON_STAND_POS_Y, z)
                this._createCoin(isOnColliderEvent, pos, eul);
            } else {
                pos.set(x, gameConstants.GOLD_ON_STAND_POS_Y, z)
                this._createCoin(isOnColliderEvent, pos, eul);

                pos.set(-x, gameConstants.GOLD_ON_STAND_POS_Y, z)
                this._createCoin(isOnColliderEvent, pos, eul);
            }

            x += gameConstants.GOLD_SIZE;

            if (x > gameConstants.GOLD_ON_STAND_POS_MAX_X) {
                x = 0;
                z += gameConstants.GOLD_SIZE;
            }
        }
    }

    /**
     * 创建一个金币
     * @param pos 坐标
     */
    private _createCoin (isOnColliderEvent: boolean, pos: Vec3, eul?: Vec3) {
        const itemCoin = poolManager.instance.getNode(this.preCoin, this.ndCoinParent) as Node;

        let scriptsGoods: any = itemCoin.getComponent('Goods');
        if (!scriptsGoods) {
            scriptsGoods = itemCoin.addComponent('Goods');
        }
        scriptsGoods.initGoods(isOnColliderEvent, this._getNewGoodsIndex(), pos, eul);
    }

    /**
     * 初始化等待掉落礼物参数
     */
    private _waitCreatePresent () {
        this._waitPresentCheck = true;
        this._waitPresentTime = 0;
    }

    /**
     * 创建一个礼物
     * @param lastPresentData 
     */
    private _createPresent (lastPresentData?: any) {
        let pos = new Vec3();
        let eul: any = null!;
        if (lastPresentData && lastPresentData.x) {
            //重置上一次的离线礼物
            pos.set(lastPresentData.pos[0], lastPresentData.pos[1], lastPresentData.pos[2]);
            eul = new Vec3(lastPresentData.eul[0], lastPresentData.eul[1], lastPresentData.eul[2]);
            this._lastPresentIndex = lastPresentData.index;
        } else {
            //当前礼物不与上一个礼物相同
            let randomIndexList = [];
            for (let i = 0; i < gameConstants.PRESENT_NAME_LIST.length; i++) {
                if (i === this._lastPresentIndex) continue;
                randomIndexList.push(i);
            }
            this._lastPresentIndex = randomIndexList[Math.floor(Math.random() * randomIndexList.length)];

            pos.set(
                gameConstants.PRESENT_DROP_X + Math.random() * gameConstants.PRESENT_DROP_RANGE_X,
                gameConstants.PRESENT_DROP_Y,
                gameConstants.PRESENT_DROP_Z + Math.random() * gameConstants.PRESENT_DROP_RANGE_Z);
        }

        resourceUtil.loadModelRes(gameConstants.PRESENT_NAME_LIST[this._lastPresentIndex]).then((pre: any) => {
            const ndPresent = poolManager.instance.getNode(pre, this.ndCoinParent);

            let scriptsGoods = ndPresent.getComponent('Goods');
            if (!scriptsGoods) {
                scriptsGoods = ndPresent.addComponent('Goods');
            }

            scriptsGoods.initGoods(false, this._getNewGoodsIndex(), pos, eul);
        })
    }

    /**
     * 获取当前的物品运行判断帧
     * @returns 
     */
    private _getNewGoodsIndex () {
        this._checkGoodsIndex++;
        if (this._checkGoodsIndex > gameConstants.GOLD_CHECK_MAX_FRAME) {
            this._checkGoodsIndex = 2;
        }
        return this._checkGoodsIndex;
    }

    /**
     * 保存台面上的物品数据
     */
    private _saveStandsGoodsData () {
        let data = {
            goldList: [] as Array<{ pos: Array<number>, eul: Array<number> }>,
            presentData: { index: -1 as number, pos: [] as Array<number>, eul: [] as Array<number> },
        }

        for (let i = 0; i < this.ndCoinParent.children.length; i++) {
            const nowItem = this.ndCoinParent.children[i];
            if (nowItem.position.y < gameConstants.GOODS_CHECK_OTHER_STATE) continue; //当前金币在掉落过程中 不记录
            if (nowItem.name === gameConstants.GOLD_NAME) {
                data.goldList.push({
                    pos: [nowItem.position.x, nowItem.position.y, nowItem.position.z],
                    eul: [nowItem.eulerAngles.x, nowItem.eulerAngles.y, nowItem.eulerAngles.z],
                })
            } else {
                data.presentData.pos = [nowItem.position.x, nowItem.position.y, nowItem.position.z];
                data.presentData.eul = [nowItem.eulerAngles.x, nowItem.eulerAngles.y, nowItem.eulerAngles.z];
                data.presentData.index = this._lastPresentIndex;
            }
        }
        playerData.instance.playerInfo.standsData = data;
    }

    /**
     * 判断当前物品是否状态
     * @param frame 
     * @param itemNode 
     * @returns 
     */
    private _checkAGoodsState (frame: number, itemNode: Node) {
        const goodsJs: any = itemNode.getComponent('Goods')!;
        if (frame % goodsJs.goodsIndex === 0) {
            //物品是否从台子上掉落
            if (itemNode.position.y >= gameConstants.GOODS_CHECK_OTHER_STATE) return;
            if (itemNode.position.y < gameConstants.GOODS_DESTROY_POS_Y) {
                //当前物品超出显示范围，移除
                goodsJs.putPoolGoods();
            } else if (itemNode.position.y < gameConstants.GOODS_GET_MIN_POS_Y) {
                //当前物品为可积分区域,并且未被积分过
                if (goodsJs.addGold !== 0) {
                    if (itemNode.position.x > -gameConstants.GOODS_GET_MIN_POS_X &&
                        itemNode.position.x < gameConstants.GOODS_GET_MIN_POS_X &&
                        itemNode.position.z > gameConstants.GOODS_GET_MIN_POS_Z &&
                        itemNode.position.z < gameConstants.GOODS_GET_MAX_POS_Z) {
                        goodsJs.getGoods();
                    } else {
                        //不在可获得区域内的
                        goodsJs.addGold = 0;

                        AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.INVALIDGOLD);
                    }
                }
                //礼物掉下平台
                if (goodsJs.isPresent) {
                    goodsJs.isPresent = false;
                    this._waitCreatePresent();
                }
            }
        }
    }

    update () {
        const frame = director.getTotalFrames();
        //判断所有金币是否掉落
        for (let i = 0; i < this.ndCoinParent.children.length; i++) {
            this._checkAGoodsState(frame, this.ndCoinParent.children[i]);
        }

        //推动台线性速度
        const pushPos = this.ndPush.getPosition();
        if (pushPos.z <= gameConstants.PUSH_MIN_POS_Z) {
            this._linearVelocity.set(0, 0, gameConstants.PUSH_LINEAR_VELOCITY_Z);
        } else if (pushPos.z >= gameConstants.PUSH_MAX_POS_Z) {
            this._linearVelocity.set(0, 0, -gameConstants.PUSH_LINEAR_VELOCITY_Z);
        }
        this.ndPush.getComponent(RigidBody)?.setLinearVelocity(this._linearVelocity);
    }

    lateUpdate (dt: number) {
        //test 自动掉落金币
        if (this._alwaysDropGold) {
            if (this.ndCoinParent.children.length < TEST_MAX_GOLD) {
                this._dropTime += dt;
                if (this._dropTime > TEST_DROP_TIME) {
                    this._dropTime = 0;
                    this._createCoin(true, new Vec3(Math.random() * 3.5 * (Math.random() > 0.5 ? -1 : 1), gameConstants.GOLD_DROP_POS_Y, -8.5))
                }
            }
        }
        //test

        //一定时间后生成下一个礼物
        if (this._waitPresentCheck) {
            this._waitPresentTime += dt;
            if (this._waitPresentTime > gameConstants.PRESENT_WAIT_TIME) {
                this._waitPresentCheck = false;
                this._createPresent();
            }
        }
    }

    /**
     * 初始化场景中的墙相关刚体
     * @returns 
     */
    private _initSceneWall () {
        this._createAllWallRigidBody();
    }

    /**
     * 创建所有墙面刚体
     */
    private _createAllWallRigidBody () {
        let v3_init = new Vec3();

        //墙面刚体和碰撞盒
        const ndWallBox = new Node('wallBox');
        this.node.addChild(ndWallBox);
        const wallRigidBodyData = gameConstants.INITSCENE_WALL_RIGIDBODY;
        for (let i = 0; i < gameConstants.INITSCENE_WALL_COLLIDER.length; i++) {
            const wallColliderData = gameConstants.INITSCENE_WALL_COLLIDER[i];
            const name = i === 0 ? gameConstants.WALL_NAME_DOWN_FLOOR : gameConstants.WALL_NAME;
            const ndWallItem = new Node(name);
            ndWallBox.addChild(ndWallItem);
            v3_init.set(wallColliderData.pos.x, wallColliderData.pos.y, wallColliderData.pos.z);
            v3_init.add3f(wallColliderData.center.x, wallColliderData.center.y, wallColliderData.center.z);
            ndWallItem.setPosition(v3_init);
            v3_init.set(wallColliderData.eul.x, wallColliderData.eul.y, wallColliderData.eul.z);
            ndWallItem.setRotationFromEuler(v3_init);

            let rigidBody = ndWallItem.addComponent(RigidBody);
            rigidBody.type = wallRigidBodyData.type;
            rigidBody.setGroup(wallRigidBodyData.group);
            rigidBody.setMask(wallRigidBodyData.mask);

            let collider = ndWallItem.addComponent(BoxCollider);
            v3_init.set(wallColliderData.size.x, wallColliderData.size.y, wallColliderData.size.z);
            collider.size = v3_init;

            // this._drawWallCollider(wallColliderData);
        }
    }

    /**
     * 绘制出当前配置的碰撞体位置
     * @param wallColliderData 
     */
    private _drawWallCollider (wallColliderData: any) {
        let v3_init = new Vec3();
        const node = instantiate(this.preDrawWall);
        node.parent = this.node;

        v3_init.set(wallColliderData.pos.x, wallColliderData.pos.y, wallColliderData.pos.z);
        v3_init.add3f(wallColliderData.center.x, wallColliderData.center.y, wallColliderData.center.z);
        node.setPosition(v3_init)

        v3_init.set(wallColliderData.eul.x, wallColliderData.eul.y, wallColliderData.eul.z);
        node.setRotationFromEuler(v3_init)

        v3_init.set(wallColliderData.size.x, wallColliderData.size.y, wallColliderData.size.z);
        node.setScale(v3_init)
    }

    /**
     * 更新金币数量显示
     */
    private _updateGoldNum () {
        if (!this.scriptGoldNumFont) return;
        this.scriptGoldNumFont.updateShow(playerData.instance.playerInfo['gold']);
    }
}