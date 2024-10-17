import { IPredicate } from "./IPredicate";

export class FuncPredicate implements IPredicate{
    private readonly func: () => boolean;

    public constructor(func: () => boolean) {
        this.func = func;
    }

    Evaluate(): boolean {
        return this.func();
    }
}