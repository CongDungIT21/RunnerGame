// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import InputManager from "./Manager/InputManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TouchDetection extends cc.Component {
        private readonly TIMEOUT = 7;
        private couterTime = 0;

        private isTouched = false; // Đang chạm hay không
        private isDetectTouched = false; // Đang trong quá trình phát hiện hay không

        //#region TOUCH EVENT       
        private onTouchStart(event: cc.Event.EventTouch): void {
            this.isTouched = true;            
        }
    
        private onTouchMove(event: cc.Event.EventTouch): void {            
        }
    
        private onTouchEnd(event: cc.Event.EventTouch): void {
            this.couterTime = 0;
            this.isTouched = false;            
        }    
        
        private onTouchCancel(event: cc.Event.EventTouch): void {            
            this.couterTime = 0;
            this.isTouched = false;
        }
    
        public onTouchEvent() {            

            this.isDetectTouched = true;
            this.isTouched = false;
            this.couterTime = 0;

            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this); 
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        }
    
        public offTouchEvent() {            

            this.isDetectTouched = false;
            this.isTouched = false;
            this.couterTime = 0;

            this.node.off(cc.Node.EventType.TOUCH_START);
            this.node.off(cc.Node.EventType.TOUCH_END);
            this.node.off(cc.Node.EventType.TOUCH_MOVE);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL);
        }
    
        //#endregion

        protected update(dt: number): void {
            if(this.isDetectTouched && this.isTouched === false) {
                this.couterTime += dt;
                if(this.couterTime >= this.TIMEOUT) {
                    InputManager.instance.timeoutTouchScreen();
                }
            }
        }
}
