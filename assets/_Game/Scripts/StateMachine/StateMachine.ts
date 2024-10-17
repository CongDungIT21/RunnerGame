import { IPredicate } from "./IPredicate";
import { IState, TYPE_STATE } from "./IState";
import { ITransition } from "./ITransition";
import { StateNode } from "./StateNode";
import { Transition } from "./Transition";

export class StateMachine {
    current: StateNode;
    //nodes: Map<Type, StateNode> = new Map<Type, StateNode>();\
    cacheNodes: Map<TYPE_STATE, StateNode> = new Map<TYPE_STATE, StateNode>();

    anyTransitions: Set<ITransition> = new Set<ITransition>();
    constructor() {

    }

    public Update() {
        let transition: ITransition = this.GetTransition();
        if(transition != null) {
            this.ChangeState(transition.To);
        }

        this.current.State?.Update();
    }

    public FixedUpdate() {
        this.current.State?.FixedUpdate();
    }

    public SetState(state: IState) {
        this.current = this.GetOrAddNode(state);
        this.current.State?.OnEnter();
    }

    private GetTransition(): ITransition {
        let arrAnyTrans = Array.from(this.anyTransitions.values());
        for (let i = 0; i < arrAnyTrans.length; i++) 
        {
            let trans = arrAnyTrans[i];            
            if(trans.Condition.Evaluate()) {
                return trans as ITransition;
            }
        }

        let arrCurrTrans = Array.from(this.current.Transitions.values());
        for (let i = 0; i < arrCurrTrans.length; i++) 
        {   
            let trans = arrCurrTrans[i];                         
            if(trans.Condition.Evaluate()) {
                return trans as ITransition;
            }
        }

        return null;
    }

    private ChangeState(state: IState) {
        if(state == this.current.State) 
        {
            return;
        }        
        let previousState = this.current.State;
        let nextState = this.cacheNodes.get(state.type).State;

        previousState?.OnExit();
        nextState?.OnEnter();        
        this.current = this.cacheNodes.get(state.type)
    }

    public GetOrAddNode(state: IState): StateNode {
        //let node = this.cacheNodes.GetValueOrDefault(state.GetType());        
        let node = this.cacheNodes.get(state.type);

        if (node == null) {
            node = new StateNode(state);
            this.cacheNodes.set(state.type, node);
        }
        return node;
    }

    public AddTransition(from: IState, to: IState, condition: IPredicate) {
        this.GetOrAddNode(from).AddTransition(this.GetOrAddNode(to).State, condition);
    }
    public AddAnyTransition(to: IState, condition: IPredicate) {
        this.anyTransitions.add(new Transition(this.GetOrAddNode(to).State, condition));
    }
}