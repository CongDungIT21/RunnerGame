// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Decorate extends cc.Component {
    @property(cc.SpriteFrame)
    sf_items: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    spr_item: cc.Sprite = null;

    OnInit(idx: number) {
        this.spr_item.spriteFrame = this.sf_items[idx];
    }
}
