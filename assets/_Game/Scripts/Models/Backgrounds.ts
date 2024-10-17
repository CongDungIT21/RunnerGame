// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "../Manager/GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Backgrounds extends cc.Component {
    private readonly speed: number = 100; //Nên bằng tốc độ của player
    @property(cc.Node)
    listBackground: cc.Node[] = []
    update (dt) {
        const cameraPos = GameManager.instance.camera.getWorldPosition();
        // console.log("cameraPos", cameraPos);
        const backgroundPos = this.listBackground[0].getWorldPosition();

        if(cameraPos.x - backgroundPos.x > 1920) {
            let instance = this.listBackground.shift(); // Lấy và xóa cái đầu tiên
            this.listBackground.push(instance); // Đẩy vào sau cùng
            let child = cc.instantiate(instance);
            this.node.addChild(child);
        }
    }
}
