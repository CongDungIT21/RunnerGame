// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { TYPE_STATE } from "../../StateMachine/IState";
import Player from "../Player";
import PlayerState from "./PlayerState";

export default class IdlePlayerState extends PlayerState {
    constructor(player: Player, animName: string) {
        super(player, animName, TYPE_STATE.IDLE);
    }
    OnEnter(): void {
        //console.log("OnEnter State Idle");
        this.player.updateSkeletonAnim(this.animName, true);
        this.player.updateSkeletonTimeScale(1);
        this.player.OnIdle();
        this.player.Idling = true;
    }
    Update(): void {
        //console.log("Update State Idle");
    }
    FixedUpdate(): void {
        //console.log("FixedUpdate State Idle");
    }
    OnExit(): void {
        //console.log("OnExit State Idle");
        this.player.Idling = false;
    }

}
