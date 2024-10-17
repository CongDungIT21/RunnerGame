// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Easing } from "../Enums/Easing";
import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Star extends cc.Component {
    @property(cc.Node)
    star_on: cc.Node = null;
    @property(cc.Node)
    star_off: cc.Node = null;

    async OnInit(state: boolean) {
        if(state == true) {
            await this.TweenOff();
            await this.TweenOn();
        }
    }

    async TweenOn() {
        cc.tween(this.star_on)
            .call(() => {
                this.star_on.active = true;
                this.star_on.scale = 0;
            })
            .to(0.2, {scale: 1}, {easing: Easing.CircOut})
            .union()
            .start();
        return await delay(0.2 * 1000);
    }

    async TweenOff() {
        cc.tween(this.star_off)
            .call(() => {
                this.star_off.active = true;
                this.star_off.scale = 1;
            })
            .to(0.2, {scale: 0}, {easing: Easing.CircIn})
            .union()
            .start();
        
        return await delay(0.2 * 1000);
    }
}   
