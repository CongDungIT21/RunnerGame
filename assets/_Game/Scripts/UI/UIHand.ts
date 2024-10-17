// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameController from "../GameController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIHand extends cc.Component {
    @property(cc.Node)
    hand: cc.Node = null;
    @property(cc.SpriteFrame)
    sf_Hand: cc.SpriteFrame[] = [];

    OnInit() {
        this.tweenTouch();
    }

    OnClick(event: Event) {
        this.node.active = false;
        this.node.removeFromParent();
        //GameController.instance.playGame();
    }

    tweenMovingHand(point1: cc.Vec3, point2: cc.Vec3) {
        point1 = this.node.getLocalPosition(point1);
        point2 = this.node.getLocalPosition(point2);

        cc.Tween.stopAllByTarget(this.hand);
        cc.tween(this.hand)
            .call(() => {
                this.hand.active = true;
                this.hand.position = point1;
                this.hand.getComponent(cc.Sprite).spriteFrame = this.sf_Hand[0];
            })
            .delay(0.3)
            .call(() => this.hand.getComponent(cc.Sprite).spriteFrame = this.sf_Hand[1])
            .delay(1)
            .to(0.3, {position: point2})
            .delay(0.3)
            .call(() => this.hand.getComponent(cc.Sprite).spriteFrame = this.sf_Hand[0])
            .delay(1)
            .union()
            .repeatForever()
            .start()
    }

    tweenTouch() {
        cc.Tween.stopAllByTarget(this.hand);
        cc.tween(this.hand)
            .call(() => {
                this.hand.active = true;
                this.hand.position = cc.Vec3.ZERO;
                this.hand.getComponent(cc.Sprite).spriteFrame = this.sf_Hand[0];
                // console.log("🚀 ~ file: UIHand.ts:57 ~ UIHand ~ .call ~ this.hand.getComponent(cc.Sprite):", this.hand.getComponent(cc.Sprite))
            })
            .delay(0.3)
            .call(() => this.hand.getComponent(cc.Sprite).spriteFrame = this.sf_Hand[1])
            .delay(0.5)
            .union()
            .repeatForever()
            .start()
            // console.log("🚀 ~ file: UIHand.ts:65 ~ UIHand ~ tweenTouch ~ this.hand.getComponent(cc.Sprite):", this.hand.getComponent(cc.Sprite))
    }
}