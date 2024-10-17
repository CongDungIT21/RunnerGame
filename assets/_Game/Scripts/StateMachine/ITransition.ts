import { IPredicate } from "./IPredicate";
import { IState } from "./IState";

export interface ITransition {
    To: IState; //Get Only
    Condition: IPredicate; //Get Only
}