// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "../Manager/GameManager";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Camera extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;

    lastPosition: cc.Vec2;
    startFollowing: boolean;
    
    private isPaused = false;

    OnInit() {
        this.node.x = 0;
        this.node.y = 0;
        this.isPaused = false;
    }

    OnPause() {
        this.isPaused = true;
        this.startFollowing = false;
    }

    OnStart() {
        this.isPaused = false;
    }

    SetUp(player: cc.Node) {
        this.player = player;
        this.isPaused = false;
        this.startFollowing = false;
    }

    protected update(dt: number): void {
        GameManager.instance.updatePositionLetterBottom(this.node.getPosition())
    }

    protected lateUpdate(dt: number): void {             
        if(!this.player) return;
        if(this.isPaused) return;

        let positionPlayer = this.player.getPosition();
        this.lastPosition = positionPlayer;
        let positionCamera = this.node.getPosition();

        // if(positionPlayer.x - positionCamera.x <= 1) 
        //     return;

        // if(Math.abs(positionCamera.x - positionPlayer.x) >= 100) {
        //     this.startFollowing = true;
        // }

        // if(this.startFollowing) {
        //     let distance = cc.Vec2.distance(positionPlayer, positionCamera);
        //     let newPos = positionCamera.lerp(positionPlayer, dt);
        //     this.node.setPosition(new cc.Vec3(newPos.x, this.node.y, this.node.z));

        //     if (distance <= 1) {
        //         this.startFollowing = false;
        //     }
        // }

        let desiredPosition = new cc.Vec2(positionPlayer.x + 800, positionPlayer.y);
        if(desiredPosition.x < 0 - 400) 
            return;

        if(Math.abs(positionCamera.x - desiredPosition.x) >= 400) {
             this.startFollowing = true;
        }

        if(this.startFollowing) {
            let newPos = positionCamera.lerp(desiredPosition, dt);
            //let newPos = desiredPosition.lerp(positionCamera, dt);
            this.node.setPosition(new cc.Vec3(newPos.x, this.node.y, this.node.z));
            
            let distance = cc.Vec2.distance(desiredPosition, positionCamera);
            if (distance <= 1) {
                this.startFollowing = false;
            }
        }
    }
}
