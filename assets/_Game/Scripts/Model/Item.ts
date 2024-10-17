// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CollisionType } from "../Enums/CollisionType";
import { DataItem } from "../GameController";
import AudioManager from "../Manager/AudioManager";
import GameManager from "../Manager/GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Item extends cc.Component {
    public data: DataItem = null;

    private nodeContact: cc.Node = null; //Empty Node
    private orginParent: cc.Node = null;
    protected onLoad(): void { 
        //console.log("onTouchEvent")        
        this.onTouchEvent();      
    }

    //#region TOUCH EVENT       
    private onTouchStart(event: cc.Event.EventTouch): void {
        this.node.scale = 1.15;

        this.orginParent = this.node.parent;

        const worldPosition = this.node.getWorldPosition();
        this.node.setParent(GameManager.instance.rowBottom);
        this.node.setWorldPosition(worldPosition);
    }

    private onTouchMove(event: cc.Event.EventTouch): void {
        const delta = event.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        this.node.scale = 1;
        if(this.nodeContact) {
            if(this.data.id === this.nodeContact.getComponent(Item).data.id) 
            {       
                //TODO: Âm thanh báo đúng
                this.nodeContact.active = true;
                this.nodeContact.parent.getComponent(cc.Sprite).enabled = false;
                GameManager.instance.actionCorrectItem(this.nodeContact.parent);
                GameManager.instance.checkEndGame();
                AudioManager.instance.playResultSound(true);

                this.node.active = false;
            }
            else {
                //TODO: Âm thanh báo sai
                AudioManager.instance.playResultSound(false);
            }
        }
        this.node.parent = this.orginParent;
        this.node.setPosition(cc.Vec2.ZERO)
        this.nodeContact = null;       
    }    

    private onTouchEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this); 
    }

    public offTouchEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
    }

    //#endregion

    //#region COLLISION CONTACT 
    onCollisionEnter(other: cc.Collider, seft: cc.Collider): void {
        if(other.tag === CollisionType.EMPTY) {
            this.nodeContact = other.node.getChildByName("Item");
        }
    }

    onCollisionStay(other: cc.Collider, seft: cc.Collider): void {
        if(other.tag === CollisionType.EMPTY) {
            this.nodeContact = other.node.getChildByName("Item");
        }
    }

    onCollisionExit(other: cc.Collider, seft: cc.Collider): void {
        if(other.tag === CollisionType.EMPTY) {
            this.nodeContact = null;
        }
    }
    //#endregion
}
