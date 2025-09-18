
import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bondsdk')
export class Bondsdk {
    /**
     * 输出
     * @param tex 
     */
    public static log(tex: String) {
        console.log('[Bondsdk] ' + tex);
    }
    /**
    * 输出
    * @param tex 
    */
    public static error(tex: String) {
        console.error('[Bondsdk] ' + tex);
    }
    /**
     * 初始化
     */
    public static init() {
        Bondsdk.log('initsdk');
    }
    /**
     * 显示激励视频
     * @param cb 
     */
    public static showRewardVideo(cb: any) {
        Bondsdk.log('showRewardVideo');
        cb && cb();
    }
}

