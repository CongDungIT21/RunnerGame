// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "../Manager/GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIStartGame extends cc.Component {
    @property(cc.Label)
    lbl_descWord: cc.Label;

    OnInit(desc: string) {
        this.lbl_descWord.string = desc;
    }

    OnClickStart() {
        GameManager.instance.startLevel();
        this.node.destroy();
    }
}
