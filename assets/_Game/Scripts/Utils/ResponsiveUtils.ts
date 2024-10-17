// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResponsiveUtils {
    public static getSizeItem(numberItem: number, oldSize: cc.Size): cc.Size {
        let ratio = 1;
        switch (numberItem) {
            case 2:
                ratio = 1.4;
                break;
            case 3:
                ratio = 1.4;
                break;
            case 4:
                ratio = 1;
                break;        
            default:
                console.error("Không xác định getSizeItem");
                break;
        }        
        return new cc.Size(oldSize.width * ratio, oldSize.height * ratio);
    }


    public static getSizeEmpty(numberItem: number, oldSize: cc.Size): cc.Size {
        let ratio = 1;
        switch (numberItem) {
            case 2:
                ratio = 1.4;
                break;
            case 3:
                ratio = 1.4;
                break;
            case 4:
                ratio = 1;
                break;        
            default:
                console.error("Không xác định getSizeEmpty");
                break;
        } 
        return new cc.Size(oldSize.width * ratio, oldSize.height * ratio);
    }

    public static getSpacingX(numberItem: number) {
        let spacing = 100;
        switch (numberItem) {
            case 2:
                spacing = 150;
                break;
            case 3:
                spacing = 100;
                break;
            case 4:
                spacing = 50;
                break;        
            default:
                console.error("Không xác định getSpacingX");
                break;
        } 
        return spacing
    }

    public static getDecorRatio(numberItem: number) {
        let ratio = 1;
        switch (numberItem) {
            case 2:
                ratio = 0.8;
                break;
            case 3:
                ratio = 0.8;
                break;
            case 4:
                ratio = 1;
                break;        
            default:
                console.error("Không xác định getSizeEmpty");
                break;
        } 

        return ratio;
    }
}
