// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { DataTutorial } from "../GameController";
import AudioManager from "../Manager/AudioManager";
import GameManager from "../Manager/GameManager";
import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;


@ccclass
export default class UITutorial extends cc.Component {
    @property(cc.Label)
    lbl_Title: cc.Label = null;
    @property(cc.Label)
    lbl_TargetDesc: cc.Label = null;
    @property(cc.Label)
    lbl_PlayDesc: cc.Label = null;

    @property(cc.Sprite)
    spr_Hand: cc.Sprite = null;
    @property(cc.SpriteFrame)
    sf_Hand: cc.SpriteFrame[] = [];

    @property(cc.Node)
    node_bg: cc.Node = null;

    //#region DATA
    private readonly data: DataTutorial = {
        name: "Cross Bridge",
        target: "Help kids learn vocabulary through recognizing things of the same group.",
        play: "Look at the pictures and drag the blocks to their corresponding columns"
    }
    //#endregion

    OnInit(data : DataTutorial = this.data) {
        this.lbl_Title.string = data.name;
        this.lbl_TargetDesc.string = data.target;
        this.lbl_PlayDesc.string = data.play;

        this.TweenClick();
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

    OnClickStart() {   
        console.log("Onclick start")     ;
        const callback = () => {            
            GameManager.instance.OnInit();         
        }

        AudioManager.instance.playAudioTouchScreen();
        this.TweenHideUI(callback);

    }

    TweenClick() {
        cc.tween(this.spr_Hand.node)
            .delay(1)
            .call(() => this.spr_Hand.spriteFrame = this.sf_Hand[1])
            .to(0.15, {scale : 0.7})            
            .to(0.15, {scale : 1})
            .call(() => this.spr_Hand.spriteFrame = this.sf_Hand[0])
            .union()
            .repeatForever()
            .start()
    }

    async TweenHideUI(func?: Function) {
        cc.tween(this.node)
            .delay(0.2)    
            .to(0.3, {scale: 0.2})
            .call(() => {
                this.node.active = false;
            })
            .union()
            .start()
        
        await delay(0.5 * 1000);
        if(func) func();        
    }
}
