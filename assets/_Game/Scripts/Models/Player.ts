// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { PhysicCollisionType } from "../Enums/PhysicCollisionType";
import GameController, { GAME_STATE } from "../GameController";
import GameManager from "../Manager/GameManager";
import { FuncPredicate } from "../StateMachine/FuncPredicate";
import { IPredicate } from "../StateMachine/IPredicate";
import { IState, TYPE_STATE } from "../StateMachine/IState";
import { StateMachine } from "../StateMachine/StateMachine";
import { delay } from "../Utils/AsyncUtils";
import ParabolUtils from "../Utils/ParabolUtils";
import DoubleJumpPlayerState from "./PlayerState/DoubleJumpPlayerState";
import FallPlayerState from "./PlayerState/FallPlayerState";
import FallToRunState from "./PlayerState/FallToRunState";
import HurtPlayerState from "./PlayerState/HurtPlayerState";
import IdlePlayerState from "./PlayerState/IdlePlayerState";
import RunPlayerState from "./PlayerState/RunPlayerState";
import SingleJumpPlayerState from "./PlayerState/SingleJumpPlayerState";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.RigidBody)
    rigidBody: cc.RigidBody = null;
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    private readonly DF_FLIP: number = 1;
    private readonly forceJump: number = 600;

    //IDLE Setting
    //Single jump setting
    private readonly singleJumpForce: number = 300;
    public readonly singleJumpGravity: number = 1;
    private readonly singleJumpHeight: number = 300;
    private readonly singleJumpTimeToApex: number = 0.4;
    //double jump setting
    private readonly doubleJumpForce: number = 400;
    private readonly doubleJumpGravity: number = 1;
    private readonly doubleJumpHeight: number = 250;
    private readonly doubleJumpTimeToApex: number = 0.4;
    //fall setting
    public readonly fallGravity: number = 1;
    //hurt setting    
    private readonly hurtForce: number = 0;
    private readonly hurtGravity: number = 10;
    //run setting
    public runForce: number = 100;
    private readonly runGravity: number = 1;

    private stateMachine: StateMachine;

    public Idling: boolean = false;
    public SingleJumping: boolean = false;
    public DouleJumping: boolean = false;
    public Falling: boolean = false;
    public Hurting: boolean = false;
    public Running: boolean = false;
    public FallToRun: boolean = false;
    private Pausing: boolean = false;

    private pressSingleJump = false;
    private pressDoubleJump = false;
    public canDoubleJump = true;
    private isHurt = false;
    private isFallToRun = false;

    private hasContactGround: boolean = false;
    private hasContactObstacle: boolean = false;
    private hasContactLetter: boolean = false;

    private cachePos: cc.Vec3;

    //#region OS
    protected onLoad(): void {
    }
    protected start(): void {
        this.node.scaleX = this.DF_FLIP;        
    }

    protected update(dt: number): void {
        if(this.Pausing)
        {
            this.node.x = this.cachePos.x;
        }

        if(this.stateMachine)
            this.stateMachine.Update();
    }

    protected lateUpdate(dt: number): void {
        if(this.Pausing)
        {
            this.node.x = this.cachePos.x;
        }
    
        if(this.stateMachine)
            this.stateMachine.FixedUpdate();
    }
    //#endregion

    //#region State Machine
    private setupStateMachine() {
        this.stateMachine = new StateMachine();

        let idleState: IdlePlayerState = new IdlePlayerState(this, "idle");
        let runState: RunPlayerState = new RunPlayerState(this, "run");
        let singleJumpState: SingleJumpPlayerState = new SingleJumpPlayerState(this, "jump");
        let doubleJumpState: DoubleJumpPlayerState = new DoubleJumpPlayerState(this, "jump");
        let hurtState: HurtPlayerState = new HurtPlayerState(this, "hurt");
        let fallState: FallPlayerState = new FallPlayerState(this, "fall");
        let fallToRunState: FallToRunState = new FallToRunState(this, "fall-to-run");

        //#region Idle State
        this.addTransitionAt(idleState, runState, new FuncPredicate(() => {
            //console.log("this.rigidBody.enabledContactListener === true: " + (this.rigidBody.enabledContactListener === true));
            return this.rigidBody.enabledContactListener === true;
        }))

        this.addTransitionAt(idleState, singleJumpState, new FuncPredicate(() => {
            //return this.pressSingleJump;
            return false;
        }))

        this.addTransitionAt(idleState, doubleJumpState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(idleState, hurtState, new FuncPredicate(() => {
            return this.isHurt;
        }))

        this.addTransitionAt(idleState, fallState, new FuncPredicate(() => {
            return false;
        }))
        //#endregion Idle State 

        //#region Run State
        this.addTransitionAt(runState, idleState, new FuncPredicate(() => {
            //return Math.abs(this.rigidBody.linearVelocity.x) < 10 && Math.abs(this.rigidBody.linearVelocity.y) < 10;
            return this.rigidBody.enabledContactListener == false;
        }))

        this.addTransitionAt(runState, singleJumpState, new FuncPredicate(() => {
            return this.pressSingleJump;
        }))

        this.addTransitionAt(runState, doubleJumpState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(runState, hurtState, new FuncPredicate(() => {
            return this.isHurt;
        }))

        this.addTransitionAt(runState, fallState, new FuncPredicate(() => {
            return false;
        }))
        //#endregion Run State

        //#region Single Jump State
        this.addTransitionAt(singleJumpState, idleState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(singleJumpState, runState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(singleJumpState, doubleJumpState, new FuncPredicate(() => {
            return this.pressDoubleJump;
        }))

        this.addTransitionAt(singleJumpState, hurtState, new FuncPredicate(() => {
            return this.isHurt;
        }))

        this.addTransitionAt(singleJumpState, fallState, new FuncPredicate(() => {
            return this.isHurt == false && this.rigidBody.linearVelocity.y <= 0;
        }))
        //#endregion Single Jump State

        //#region Double Jump State
        this.addTransitionAt(doubleJumpState, idleState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(doubleJumpState, runState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(doubleJumpState, singleJumpState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(doubleJumpState, hurtState, new FuncPredicate(() => {
            return this.isHurt;
        }))

        this.addTransitionAt(doubleJumpState, fallState, new FuncPredicate(() => {
            return this.rigidBody.linearVelocity.y <= 0;
        }))
        //#endregion double Jump State

        //#region Hurt State
        this.addTransitionAt(hurtState, idleState, new FuncPredicate(() => {
            return false;
            //return this.isHurt == false &&Math.abs(this.rigidBody.linearVelocity.x) < 10 && Math.abs(this.rigidBody.linearVelocity.y) < 10;
        }))

        this.addTransitionAt(hurtState, runState, new FuncPredicate(() => {
            //console.log("this.isHurt: ", this.isHurt);
            //console.log("this.hasContactGround: ", this.hasContactGround);
            return this.isHurt == false && this.hasContactGround == true;
        }))

        this.addTransitionAt(hurtState, singleJumpState, new FuncPredicate(() => {
            //return this.pressSingleJump && this.isHurt == false;
            return false;
        }))

        this.addTransitionAt(hurtState, doubleJumpState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(hurtState, fallState, new FuncPredicate(() => {
            //return this.isHurt == false && this.rigidBody.linearVelocity.y < -10;
            return false;
        }))
        //#endregion Hurt State

        //#region Fall State
        this.addTransitionAt(fallState, idleState, new FuncPredicate(() => {
            return Math.abs(this.rigidBody.linearVelocity.x) < 10 && Math.abs(this.rigidBody.linearVelocity.y) < 10;
        }))

        this.addTransitionAt(fallState, runState, new FuncPredicate(() => {
            //return this.hasContactGround;
            return false;
        }))

        this.addTransitionAt(fallState, singleJumpState, new FuncPredicate(() => {
            return false;
        }))

        this.addTransitionAt(fallState, doubleJumpState, new FuncPredicate(() => {
            return this.canDoubleJump === true && this.pressDoubleJump;            
        }))

        this.addTransitionAt(fallState, hurtState, new FuncPredicate(() => {
            return this.isHurt;
        }))

        this.addTransitionAt(fallState, fallToRunState, new FuncPredicate(() => {
            return this.hasContactGround && this.isHurt == false;
        }))
        //#endregion Fall State

        //#region Fall to Run State
        this.addTransitionAt(fallToRunState, runState, new FuncPredicate(() => {
            return this.hasContactGround && this.isFallToRun == false;
        }))
        //#endregion Fall to run state
        
        this.addTransitionAny(idleState, new FuncPredicate(() => {
            if(this.Pausing && this.hasContactGround)
            {
                this.Pausing = false;
                GameManager.instance.OnEndLevel();
                return true;
            }
            
            return (!this.SingleJumping && !this.DouleJumping && !this.Hurting && !this.Falling && !this.Running && !this.Idling && !this.FallToRun);
        }))        

        this.stateMachine.SetState(idleState);
    }

    private addTransitionAt(from: IState, to: IState, condition: IPredicate): void {
        this.stateMachine.AddTransition(from, to, condition);
    }

    private addTransitionAny(to: IState, condition: IPredicate) {
        this.stateMachine.AddAnyTransition(to, condition);
    }

    //#endregion State Machine
    OnInit(speed: number) {
        console.log("🚀 ~ Player ~ OnInit ~ OnInit:")
        
        this.runForce = speed;        
        this.node.position = new cc.Vec3(-1920/2 + 150, -200, 0);
        this.setupStateMachine();

        this.rigidBody.linearVelocity = new cc.Vec2(0, 0);   
        this.rigidBody.enabledContactListener = false; 
        this.rigidBody.type = cc.RigidBodyType.Static;
        this.node.getComponents(cc.Collider).forEach((c: cc.Collider) => c.enabled = false); 
    }

    OnStart() {
        console.log("🚀 ~ Player ~ OnStart ~ OnStart:")
        this.rigidBody.enabledContactListener = true;
        this.node.getComponents(cc.Collider).forEach((c: cc.Collider) => c.enabled = true);
        this.rigidBody.type = cc.RigidBodyType.Dynamic;
        
        this.Pausing = false;
        this.Idling = true;
        this.SingleJumping = false;
        this.DouleJumping = false;
        this.Falling = false;
        this.Hurting = false;
        this.Running = false;
    
        this.pressSingleJump = false;
        this.pressDoubleJump = false;
        this.canDoubleJump = true;
        this.isHurt = false;
    
        this.hasContactGround = false;
        this.hasContactObstacle = false;
        this.hasContactLetter = false;        
    }

    OnPause() { 
        console.log("OnPause");
        this.Pausing = true;

        this.cachePos = this.node.position;

        if(this.isHurt) {
            this.Hurting = false;
            this.isHurt = false;
        }

        this.rigidBody.linearVelocity = new cc.Vec2(-100000, 0);
        console.log(this.node.position);
    }

    OnEnd() {
        console.log("🚀 ~ Player ~ OnEnd ~ OnEnd:")
        this.rigidBody.linearVelocity = new cc.Vec2(0, 0);
        this.rigidBody.enabledContactListener = false;
        this.rigidBody.type = cc.RigidBodyType.Static;
        this.node.getComponents(cc.Collider).forEach((c: cc.Collider) => c.enabled = false);
        console.log(this.node.position);
    }

    //#region PHYSICS CONTACT
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void { 
        if(otherCollider.tag === PhysicCollisionType.GROUND) {
            console.log("OnBeginContact Ground", otherCollider.uuid);
            this.hasContactGround = true;
            this.pressDoubleJump = false;
            this.pressSingleJump = false;
            this.canDoubleJump = true;
        }

        if(otherCollider.tag === PhysicCollisionType.OBSTACLE) 
        {
            //this.hasContactObstacle = true;
            this.isHurt = true;
        }

        if(otherCollider.tag === PhysicCollisionType.LETTER) 
        {
            this.hasContactLetter = true;
        }      
    }   
    
    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void {
        console.log("onEndContact Ground", otherCollider.uuid);
        if(otherCollider.tag === PhysicCollisionType.GROUND) {   
            console.log("1111");        
            if(this.SingleJumping || this.DouleJumping)
            {
                console.log("22222");
                this.hasContactGround = false;
            }
        }
    }
    //#endregion

    //#region Velocity
    setLinearVelocity(x?: number, y?: number) {
        if(x == null) 
        {
            x = this.rigidBody.linearVelocity.x;
        }

        if(y == null) 
        {
            y = this.rigidBody.linearVelocity.y;
        }
        const velocity = cc.v2(x , y);
        this.rigidBody.linearVelocity = velocity;
    }

    getLinearVelocity(): cc.Vec2 {
        return this.rigidBody.linearVelocity;
    }

    setGravity(gravity?: number ) {
        this.rigidBody.gravityScale = gravity;
    }
    
    getVelocityInitial(): cc.Vec2 {
        return cc.v2(this.runForce, this.singleJumpForce);
    }
    //#endregion Velocity

    //#region Skeleton
    public updateSkeletonAnim(animName: string, isLoop: boolean = true) {
        console.log("Update Skeleton " + animName);
        let currAnim: string = this.skeleton.animation;

        if(currAnim === "jump" || animName === "fall") {
            this.skeleton.setMix(currAnim, animName, 0.2);
        }
        else if(animName === "jump-to-fall") {
            this.skeleton.setMix(currAnim, animName, 0);
        }
        else {
            this.skeleton.setMix(currAnim, animName, 0.1);
        }

        this.skeleton.setAnimation(0, animName, isLoop);
    }

    public updateSkeletonTimeScale(timeScale: number) {
        this.skeleton.timeScale = timeScale;
    }
    //#endregion Skeleton

    //#region Behavior
    public JumpInput() 
    {
        if(this.Hurting) return;

        if(this.Falling && this.pressSingleJump) {
            this.pressDoubleJump = true;
            return;
        }

        if(this.Idling || this.Running) {
            this.pressSingleJump = true;
            return;
        }

        if(this.SingleJumping) {
            this.pressDoubleJump = true;
            return;
        }
    }

    public OnSingleJump() {
        let gravityStrength = -(2 * this.singleJumpHeight) / (this.singleJumpTimeToApex * this.singleJumpTimeToApex) + 0;
        let forceY = - gravityStrength * this.singleJumpTimeToApex;
        let forceX = 1.8 * this.runForce;
        this.hasContactGround = false;
        this.setLinearVelocity(forceX, forceY);
        this.setGravity(ParabolUtils.convertGravityStrengthToScale(gravityStrength));
    }

    public OnSingleJumpByParams(vel: number, g: number): void
    {
        console.log("Vel: " + vel + " Gravity: " + g);
        this.hasContactGround = false;
        this.setLinearVelocity(null, vel);
        this.setGravity(g);
    }

    public OnDoubleJump() {
        let gravityStrength = -(2 * this.doubleJumpHeight) / (this.doubleJumpTimeToApex * this.doubleJumpTimeToApex) + this.getLinearVelocity().y;
        let forceY = - gravityStrength * this.singleJumpTimeToApex;
        let forceX = 1.8 * this.runForce;
        this.hasContactGround = false;
        this.setLinearVelocity(forceX, forceY);
        this.setGravity(ParabolUtils.convertGravityStrengthToScale(gravityStrength));    
    }

    public OnFall() {
        this.hasContactGround = false;
        //Bonus gravity if want fall fast
        //this.setLinearVelocity(this.runForce, this.fallForceY);
        //this.setGravity(this.fallGravity);
    }

    public async OnFallToRun() {
        this.isFallToRun = true;
        this.setLinearVelocity(0, null);
        await delay(100);
        this.isFallToRun = false;
    }

    public OnRun() {
        this.setLinearVelocity(this.runForce, null);
        this.setGravity(this.runGravity);
    }

    public OnIdle() {
        console.log("On Idle");
    }

    public async OnHurt() 
    {    
        console.log("Start Hurt");
        this.isHurt = true;    
        await delay(1000);
        console.log("End Hurt");
        this.isHurt = false;
    }

    public SetHurt() 
    {
        this.setLinearVelocity(this.hurtForce, null);
        this.setGravity(this.hurtGravity);
    }
}
