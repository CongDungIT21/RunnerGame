// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { PhysicCollisionType } from "../Enums/PhysicCollisionType";
import { DataObstacel } from "../GameController";
import AudioManager from "../Manager/AudioManager";
import GameManager from "../Manager/GameManager";
import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Obstacle extends cc.Component {
    @property(cc.Prefab)
    VFX_downtime: cc.Prefab = null;
    @property(cc.Sprite)
    img: cc.Sprite = null;

    private PauseState = false;

    OnInit_v2(obstacel: DataObstacel) {
        this.PauseState = false;
        this.img.spriteFrame = obstacel.image;
    }

    OnPause() {
        this.PauseState = true;
    }

    //#region PHYSICS CONTACT
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void { 
        if(otherCollider.tag === PhysicCollisionType.PLAYER) {     
            if(this.PauseState == false) {
                this.node.getComponent(cc.PhysicsBoxCollider).enabled = false;    
                this.VFX_DownTime();
                this.SFX();
            }   
        }

        //Đảm bảo khi spawn letter và obs không trùng nhau
        if(otherCollider.tag === PhysicCollisionType.LETTER) {            
            this.node.destroy();            
        }
    }
    //#endregion

    VFX_DownTime() {
        GameManager.instance.downTime();
        let vfx = cc.instantiate(this.VFX_downtime);
        this.node.addChild(vfx);        
        this.tweenVFX(vfx);
    }

    SFX() {
        AudioManager.instance.playResult(false);
    }

    async tweenVFX(vfx) {
        await delay((cc.director.getDeltaTime() * 1000) + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()));
        cc.Tween.stopAllByTarget(vfx);
        cc.tween(vfx)
            .call(() => vfx.scale = 0.5)
            .by(0.2, {scale: 0.75, y: this.node.height + 50}, {easing: "linear"})
            .union()
            .start();
        
        await delay(0.4 * 1000)
        this.node.destroy();
        vfx.destroy();
    }
}
