// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameController from "../GameController";
import GameManager from "../Manager/GameManager";
import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIStartLevel extends cc.Component {
    @property(cc.Node)
    node_bg: cc.Node = null;

    OnInit() {        
        this.startLevelByTime();
    }

    protected onEnable(): void {
        this.resizeDisplay();
    }


    private resizeDisplay() {
        let visibleSize = cc.view.getVisibleSize();
        let nodeSize = this.node_bg.getContentSize();
 
        let widthRatio = visibleSize.width/nodeSize.width;
        let heightRatio = visibleSize.height/nodeSize.height;
        
        if(widthRatio > heightRatio) {
            this.node_bg.setScale(widthRatio);
        }
        else 
        {
            this.node_bg.setScale(heightRatio);
        }      
    }

    async startLevelByTime() {
        await delay(1000);
        GameManager.instance.StartLevel();
        this.node.destroy();
    }

    // protected update(dt: number): void {
    //     this.resizeDisplay();
    // }
}
