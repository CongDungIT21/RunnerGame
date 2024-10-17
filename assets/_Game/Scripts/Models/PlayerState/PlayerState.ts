// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IState, TYPE_STATE } from "../../StateMachine/IState";
import Player from "../Player";
export default abstract class PlayerState implements IState {
    protected player: Player;
    protected animName: string;
    type: TYPE_STATE;

    constructor(player: Player, animName: string, type: TYPE_STATE) {
        this.player = player;
        this.animName = animName;
        this.type = type;
    }

    abstract OnEnter(): void;
    abstract Update(): void;
    abstract FixedUpdate(): void;
    abstract OnExit(): void; 
}
