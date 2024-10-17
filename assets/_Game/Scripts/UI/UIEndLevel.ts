// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "../Manager/AudioManager";
import GameManager, { LetterPresenter } from "../Manager/GameManager";
import Letter from "../Models/Letter";
import { activeNode, delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIEndLevel extends cc.Component {
    @property(cc.Node)
    word: cc.Node = null;
    @property(cc.Prefab)
    pf_letter: cc.Prefab = null;
    @property(cc.AudioClip)
    clipLetter: cc.AudioClip = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Sprite)
    sp_word: cc.Sprite;

    @property(cc.Node)
    node_bg: cc.Node = null;

    OnInit(data: LetterPresenter[]) { 
        // if(GameManager.instance.INIT_TYPE == 1) {
        //     data.forEach(letterData => {
        //         let letter = cc.instantiate(this.pf_letter);            
        //         this.word.addChild(letter);
        //         letter.getComponent(Letter).OnInit(letterData);
        //         letter.removeComponent(cc.PhysicsCircleCollider)
        //         letter.removeComponent(cc.RigidBody)
        //     });
        // }      
        // else if(GameManager.instance.INIT_TYPE == 2) {
        //     data.forEach(letterData => {
        //         let letter = cc.instantiate(this.pf_letter);            
        //         this.word.addChild(letter);
        //         letter.getComponent(Letter).OnInit_v2(letterData);
        //         letter.removeComponent(cc.PhysicsCircleCollider)
        //         letter.removeComponent(cc.RigidBody)
        //     });
        // } 
        
        data.forEach(letterData => {
            let letter = cc.instantiate(this.pf_letter);            
            this.word.addChild(letter);
            letter.getComponent(Letter).OnInit(letterData);
            letter.removeComponent(cc.PhysicsCircleCollider)
            letter.removeComponent(cc.RigidBody)
        });

        this.VFX_Letter(GameManager.instance.mapLetters)        
    }

    protected onEnable(): void {
        this.resizeDisplay();
    }

    PlayLetterAudio(audio: cc.AudioClip) {
        //AudioManager.instance.playAudio(audio);
        this.clipLetter = audio;
    }
    ShowLetterImage(image: cc.SpriteFrame) {
        this.sp_word.spriteFrame = image;
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

    //Hiệu ứng cho từng chử cái
    async VFX_Letter(letterBottom : Map<number, cc.Node>) {
        await delay((cc.director.getDeltaTime() * 1000) + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()));      
        Array.from(letterBottom.entries()).forEach(entry => {
            let idx = entry[0];
            let l_Bottom: cc.Node = entry[1];

            if(GameManager.instance.INIT_TYPE == 2) idx -= 1;

            let l_Popup: cc.Node = this.word.children[idx];
            if(l_Bottom.active === false) {
                l_Popup.opacity = 120;
            }            
        })

        this.onPopOn(this.node);
    }

    SFX_Letter() {      
        cc.audioEngine.playEffect(this.clipLetter, false);
    }

    async onPopOn(node) {
        if(!node) return;
        node.active = true;
        node.setScale(1.2, 1.2);
        node.opacity = 0;
        node.stopAllActions();
        let acFadeOut = cc.fadeTo(0.2, 255).easing(cc.easeCubicActionOut());
        let acScaleOut = cc.scaleTo(0.2, 1.0).easing(cc.easeCubicActionOut());        
        node.runAction(cc.spawn(acScaleOut, acFadeOut));

        await delay(0.5 * 1000)
        this.SFX_Letter();
    }

    async onPopOff(node) {
        if(!node)
        {
            node = this.node;
        }
        
        node.stopAllActions();
        let acScaleOut = cc.scaleTo(0.2, 1.3).easing(cc.easeCubicActionIn());
        let acFadeOut = cc.fadeOut(0.2).easing(cc.easeCubicActionIn());
        node.runAction(cc.spawn(acScaleOut, acFadeOut));

        await delay(0.4)
        this.node.active = false;
    }
}
