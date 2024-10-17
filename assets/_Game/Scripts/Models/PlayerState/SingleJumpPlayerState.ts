import { TYPE_STATE } from "../../StateMachine/IState";
import ParabolUtils from "../../Utils/ParabolUtils";
import Player from "../Player";
import PlayerState from "./PlayerState";

export default class SingleJumpPlayerState extends PlayerState {
    private gravityStrength: number;  // < 0
    private acceleration: number = -320; // < 0
    private gravityScale: number;

    private jumpHeight: number = 100;
    private jumpTimeToApex: number = 0.4;
    private jumpForce: number;

    constructor(player: Player, animName: string) {
        super(player, animName, TYPE_STATE.SINGLE_JUMP);
    }
    OnEnter(): void {
        //console.log("OnEnter State SINGLE_JUMP");
        this.player.updateSkeletonAnim(this.animName, true);
        this.player.updateSkeletonTimeScale(0.9);
        this.player.OnSingleJump();
        //this.getJumpForce();
        //this.player.OnSingleJumpByParams(this.jumpForce, (this.gravityStrength + this.acceleration) / -320);
        this.player.SingleJumping = true;
    }

    Update(): void {

    }

    FixedUpdate(): void {
        //console.log("FixedUpdate State SINGLE_JUMP");
    }
    OnExit(): void {
        console.log("OnExit State SINGLE_JUMP");
        this.player.SingleJumping = false;
    }
}