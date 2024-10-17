import { IPredicate } from "./IPredicate";
import { IState } from "./IState";
import { ITransition } from "./ITransition";

export class Transition implements ITransition {
    To: IState;
    Condition: IPredicate;
    
    constructor(to: IState, condition: IPredicate) {
        this.To = to;
        this.Condition = condition;
    }
}