import { IPredicate } from "./IPredicate";
import { IState } from "./IState";
import { ITransition } from "./ITransition";
import { Transition } from "./Transition";

export class StateNode {
    public State: IState; //Get Only
    public Transitions: Set<ITransition>; //Get Only

    public constructor(state: IState) {
        this.State = state;
        this.Transitions = new Set<ITransition>();
    }

    public AddTransition(to: IState, condition: IPredicate) {
        this.Transitions.add(new Transition(to, condition));
    }
}