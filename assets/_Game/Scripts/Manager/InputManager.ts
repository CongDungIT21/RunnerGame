// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TouchLayer from "../Models/TouchLayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InputManager extends cc.Component {
    //#region SINGLETON
    private static _instance: InputManager = null;
    public static get instance(): InputManager {
        if (InputManager._instance == null) {
            InputManager._instance = new InputManager();
        }
        return InputManager._instance;
    }
    //#region 

    @property(TouchLayer)
    touchDect: TouchLayer;

    SetUp(touchDect: TouchLayer)
    {
        this.touchDect = touchDect;
    }

    protected onLoad(): void {
        InputManager._instance = this;
    }

    enabledTouchDetectionEvent() {
        this.touchDect.onTouchEvent();
    }

    disableTouchDetectionEvent() {
        this.touchDect.offTouchEvent();
    }
}
