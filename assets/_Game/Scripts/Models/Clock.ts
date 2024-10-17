// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameController, { GAME_STATE } from "../GameController";
import GameManager from "../Manager/GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Clock extends cc.Component {
    @property(cc.Node)
    point: cc.Node = null;
    @property(cc.Label)
    lbl_content: cc.Label = null;

    private _isTracking: boolean = false;
    private _couter = 0;

    
    protected start(): void {
        //this.point.setWorldPosition(this.node.getWorldPosition());
    }

    OnInit(time) {
        this._couter = time;
        this.updateContent(this._couter);
        this.lbl_content.node.color = new cc.Color().fromHEX("#1780E1");
        this.node.setWorldPosition(this.point.getWorldPosition());
    }

    OnStart() {
        this._isTracking = true;
    }

    OnPause() {
        this._isTracking = false;
    }

    OnEnd() {
        this._isTracking = false;
        this.updateContent(0);        
    }

    updateContent(number) {
        if(number < 0) number = 0;
        let min = Math.floor(number / 60);
        let sec = Math.floor(number % 60);

        let strMin = min < 10 ? `0${min}` : min;
        let strSec = sec < 10 ? `0${sec}` : sec;

        this.lbl_content.string = `${strMin}:${strSec}`;

        if(min === 0 && sec <= 5) {
            this.lbl_content.node.color = new cc.Color().fromHEX("#E23637");
        }
    }

    downTime(time: number) {
        this._couter -= time;
        this.updateContent(this._couter);
    }

    getCurrentTime() {
        return this._couter;
    }

    protected lateUpdate(dt: number): void {     
        if(this._isTracking) {
            this.node.setWorldPosition(this.point.getWorldPosition());
            this._couter -= dt;
            if(this._couter <= 0) {
                this.OnPause();
                GameManager.instance.OnPauseLevel();
            }
            this.updateContent(this._couter);
        }
    }
    
}
