// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class TweenUtils extends cc.Component {
    public static tweenDecor(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(0.3, {y: 20})
            .delay(1)
            .by(0.2, {y: -20})
            .union()
            .start()
    }

    public static tweenItem(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(0.3, {y: 20})
            .by(0.1, {x: -10})
            .by(0.2, {x: 10})
            .by(0.1, {x: -10})
            .by(0.2, {x: 10})
            .by(0.1, {x: -10})
            .by(0.2, {x: 10})
            .by(0.1, {x:10})
            .by(0.2, {y: -20})
            .union()
            .start()
    }
}
