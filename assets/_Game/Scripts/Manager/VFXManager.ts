// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { delay } from "../Utils/AsyncUtils";
import VFXAuto from "../VFX/VFXAuto";
import AudioManager from "./AudioManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VFXManager extends cc.Component {
    //#region Singleton
    private static _instance: VFXManager = null;
    public static get instance(): VFXManager {
        if(VFXManager._instance == null) {
            VFXManager._instance = new VFXManager();
        }
        return VFXManager._instance;
    }
    //#endregion 

    @property(cc.Node)
    rootVFX: cc.Node = null;

    @property(cc.Node)
    pf_VFXFireWork: cc.Node = null;

    protected onLoad(): void {
        VFXManager._instance = this;
    }

    protected start(): void {
        this.pf_VFXFireWork.active = false;
    }

    setVFXFireWord(wPos: cc.Vec3) {
        this.pf_VFXFireWork.active = true;
        this.pf_VFXFireWork.setWorldPosition(wPos.sub(new cc.Vec3(0, 450, 0)));
    }

    async spawnVFXFireWork() {
        AudioManager.instance.playAudioCheer();
        this.pf_VFXFireWork.active = true;
        return this.pf_VFXFireWork.getComponent(VFXAuto).OnInit();        
    }
}
