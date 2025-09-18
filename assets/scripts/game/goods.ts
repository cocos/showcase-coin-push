import { _decorator, Component, Vec3, RigidBody, CylinderCollider, BoxCollider, tween, Collider, ICollisionEvent, } from 'cc';
import { AudioManager } from '../framework/audioManager';
import { clientEvent } from '../framework/clientEvent';
import { EffectManager } from '../framework/effectManager';
import { playerData } from '../framework/playerData';
import { poolManager } from '../framework/poolManager';
import { gameConstants } from './gameConstants';

const { ccclass, property } = _decorator;

const v3_init = new Vec3();
@ccclass('Goods')
export class Goods extends Component {
  public goodsIndex: number = 0; // 当前物品判断帧数

  public addGold: number = -1; // 获得当前物品增加金币数

  public isPresent: boolean = false; // 当前是否为礼物

  /**
   * 初始化物品
   * @param id 当前判断帧数
   * @param addGold 当前物品增加金币数
   * @param pos 坐标
   * @param eul 旋转
   */
  public initGoods (isOnColliderEvent: boolean, id: number, pos: Vec3, eul?: Vec3) {
    this.goodsIndex = id;
    this.node.setPosition(pos);
    if (eul) {
      this.node.setRotationFromEuler(eul);
    }

    let collider;
    let rigidBody = this.node.getComponent(RigidBody) as RigidBody;
    if (this.node.getComponent(Collider)) {
      rigidBody!.wakeUp();
      collider = this.node.getComponent(Collider);
    } else {
      if (this.node.name === gameConstants.GOLD_NAME) {
        collider = this.getComponent(Collider);
      } else {
        collider = this._createPresentCollider();
      }
    }
    if (isOnColliderEvent) {
      collider!.on('onCollisionEnter', this._onCollisionEnter, this);
    }

    if (this.node.name === gameConstants.GOLD_NAME) {
      this.addGold = gameConstants.GOLD_ADD_GOLD_NUM;
    } else {
      rigidBody.destroy()
      this.isPresent = true;
      this.addGold = gameConstants.PRESENT_ADD_GOLD_NUM;

      if (pos.y === gameConstants.PRESENT_DROP_Y) {
        // 从上方掉落的礼物
        EffectManager.instance.playGetPresent(this.node);

        rigidBody!.applyImpulse(new Vec3(0, 4, 0));
        rigidBody!.applyTorque(new Vec3(this._getRandomRotate(), this._getRandomRotate(), this._getRandomRotate()));
        // 施加向上力
        this.node.children[0].setScale(0, 0, 0);
        //   this.node.setRotationFromEuler(0, 0, 0);
        //   const randomNum = () => (Math.random() > 0.5 ? 1 : -1) * Math.random() * 80 + (Math.random() > 0.5 ? 100 : -100);
        const targetScale = gameConstants.TARGET_SCALE[gameConstants.PRESENT_NAME_LIST.indexOf(this.node.name)];
        tween(this.node.children[0])
          .to(0.3, {
            scale: new Vec3(targetScale, targetScale, targetScale),
          })
          .start();
        //   tween(this.node)
        //     .to(1, {
        //       eulerAngles: new Vec3(randomNum(), randomNum(), randomNum()),
        //     })
        //     .call(() => {

        //     })
        //     .start();
      }
    }
  }

  private _getRandomRotate () {
    return Math.random() * 200;
  }

  private _onCollisionEnter (e: ICollisionEvent) {
    // TODO:掉落到平台上的声音一次太多个
    const otherName = e.otherCollider.node.name;
    if (otherName === gameConstants.WALL_NAME
      || otherName === gameConstants.GOLD_NAME) return; // 碰到旁边的墙壁无效、金币
    if (otherName === gameConstants.WALL_NAME_PUSH) {
      const v3_pos = new Vec3();
      // 判断发生碰撞的另外一个物体的碰撞点
      if (e.contacts[0].isBodyA) {
        e.contacts[0].getWorldPointOnB(v3_pos);
      } else {
        e.contacts[0].getWorldPointOnA(v3_pos);
      }

      if (v3_pos.y > gameConstants.SOUND_PUSH_CHECK_Y) {
        AudioManager.instance.playSound(`${gameConstants.SOUND_NAME_LIST.DROP}2`);
      }
    } else if (otherName === gameConstants.WALL_NAME_DOWN_FLOOR) {
      this.node.getComponent(Collider)!.off('onCollisionEnter', this._onCollisionEnter, this);
      AudioManager.instance.playSound(`${gameConstants.SOUND_NAME_LIST.DROP}2`);
    }
  }

  /**
   * 创建刚体
   */
  private _createRigidBody () {
    const rigidBody = this.node.addComponent(RigidBody);
    rigidBody.type = RigidBody.Type.DYNAMIC;
    rigidBody.setGroup(gameConstants.GROUP_MASK_LIST.GOODS);
    rigidBody.setMask(gameConstants.GROUP_MASK_LIST.GOODS + gameConstants.GROUP_MASK_LIST.WALL);
    rigidBody.mass = 0.5;
    rigidBody.allowSleep = false;
    rigidBody.useGravity = true;
    // 防止快速穿透 开启后金币掉落效果不够好
    // https://docs.cocos.com/creator/3.3/manual/zh/physics/physics-ccd.html?h=cdd
    // rigidBody.useCCD = true;
  }

  /**
   * 创建金币碰撞体
   */
  private _createGoldCollider () {
    const collider = this.node.addComponent(CylinderCollider);
    // collider.isTrigger = false;
    collider.radius = gameConstants.GOLD_CYLINDER_RADIUS;
    collider.height = gameConstants.GOLD_CYLINDER_HEIGHT;
    collider.direction = CylinderCollider.Axis.Z_AXIS;
    v3_init.set(0, 0, 0);
    collider.center = v3_init;
    return collider;
  }

  /**
  * 创建礼物碰撞体
  */
  private _createPresentCollider () {
    const collider = this.node.addComponent(BoxCollider);
    const id = gameConstants.PRESENT_NAME_LIST.indexOf(this.node.name);
    const presentColliderData = gameConstants.INITSCENE_PRESENT_COLLIDER[id];
    v3_init.set(presentColliderData.size.x, presentColliderData.size.y, presentColliderData.size.z);
    collider.size = v3_init;
    v3_init.set(presentColliderData.center.x, presentColliderData.center.y, presentColliderData.center.z);
    collider.center = v3_init;

    collider.setGroup(gameConstants.GROUP_MASK_LIST.GOODS);
    collider.setMask(gameConstants.GROUP_MASK_LIST.GOODS + gameConstants.GROUP_MASK_LIST.WALL);
    return collider;
  }

  public getGoods () {
    playerData.instance.updatePlayerInfo('gold', this.addGold);

    if (this.addGold === gameConstants.PRESENT_ADD_GOLD_NUM) {
      AudioManager.instance.playSound(gameConstants.SOUND_NAME_LIST.GETPRESENT);

      EffectManager.instance.playCelebrate();
    } else {
      AudioManager.instance.playSound(`${gameConstants.SOUND_NAME_LIST.GETGOLD}1`);
    }
    this.addGold = 0;
    clientEvent.dispatchEvent(gameConstants.EVENT_LIST.GOLD_SHOW_UPDATE);
  }

  public putPoolGoods () {
    this.node.getComponent(Collider)!.off('onCollisionEnter', this._onCollisionEnter, this);
    this.node.getComponent(RigidBody)?.sleep();
    poolManager.instance.putNode(this.node);
  }
}
