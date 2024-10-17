// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameController, { GAME_STATE } from "../GameController";
import GameManager from "../Manager/GameManager";
import InputManager from "../Manager/InputManager";
import UIManager from "../Manager/UIManager";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass("TouchLayer")
export default class TouchLayer extends cc.Component {
    private player: Player;

    protected start(): void {
        //this.player = GameManager.instance.player.getComponent(Player);
    }

    SetUp(player: cc.Node) {
        this.player = player.getComponent(Player);
    }

    //#region TOUCH EVENT       
    private onTouchStart(event: cc.Event.EventTouch): void {    
        if(GameController.instance.currentState === GAME_STATE.PLAY) {
            console.log("Run Here");
            this.player.JumpInput();
        }
        else if(GameController.instance.currentState === GAME_STATE.START) {
            InputManager.instance.enabledTouchDetectionEvent();
            UIManager.instance.displayUIStartLevel();
        }   
    }

    private onTouchMove(event: cc.Event.EventTouch): void {  
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
    }    
    
    private onTouchCancel(event: cc.Event.EventTouch): void {
    }

    public onTouchEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this); 
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    public offTouchEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);
    }

    //#endregion
}
