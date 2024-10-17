import { TYPE_STATE } from "../../StateMachine/IState";
import Player from "../Player";
import PlayerState from "./PlayerState";

export default class DoubleJumpPlayerState extends PlayerState {
    constructor(player: Player, animName: string) {
        super(player, animName, TYPE_STATE.DOUBLE_JUMP);
    }
    OnEnter(): void {
        //console.log("OnEnter State DOUBLE_JUMP");
        this.player.updateSkeletonAnim(this.animName, false);
        this.player.updateSkeletonTimeScale(0.9);
        this.player.OnDoubleJump();
        this.player.DouleJumping = true;
        this.player.canDoubleJump = false;
    }
    Update(): void {
        //console.log("Update State DOUBLE_JUMP");
    }
    FixedUpdate(): void {
        //console.log("FixedUpdate State DOUBLE_JUMP");
    }
    OnExit(): void {
        //console.log("OnExit State DOUBLE_JUMP");
        this.player.DouleJumping = false;
    }

}