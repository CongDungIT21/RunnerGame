// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "../Manager/AudioManager";
import GameManager from "../Manager/GameManager";
import Star from "../Model/Star";
import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

export type DataFinish = {
    totalStarCompleted: number
    totalStar: number
}

@ccclass
export default class UIFinish extends cc.Component {
    @property(sp.Skeleton)
    ske_anim: sp.Skeleton = null;
    @property(cc.Sprite)
    spr_title: cc.Sprite = null;
    @property(cc.SpriteFrame)
    sf_title: cc.SpriteFrame[] = [];

    @property(Star)
    stars: Star[] = [];

    @property(cc.Node)
    node_bg: cc.Node = null;
    
    private data:DataFinish = {
        totalStarCompleted: 1,
        totalStar: 3
    }

    OnInit(data: DataFinish = this.data) {
        this.data = data;
        this.node.active = true;
        this.spr_title.spriteFrame = this.sf_title[data.totalStarCompleted - 1];
        this.OnStarCount(this.data);        
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

    OnStarCount(data) { 
        let totalTime: number = 0;

        this.stars.forEach((star: Star, idx: number) => {
            if(idx <= data.totalStarCompleted - 1) {
                const callback = () => {
                    star.OnInit(true);
                    AudioManager.instance.playAudioStarCount();
                }

                totalTime = idx;
                this.delayCallback(totalTime, callback);
            }

            console.log(totalTime);
        })

        this.delayCallback(totalTime + 1, () => {
            AudioManager.instance.playAudioStar(data.totalStarCompleted);
            this.SendDataToClient(data);
        });
    }

    OnClickReply() {
        GameManager.instance.OnInit();
        this.node.active = false;
    }

    OnClickActivity(event) {
        AudioManager.instance.playAudioTouchScreen();

        if(window.onTapToNextButton) {
            window.onTapToNextButton();
        }

        event.target.getComponent(cc.Button).interactable = false;

        //TEST
        //GameManager.instance.OnInitLevel();
        //END TEST
    }

    SendDataToClient(data: DataFinish) {        
        if(window.callFromCocos) {
            window.callFromCocos(JSON.stringify(data));
        }
    }

    async delayCallback(time: number, func: Function) {
        await delay(time * 1000);
        func();
    }
}
