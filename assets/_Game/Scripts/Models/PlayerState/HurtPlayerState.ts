import { TYPE_STATE } from "../../StateMachine/IState";
import Player from "../Player";
import PlayerState from "./PlayerState";

export default class HurtPlayerState extends PlayerState {
    constructor(player: Player, animName: string) {
        super(player, animName, TYPE_STATE.HURT);
    }
    OnEnter(): void {
        console.log("OnEnter State HURT");
        this.player.updateSkeletonAnim(this.animName, true);
        this.player.updateSkeletonTimeScale(1);
        this.player.OnHurt();
        this.player.SetHurt();
        this.player.Hurting = true;
    }
    Update(): void {
        //console.log("Update State HURT");        
    }
    FixedUpdate(): void {
        console.log("FixedUpdate State HURT");
        this.player.SetHurt();
    }
    OnExit(): void {
        console.log("OnExit State HURT");
        this.player.Hurting = false;
    }

}