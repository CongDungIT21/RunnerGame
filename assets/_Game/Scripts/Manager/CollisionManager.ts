// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CollisionManager extends cc.Component {
    //#region SINGLETON
    private static _instance: CollisionManager = null;
    public static get instance(): CollisionManager {
        if (CollisionManager._instance == null) {
            CollisionManager._instance = new CollisionManager();
        }
        return CollisionManager._instance;
    }
    //#region


    protected onLoad(): void {
        this.enabledPhysicsSystem();
    }

    public disablePhysicsSystem() {
        cc.director.getCollisionManager().enabled = false;
    }

    public enabledPhysicsSystem() {
        // Enable Collision System
        // let manager = cc.director.getCollisionManager();
        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
        //cc.director.getCollisionManager().enabledDrawBoundingBox = true;

        // Enable Physics manager
        cc.director.getPhysicsManager().enabled = true;
        //cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //cc.PhysicsManager.DrawBits.e_jointBit |
        //cc.PhysicsManager.DrawBits.e_shapeBit;

        cc.director.getPhysicsManager().debugDrawFlags = 0;// Disable Drawing  
    }
}
