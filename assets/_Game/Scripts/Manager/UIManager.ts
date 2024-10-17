import { DataTutorial } from "../GameController";
import UIEndLevel from "../UI/UIEndLevel";
import UIFinish, { DataFinish } from "../UI/UIFinish";
import UIHand from "../UI/UIHand";
import UIStartGame from "../UI/UIStartGame";
import UIStartLevel from "../UI/UIStartLevel";
import UITutorial from "../UI/UITutorial";
import { delay } from "../Utils/AsyncUtils";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {

    //#region SINGLETON
    private static _instance: UIManager = null;
    public static get instance(): UIManager {
        if (UIManager._instance == null) {
            UIManager._instance = new UIManager();
        }
        return UIManager._instance;
    }
    //#region

    @property(cc.Node)
    rootUI: cc.Node = null;
    @property(cc.Node)
    cam: cc.Node = null;

    @property(cc.Prefab)
    pf_UIStartGame: cc.Prefab = null;
    @property(cc.Prefab)
    pf_UIStartLevel: cc.Prefab = null;
    @property(cc.Prefab)
    pf_UIEndLevel: cc.Prefab = null;
    @property(cc.Prefab)
    pf_UIEndGame: cc.Prefab = null;
    @property(cc.Prefab)
    pf_UIHand: cc.Prefab = null;
    @property(cc.Prefab)
    pf_uiTutorial: cc.Prefab = null;
    @property(cc.Prefab)
    pf_uiFinish: cc.Prefab = null;


    @property(cc.SpriteFrame)
    sf_words: cc.SpriteFrame[] = [];

    onLoad () {
        UIManager._instance = this;
    }

    displayUIStart(desc: string) {
        console.log("🚀 ~ file: UIManager.ts:55 ~ UIManager ~ displayUIStart ~ displayUIStart:")
        let uiStartGame = cc.instantiate(this.pf_UIStartGame).getComponent(UIStartGame);
        uiStartGame.OnInit(desc);
        this.rootUI.addChild(uiStartGame.node);
    }

    displayUIEndGame() {
        console.log("🚀 ~ file: UIManager.ts:61 ~ UIManager ~ displayUIEndGame ~ displayUIEndGame:")
        let uiEndGame = cc.instantiate(this.pf_UIEndGame);
        this.rootUI.addChild(uiEndGame);
    }

    displayUIStartLevel() {
        console.log("🚀 ~ file: UIManager.ts:66 ~ UIManager ~ displayUIStartLevel ~ displayUIStartLevel:")
        let uiStartLevel = cc.instantiate(this.pf_UIStartLevel).getComponent(UIStartLevel);
        uiStartLevel.OnInit();
        this.rootUI.addChild(uiStartLevel.node);
    }

    async displayUIEndLevel(wPos: cc.Vec3, data) {
        console.log("🚀 ~ file: UIManager.ts:72 ~ UIManager ~ displayUIEndLevel ~ displayUIEndLevel:")
        let uiEndLevel = cc.instantiate(this.pf_UIEndLevel).getComponent(UIEndLevel);
        this.rootUI.addChild(uiEndLevel.node);
        uiEndLevel.OnInit(data);

        await delay((cc.director.getDeltaTime() * 1000) + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()));
        uiEndLevel.node.setWorldPosition(new cc.Vec3(wPos.x, wPos.y, 0));     
        return uiEndLevel;            
    }


    displayUIHand() {
        console.log("🚀 ~ file: UIManager.ts:82 ~ UIManager ~ displayUIHand ~ displayUIHand:")
        let uiHand = cc.instantiate(this.pf_UIHand).getComponent(UIHand);
        uiHand.OnInit();
        this.rootUI.addChild(uiHand.node);
    }

    displayUITutorial(data: DataTutorial) {
        console.log("🚀 ~ file: UIManager.ts:88 ~ UIManager ~ displayUITutorial ~ displayUITutorial:")
        let uiTutorial: UITutorial = cc.instantiate(this.pf_uiTutorial).getComponent(UITutorial);
        uiTutorial.OnInit(data);
        this.rootUI.addChild(uiTutorial.node);
    }

    displayUIFinish(data: DataFinish, wPos: cc.Vec3) {
        console.log("🚀 ~ file: UIManager.ts:95 ~ UIManager ~ displayUIFinish ~ displayUIFinish:")
        let uiFinish: UIFinish = cc.instantiate(this.pf_uiFinish).getComponent(UIFinish);
        uiFinish.OnInit(data);
        this.rootUI.addChild(uiFinish.node);
        uiFinish.node.setWorldPosition(wPos);
    }
}
