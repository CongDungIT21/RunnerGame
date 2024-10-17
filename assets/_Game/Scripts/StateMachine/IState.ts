export enum TYPE_STATE 
{
    NODE,
    SINGLE_JUMP,
    DOUBLE_JUMP,
    IDLE,
    RUN,
    HURT,
    FALL,
    FALL_TO_RUN
}

export interface IState {
    readonly type: TYPE_STATE;
    OnEnter(): void;
    Update(): void;
    FixedUpdate(): void;
    OnExit(): void;
}