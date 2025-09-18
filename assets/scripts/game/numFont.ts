
import { _decorator, Component, Node, Material, MeshRenderer, Prefab, instantiate, Enum } from 'cc';
const { ccclass, property } = _decorator;
//目前支持： 显示————整数的靠左、居中、靠右的数字显示
const horizontalAlignListCheck = new Map([
    [1, 'left'],
    [2, 'center'],
    [3, 'right'],
]);
const horizontalAlignListName = Enum({
    'left': 1,
    'center': 2,
    'right': 3,
});

@ccclass('NumFont')
export class NumFont extends Component {
    @property(Prefab)
    preNum: Prefab = null!; //数字预制体

    @property(Material)
    matNumList: Array<Material> = [];

    @property({ type: horizontalAlignListName, displayName: "horizontalAlign", tooltip: '水平对齐' })
    horizontalAlign: number = 1; //水平对齐

    //-----------相对于Cube的大小
    @property({ displayName: "width / height", tooltip: '宽/高' })
    ndNumFont: number = 1; //'宽/高'
    @property({ displayName: "rangeX", tooltip: 'x轴区间' })
    rangeX: number = 1; //限制x轴区间
    @property({ displayName: "rangeZ", tooltip: 'z轴区间' })
    rangeZ: number = 1; //限制z轴区间

    /**
     * 代码初始化字体相关数据
     * @param ndNumFont 
     * @param rangeX 
     * @param rangeZ 
     */
    public init(ndNumFont: number, rangeX: number, rangeZ: number) {
        this.ndNumFont = ndNumFont;
        this.rangeX = rangeX;
        this.rangeZ = rangeZ;
    }

    /**
     * 更新显示
     */
    public updateShow(num: number) {
        //将数字从后往前的顺序取出取出
        const numList = [];
        if (num === 0) {
            numList.push(0);
        } else {
            while (num > 0) {
                numList.push(num % 10);
                num = Math.floor(num / 10);
            }
        }

        let w = -1; //当前每一个字的宽度
        let h = -1; //当前每一个字的高度
        if (numList.length <= Math.floor(this.rangeX / (this.rangeZ * this.ndNumFont))) {
            //当前位数 < 当前最大高度可显示的字数
            w = this.rangeZ * this.ndNumFont;
            h = this.rangeZ;
        } else {
            w = this.rangeX / numList.length;
            h = w / this.ndNumFont;
        }

        //将暂时未使用到的节点隐藏
        if (this.node.children.length > numList.length) {
            for (let i = numList.length; i < this.node.children.length; i++) {
                if (!this.node.children[i].active) continue;
                this.node.children[i].active = false;
            }
        }

        let k;
        let startPosX: number = null!; //第一个生成的数字位置
        const changeItem = (itemNode: Node, mat: Material) => {
            if (itemNode) {
                itemNode.active = true;
            } else {
                itemNode = instantiate(this.preNum);
                this.node.addChild(itemNode);
            }
            itemNode.setPosition(startPosX, 0, 0);
            itemNode.setScale(w, 0.01, h);
            itemNode.getComponent(MeshRenderer)?.setMaterial(mat, 0);
        }
        switch (horizontalAlignListCheck.get(this.horizontalAlign)) {
            case 'left':
                startPosX = -this.rangeX / 2 + w / 2;
                for (k = numList.length - 1; k >= 0; k--) {
                    changeItem(this.node.children[numList.length - 1 - k], this.matNumList[numList[k]]);
                    startPosX += w;
                }
                break;
            case 'center':
                startPosX = numList.length / 2 * w - w / 2;
                for (k = 0; k < numList.length; k++) {
                    changeItem(this.node.children[k], this.matNumList[numList[k]]);
                    startPosX -= w;
                }
                break;
            case 'right':
                startPosX = this.rangeX / 2 - w / 2;
                for (k = 0; k < numList.length; k++) {
                    changeItem(this.node.children[k], this.matNumList[numList[k]]);
                    startPosX -= w;
                }
                break;
        }
    }
}
