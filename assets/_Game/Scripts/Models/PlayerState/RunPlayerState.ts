import { TYPE_STATE } from "../../StateMachine/IState";
import Player from "../Player";
import PlayerState from "./PlayerState";

export default class RunPlayerState extends PlayerState {
    constructor(player: Player, animName: string) {
        super(player, animName, TYPE_STATE.RUN);
    }
    OnEnter(): void {
        console.log("OnEnter State RUN");
        this.player.updateSkeletonAnim(this.animName, true);
        this.player.updateSkeletonTimeScale(1);
        this.player.OnRun();
        this.player.Running = true;
    }
    Update(): void {
        //console.log("Update State RUN");
    }
    FixedUpdate(): void {
        //console.log("FixedUpdate State RUN");
        this.player.OnRun();
    }
    OnExit(): void {
        console.log("OnExit State RUN");
        this.player.Running = false;
    }

}