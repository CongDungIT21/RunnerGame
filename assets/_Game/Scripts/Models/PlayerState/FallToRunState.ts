// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { TYPE_STATE } from "../../StateMachine/IState";
import Player from "../Player";
import PlayerState from "./PlayerState";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FallToRunState extends PlayerState {
    constructor(player: Player, animName: string) {
        super(player, animName, TYPE_STATE.FALL_TO_RUN);
    }
    OnEnter(): void {
        //console.log("OnEnterFallToRun");
        this.player.updateSkeletonAnim(this.animName, false);
        this.player.updateSkeletonTimeScale(4);
        this.player.OnFallToRun();
        this.player.FallToRun = true;
    }
    Update(): void {
        //console.log("Update State Idle");
    }
    FixedUpdate(): void {
        //console.log("FixedUpdate State Idle");
    }
    OnExit(): void {
        //console.log("OnExitFallToRun");
        this.player.FallToRun = false;
    }

}
