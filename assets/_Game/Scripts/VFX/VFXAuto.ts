// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VFXAuto extends cc.Component {
    @property(sp.Skeleton)
    ske_anim: sp.Skeleton = null


    async OnInit(func = null) {
        await delay(3 * 1000);
        this.node.active = false;
        if(func) func();
        return Promise.resolve();
    }
}
