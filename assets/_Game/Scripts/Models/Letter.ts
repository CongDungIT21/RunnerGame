// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CollisionType } from "../Enums/CollisionType";
import { Easing } from "../Enums/Easing";
import { PhysicCollisionType } from "../Enums/PhysicCollisionType";
import { DataItem } from "../GameController";
import AudioManager from "../Manager/AudioManager";
import GameManager, { LetterPresenter } from "../Manager/GameManager";
import InputManager from "../Manager/InputManager";
import { delay } from "../Utils/AsyncUtils";
import { getRandomHexStringColor } from "../Utils/MathUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Letter extends cc.Component {

    @property(cc.Label)
    lbl_content: cc.Label = null;
    @property(cc.Node)
    main: cc.Node = null;
    @property(cc.Animation)
    vfx_grow: cc.Animation = null;
    @property(cc.Sprite)
    img: cc.Sprite = null;

    id: number;
    hasReSpawn = false;
    isInited = false;
    isCollected = false;

    private data: LetterPresenter;

    protected start(): void {
        this.hasReSpawn = false;
    }

    OnInit(letterData: LetterPresenter) {
        // this.id = letterData.id;
        // this.lbl_content.string = letterData.letter;
        // this.main.color = new cc.Color().fromHEX(letterData.color);

        this.data = letterData;
        this.id = this.data.id;

        if(this.data.img == null) {
            console.log("Run without image", this.data);
            this.lbl_content.node.active = true;
            this.lbl_content.string = this.data.letter;
        }
        else
        {
            console.log("Run image", this.data);
            this.lbl_content.node.active = false;
            this.img.spriteFrame = this.data.img;
        }
    }

    OnInit_v2(letterData: any) {
        this.id = letterData.id;
        this.lbl_content.string = "";
        this.main.color = cc.Color.WHITE;
        this.img.spriteFrame = letterData.image;

    }

    inited()
    {
        this.isInited = true;
    }

    //#region COLLISION CONTACT
    onCollisionEnter(otherCollider: cc.Collider, selfCollider: cc.Collider) 
    {
        if(otherCollider.tag === CollisionType.PLAYER && selfCollider.tag === CollisionType.LETTER) 
        {
            this.isCollected = true;
            this.disableContact();            
            this.VFX_Grow();
            this.SFX_Correct();  
            
            let bottomNode: cc.Node = GameManager.instance.getLetterBottom(this.node);
            if(GameManager.instance.checkEndLevel_v2(bottomNode)) {
                InputManager.instance.disableTouchDetectionEvent();
            }
        }
    }
    //#endregion COLIISION CONTACT

    async tweenChangePosition() {        
        await delay((cc.director.getDeltaTime() * 1000) + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()));  
        const worldPosition = GameManager.instance.getPositionLetterBottom(this.node);   
        const localPosition = this.node.getLocalPosition(worldPosition);

        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.2, {position: localPosition}, {easing: cc.easing.backIn})
            .call(() => {
                this.node.active = false;
            })
            .union()
            .start();
            
        await delay(0.2 * 1000);
        GameManager.instance.checkEndLevel();    
    }

    async VFX_Grow() {
        this.node.scale = 0;
        cc.tween(this.node)            
            .by(0.25, {y: +150, scale: 1}, {easing: Easing.QuadOut})
            .call(() => this.vfx_grow.play())
            .delay(1)
            .call(() => {
                this.vfx_grow.stop();                
            })
            .union()
            .start();

        await delay(1.25 * 1000);
        this.tweenChangePosition();
    }

    VFX_Grow_UnStop() {
        this.vfx_grow.play();
    }

    SFX_Correct() {
        AudioManager.instance.playResult(true);
    }

    disableContact() {        
        this.node.getComponents(cc.Collider).forEach((c: cc.Collider) => c.enabled = false);
    }

    protected update(dt: number): void {
        if(this.isInited === false) return;

        const playerPos = GameManager.instance.player.getWorldPosition();
        const positionLetter = this.node.getWorldPosition();

        if(playerPos.x - positionLetter.x > 1920) {
            this.node.active = false;   
            GameManager.instance.queueLetters.shift();         
        }

        if(this.hasReSpawn) return;
        if(playerPos.x - positionLetter.x > 200) {
            this.hasReSpawn = true;

            // if(GameManager.instance.INIT_TYPE == 1)
            //     GameManager.instance.reSpawnLetterTop(this.node);
            // else if(GameManager.instance.INIT_TYPE == 2)
            // {
            //     //TEST
            //     GameManager.instance.reSpawnLetterTop_v2(this.node);
            //     //END TEST
            // }

            GameManager.instance.reSpawnLetterTop(this.node); 
        }
    }


}
