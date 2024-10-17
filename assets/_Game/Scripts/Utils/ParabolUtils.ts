// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ParabolUtils extends Comment{
    public static GRAVITY = cc.v2(0, -320);

    public static getVelocityDependTime(gravity: cc.Vec2, time: number, velInit: cc.Vec2) {
        const x = this.getVelocityDependTimeUnit(gravity.x, time, velInit.x);
        const y = this.getVelocityDependTimeUnit(gravity.y, time, velInit.y);
        
        return cc.v2(x, y);
    }

    private static getVelocityDependTimeUnit(g: number, t: number, v: number) {
        return g * t + v;
    }

    public static getPositionDependTime(gravity: cc.Vec2, time: number, velInit: cc.Vec2, posInit: cc.Vec2) {
        const x = this.getPositionDependTimeUnit(gravity.x, time, velInit.x, posInit.x);
        const y = this.getPositionDependTimeUnit(gravity.y, time, velInit.y, posInit.y);

        return cc.v2(x, y);
    }

    private static getPositionDependTimeUnit(g, t, v, p) {
        return 0.5 * g * t * t + v * t + p;
    }

    public static getTimeJumping(gravity: cc.Vec2, vt: cc.Vec2, vo: cc.Vec2) {
        // Trục X không liên quan vì gravity X luôn bằng 0
        return Math.abs((vt.y - vo.y) / gravity.y);
    }  
    
    
    public static getTimeFalling(h: cc.Vec2, g: cc.Vec2) {
        return Math.sqrt(2 * h.y / - g.y);
    }

    public static convertGravity(gravity: number) {
        let result = cc.v2();
        this.GRAVITY.mul(gravity, result);
        return result;
    }

    //gravityStrength < 0
    public static convertGravityStrengthToScale(gravityStrength: number) 
    {
        return gravityStrength / this.GRAVITY.y;
    }
}
