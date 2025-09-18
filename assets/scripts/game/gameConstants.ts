import { RigidBody } from "cc";
import { Vector3_DATA, BOXCOLLIDER_DATA, RIGIDBODY_DATA } from './define/define';

const gameConstants = {
    //-----------------initRigidBodyCOLLIDER data
    //-----------------初始场景刚体
    //墙壁分组的刚体数据
    INITSCENE_WALL_RIGIDBODY: new RIGIDBODY_DATA(1 << 2, 1 << 3, RigidBody.Type.STATIC),
    //墙壁分组的碰撞盒数据
    INITSCENE_WALL_COLLIDER: [
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(7.7, 1.13, 14.2), new Vector3_DATA(-0.08, -0.56, -5.6)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(0.6, 14, 2.1), new Vector3_DATA(4.1, 6, -8.7)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(0.6, 14, 2.1), new Vector3_DATA(-4.26, 6, -8.7)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(7.7, 0.364, 0.296), new Vector3_DATA(-0.08, 0.92, -10.4)),

        new BOXCOLLIDER_DATA(
            new Vector3_DATA(0, 4.48, -11.36), new Vector3_DATA(-8, 0, 0),
            new Vector3_DATA(7.7, 7, 1), new Vector3_DATA(-0.08, 0, 0)),

        new BOXCOLLIDER_DATA(
            new Vector3_DATA(0, -2.756, 1.35), new Vector3_DATA(),
            new Vector3_DATA(7.7, 4.794, 0.228), new Vector3_DATA(-0.08, 0, 0)),

        new BOXCOLLIDER_DATA(
            new Vector3_DATA(3.528, -3.092, 3), new Vector3_DATA(0, 0, -9.5),
            new Vector3_DATA(0.262, 4.794, 3.536), new Vector3_DATA(-0.08, 0, 0)),

        new BOXCOLLIDER_DATA(
            new Vector3_DATA(-3.532, -3.092, 3), new Vector3_DATA(0, 0, 9.5),
            new Vector3_DATA(0.262, 4.794, 3.536), new Vector3_DATA(-0.08, 0, 0)),
    ],

    //礼物分组的大小，对应PRESENT_NAME_LIST的顺序  ['bear01', 'body01', 'car01', 'duck01', 'key01']
    TARGET_SCALE: [
        270, 27, 350, 180, 35
    ],

    //礼物分组的碰撞盒数据，对应PRESENT_NAME_LIST的顺序  ['bear01', 'body01', 'car01', 'duck01', 'key01']
    INITSCENE_PRESENT_COLLIDER: [
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(1.4, 1.5, 1.34), new Vector3_DATA(0, 0.4, -0.05)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(1.654, 2.3, 1.4), new Vector3_DATA(0, 0.6, 0)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(2.05, 1.23, 1.58), new Vector3_DATA(0, 0.15, 0)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(1.202, 1.07, 0.96), new Vector3_DATA(0, 0.32, 0)),
        new BOXCOLLIDER_DATA(
            new Vector3_DATA(), new Vector3_DATA(),
            new Vector3_DATA(1.84, 1, 0.23), new Vector3_DATA(0.425, 0, 0)),
    ],

    //-----------------collider data
    //-----------------碰撞分组
    GROUP_MASK_LIST: {
        DEFAULT: 1 << 0,
        PUSH_TOUCH: 1 << 1,
        WALL: 1 << 2,
        GOODS: 1 << 3, //金币+掉落礼物
    },

    //-----------------event data
    //-----------------事件
    EVENT_LIST: {
        TOUCH_CREATE_GOLD: 'touchCreateGold',
        TOUCH_HIDE_TOUCHPLANE: 'touchHideTouchPlane',
        GOLD_SHOW_UPDATE: 'goldShowUpdate',
    },

    //-----------------offline data
    //-----------------离线数据
    OFFLINE_ADD_GOLD_TIME: 120, //离线时间到达当前数值后金币+1（秒）
    OFFLINE_MAX_GOLD: 100, //离线最大金币数

    //-----------------panel data
    //-----------------界面
    PANEL_PATH_LIST: {
        TIPS: 'common/tips',
        GAME: 'game/gamePanel',
        SETTING: 'setting/settingPanel',
        OFFLINEREWARD: 'offlineReward/offlineRewardPanel'
    },

    //-----------------gamePanel data
    //-----------------游戏界面
    GAMEPANEL_VIDEO_GET_GOLD: 20, //游戏界面看视频获得金币数
    GAMEPANEL_CAN_CLICK_INTERVAL: 0.25, //游戏界面可点击间隔时间

    //-----------------wall data
    //-----------------墙壁 数据
    WALL_NAME: 'wall', //墙壁名称
    WALL_NAME_DOWN_FLOOR: 'downFLoor', //金币放置台名称
    WALL_NAME_PUSH: 'pushModel', //推动层名称

    //---------push data
    //---------推动层 数据
    PUSH_LINEAR_VELOCITY_Z: 2.3, //推动层的z轴线性速度
    PUSH_INIT_POS_X: -0.076, //推动层x轴初始坐标
    PUSH_INIT_POS_Y: 0.4, //推动层y轴初始坐标
    PUSH_MAX_POS_Z: -10.5, //推动层最大z轴坐标
    PUSH_MIN_POS_Z: -13.97, //推动层最小z轴坐标
    PUSH_RANGE_Z: 2.4, //点击推动层后 金币z轴随机值

    //-----------------goods data
    //-----------------物品
    GOODS_CHECK_OTHER_STATE: 0, //判断物品不在台子上的其他状况
    GOODS_DESTROY_POS_Y: -30, //判断物品低于当前y值销毁
    GOODS_GET_MIN_POS_Y: -1, //判断可获取物品区域的最小y轴
    GOODS_GET_MIN_POS_X: 3.9, //获得物品x轴最小坐标
    GOODS_GET_MIN_POS_Z: 1.514, //获得物品z轴最小坐标
    GOODS_GET_MAX_POS_Z: 4.63, //获得物品z轴最大坐标

    //---------present data
    //---------礼物
    PRESENT_ADD_GOLD_NUM: 10, //获得礼物增加金币数
    PRESENT_NAME_LIST: ['bear01', 'body01', 'car01', 'duck01', 'key01'], //物品的名称列表
    PRESENT_DROP_X: 0, //礼物掉落初始x轴坐标
    PRESENT_DROP_Y: 3, //礼物掉落初始y轴坐标
    PRESENT_DROP_Z: -3.1, //礼物掉落初始z轴坐标
    PRESENT_DROP_RANGE_X: 2.1, //礼物掉落随机区间x
    PRESENT_DROP_RANGE_Z: 0.9, //礼物掉落随机区间z
    PRESENT_WAIT_TIME: 60, //下一个礼物间隔时间（s）

    //---------gold data
    //---------金币
    GOLD_ADD_GOLD_NUM: 1, //获得金币增加金币数
    GOLD_NAME: 'coin', //金币名称
    GOLD_DROP_POS_Y: 3, //金币从空中掉落位置
    GOLD_ON_STAND_POS_Y: 0.17, //在台子上生成的金币y轴坐标A
    GOLD_ON_STAND_POS_MAX_X: 3.7, //在台子上生成的金币x最大值 
    GOLD_ON_STAND_POS_MIN_Z: -6, //在台子上生成的金币z最小值
    GOLD_ON_STAND_POS_MAX_Z: 0.679, //在台子上生成的金币z最大值
    GOLD_SIZE: 1.35, //金币尺寸 平铺在地面使用
    GOLD_CHECK_MAX_FRAME: 8, //金币判断当前下落位置最大帧数
    GOLD_CYLINDER_RADIUS: 0.59, //金币圆柱体半径
    GOLD_CYLINDER_HEIGHT: 0.18, //金币圆柱体高度

    //-----------------sounds data
    //-----------------声音
    SOUND_NAME_LIST: {
        CLICK: 'click',
        INVALIDGOLD: 'invalidGold', //掉落进无效区域
        DROP: 'drop', //掉落音效
        GETGOLD: 'getGold', //获得金币
        GETPRESENT: 'getPresent',//获得礼物
        COUNTDOWNGETGOLD: 'countDownGetGold',//倒计时后获得金币
        VIDEOGETGOLD: 'videoGetGold', //视频获得金币
    },

    SOUND_PUSH_CHECK_Y: 0.7, //落到推动层上播放金币音效的位置

    //-----------------init data
    //-----------------初始数据
    INIT_GOLD_NUM: 300, //初始金币数
}
export { gameConstants }