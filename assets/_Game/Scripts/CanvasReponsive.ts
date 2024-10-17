// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CollisionManager from "./Manager/CollisionManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CanvasReponsive extends cc.Component {
    private canvas: cc.Canvas = null;
    private designResolution: cc.Size = null;
    private witdhSize = 0;
    private heightSize = 0;

    protected onLoad(): void {        
        //console.log("🚀 ~ file: CanvasReponsive.ts:20 ~ CanvasReponsive ~ onLoad ~ onLoad:")
        //CollisionManager.instance.disablePhysicsSystem();
        this.canvas = this.node.getComponent(cc.Canvas);
        this.designResolution = new cc.Size(1920, 1080);
        this.witdhSize = 0;
        this.heightSize = 0;

        const currentRatio = cc.winSize.width / cc.winSize.height; 
        const designRatio = this.designResolution.width / this.designResolution.height;

        // if(currentRatio < designRatio ) {
        //     cc.Canvas.instance.fitWidth = true;
        //     cc.Canvas.instance.fitHeight = false;
        // }
        // else {
        //     cc.Canvas.instance.fitWidth = false;
        //     cc.Canvas.instance.fitHeight = true;
        // }

        
        cc.Canvas.instance.fitHeight = true;
        cc.Canvas.instance.fitWidth = false;
    }

    protected update(dt: number): void {        
        this.updateResolution();        
    }

    private updateResolution(): void {
        // let frameSize = cc.view.getFrameSize();
        // let designRatio = this.designResolution.width / this.designResolution.height;
        // let frameRatio = frameSize.width / frameSize.height;

        // if(this.witdhSize !== frameSize.width || this.heightSize !== frameSize.height) {
        //     this.witdhSize = frameSize.width;
        //     this.heightSize = frameSize.height;

        //     if(designRatio >= frameRatio)
        //     {
        //         let newDesignSize = new cc.Size(this.designResolution.width, this.designResolution.width * (1/frameRatio));
        //         this.canvas.designResolution = newDesignSize;
        //     }
        //     else {
        //         let newDesignSize = new cc.Size(this.designResolution.height * frameRatio, this.designResolution.height);
        //         this.canvas.designResolution = newDesignSize;
        //     }
        // }

        // console.log("this.canvas.designResolution: ", this.canvas.designResolution);

        this.canvas.designResolution = cc.view.getVisibleSize();
    }
}
