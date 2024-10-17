// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "./Manager/AudioManager";
import CollisionManager from "./Manager/CollisionManager";
import GameManager from "./Manager/GameManager";
import InputManager from "./Manager/InputManager";
import UIManager from "./Manager/UIManager";
import { DataFinish } from "./UI/UIFinish";
import ResourceUtils from "./Utils/ResourceUtils";

const {ccclass, property} = cc._decorator;

export enum GAME_STATE {
    START,
    PLAY,
    PAUSE,
    END,
}

export enum GAME_TYPE
{
    AUTO,
    MANUAL
}

export type DataLevel = {
    gameType: GAME_TYPE,
    playerType: number,
    letterTemplateRootPath: string,
    letterTemplateFolder: string,
    text: string,
    speed: number,
    time: number,
    audioIntro: cc.AudioClip,
    background: cc.SpriteFrame,
    ground: cc.SpriteFrame,
    image: cc.SpriteFrame,
    audio: cc.AudioClip,
    items: DataItem[],
    itemPositions: DataItemPosition[],
    obstacels: DataObstacel[],
    obstacelPositions: DataObstacelPosition[]
}

export type DataTutorial = {
    name: string,    
    target: string,
    play: string
}

export type DataItem = {
    id: number,
    image: cc.SpriteFrame
}

export type DataItemPosition = {
    id: number, 
    position: cc.Vec2;
}

export enum ObstacelType {
    NONE,
    GROUND,
    SKY    
}

export type DataObstacel = {
    id: number,
    type: ObstacelType,
    image: cc.SpriteFrame,
}

export type DataObstacelPosition = {
    id: number, 
    position: cc.Vec2;
}

@ccclass
export default class GameController extends cc.Component {

    //#region SINGLETON
    private static _instance: GameController = null;
    public static get instance(): GameController {
        if (GameController._instance == null) {
            GameController._instance = new GameController();
        }
        return GameController._instance;
    }
    //#region 
    @property(cc.JsonAsset)
    dataGame: cc.JsonAsset = null
    @property(cc.SpriteFrame)
    background: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    platfrom: cc.SpriteFrame = null

    public currentState: GAME_STATE = GAME_STATE.START;
    private _dataLevels: DataLevel[] = [];
    private _dataTutorial: DataTutorial = {
        name: "",
        target: "",
        play: ""    
    }

    private jsonDataLevels: [];

    protected onLoad(): void {
        GameController._instance = this;
    }    

    start(): void {
        this.loadConfig();
        //this.loadConfigDev();
    }

    //#region  Load Config
    loadConfig() {
        let apiUrl = ResourceUtils.getAPIFromWindow();    
        console.log("apiUrl: " + ResourceUtils.getAPIFromWindow());    
        if(apiUrl != null) {       
            console.log("Load Online");     
            ResourceUtils.loadConfigOnline(apiUrl)
                .then(async jsonData => {                    
                    let datalevels = JSON.parse(jsonData.config);
                    this.jsonDataLevels = datalevels;
                    let dataTutorial = JSON.parse(jsonData.tutorial);
                    this._dataTutorial = this.loadDataTutorial(dataTutorial);
                    // this._dataLevels = await this.loadData(datalevels);   
                    console.log("Load Online Complite");
                    this.startGame();
                })
                .catch(err => {    
                    this.loadConfigDev();                
                })                        
        }
        else {            
            console.log("Load Offline");  
            ResourceUtils.loadConfigOffline()
                .then(async jsonData => {                    
                    let datalevels = JSON.parse(jsonData.configOffline);
                    this.jsonDataLevels = datalevels;
                    let dataTutorial = JSON.parse(jsonData.tutorial);
                    this._dataTutorial = this.loadDataTutorial(dataTutorial);
                    // this._dataLevels = await this.loadData(datalevels);  
                    console.log("Load Offline Complite")
                    this.startGame();
                })
                .catch(err => {                    
                    this.loadConfigDev();
                })
        }   
    }

    async loadConfigDev() {
        console.log("Load Dev Complite");
        let data = this.dataGame.json;
        let datalevels = JSON.parse(data.config);
        this.jsonDataLevels = datalevels;        
        let dataTutorial = JSON.parse(data.tutorial); 
        this._dataTutorial = this.loadDataTutorial(dataTutorial);
        // this._dataLevels = await this.loadData(datalevels);          
        this.startGame();
    }

    //#endregion

    //#region Load Data
    async loadData(dataLevels): Promise<DataLevel[]>{        
        let listPromise: Promise<DataLevel>[] = dataLevels.map(async (dataLevel) => {
            const level: DataLevel = {
                gameType: (dataLevel.gameType && dataLevel.gameType == 1) ? GAME_TYPE.MANUAL : GAME_TYPE.AUTO,
                playerType: dataLevel.playerType ? dataLevel.playerType : 1,
                text: dataLevel.text,
                speed: dataLevel.speed,
                letterTemplateFolder: dataLevel.letterTemplateFolder.trim(),
                letterTemplateRootPath: dataLevel.letterTemplateRootPath.trim(),
                time: dataLevel.time,
                background: (dataLevel.image_background_url) ? await ResourceUtils.loadSpriteFrame(dataLevel.image_background_url) : this.background,
                ground: (dataLevel.image_ground_url) ? await ResourceUtils.loadSpriteFrame(dataLevel.image_ground_url) : this.platfrom,
                audioIntro: dataLevel.audio_intro_url ? await ResourceUtils.loadAudioClip(dataLevel.audio_intro_url) : null,
                image: dataLevel.image_url ? await ResourceUtils.loadSpriteFrame(dataLevel.image_url) : null,
                audio: dataLevel.audio_url ? await ResourceUtils.loadAudioClip(dataLevel.audio_url): null,

                //TEST
                items: dataLevel.items ? await this.loadDataItems(dataLevel.items) : null,
                obstacels: dataLevel.obstacles ?await this.loadDataObstacels(dataLevel.obstacles) : null,
                itemPositions: dataLevel.itemPositions ? this.loadDataItemPositions(dataLevel.itemPositions) : null,
                obstacelPositions: dataLevel.obstaclePositions ? this.loadDataObstacelPositions(dataLevel.obstaclePositions) : null
                //END TEST
            }

            return level;
        })

        const dataLevelsPromise = await Promise.all(listPromise);
        return dataLevelsPromise;
    }

    async loadDataById(id: number) {
        if(id >= this.jsonDataLevels.length) return;

        let dataLevel = this.jsonDataLevels[id];
        console.log("Data Level: ", dataLevel);
        const data = async (dataLevel) => {
            const level: DataLevel = {
                gameType: (dataLevel.gameType && dataLevel.gameType == 1) ? GAME_TYPE.MANUAL : GAME_TYPE.AUTO,
                playerType: dataLevel.playerType ? dataLevel.playerType : 1,
                letterTemplateFolder: dataLevel.letterTemplateFolder.trim(),
                letterTemplateRootPath: dataLevel.letterTemplateRootPath.trim(),
                text: dataLevel.text,
                speed: dataLevel.speed,
                time: dataLevel.time,
                background: (dataLevel.image_background_url) ? await ResourceUtils.loadSpriteFrame(dataLevel.image_background_url) : this.background,
                ground: (dataLevel.image_ground_url) ? await ResourceUtils.loadSpriteFrame(dataLevel.image_ground_url) : this.platfrom,
                audioIntro: dataLevel.audio_intro_url ? await ResourceUtils.loadAudioClip(dataLevel.audio_intro_url) : null,
                image: dataLevel.image_url ? await ResourceUtils.loadSpriteFrame(dataLevel.image_url) : null,
                audio: dataLevel.audio_url ? await ResourceUtils.loadAudioClip(dataLevel.audio_url): null,

                //TEST
                items: dataLevel.items ? await this.loadDataItems(dataLevel.items) : null,
                obstacels: dataLevel.obstacles ?await this.loadDataObstacels(dataLevel.obstacles) : null,
                itemPositions: dataLevel.itemPositions ? this.loadDataItemPositions(dataLevel.itemPositions) : null,
                obstacelPositions: dataLevel.obstaclePositions ? this.loadDataObstacelPositions(dataLevel.obstaclePositions) : null
                //END TEST
            }

            return level;
        }

        return await data(dataLevel);
    }

    loadDataTutorial(dataTutorial): DataTutorial{
        let result: DataTutorial = {
            name: dataTutorial.name,
            target: dataTutorial.target,
            play: dataTutorial.play,
        }

        return result;
    }

    async loadDataItems(dataItems): Promise<DataItem[]> {
        if(dataItems == null) return null;
        let listPromise: Promise<DataItem>[] = dataItems.map(async (dataItem) => {
            const item: DataItem = {
                id: dataItem.id,
                image: await ResourceUtils.loadSpriteFrame(dataItem.image_url),
            }

            return item;
        })

        const dataItemsPromise = await Promise.all(listPromise);
        return dataItemsPromise;
    }
    
    loadDataItemPositions(dataItemPositions): DataItemPosition[] {
        if(dataItemPositions == null) return null;
        let listPromise: DataItemPosition[] = dataItemPositions.map((dataItem) => {
            const item: DataItemPosition = {
                id: dataItem.idItem,
                position: new cc.Vec2(dataItem.position.x, dataItem.position.y)
            }

            return item;
        })

        return listPromise;
    }

    async loadDataObstacels(dataItems): Promise<DataObstacel[]> {
        if(dataItems == null) return null;
        let listPromise: Promise<DataObstacel>[] = dataItems.map(async (dataItem) => {
            const item: DataObstacel = {
                id: dataItem.id,
                type: this.GetObstacelTypeFromID(dataItem.id),
                image: await ResourceUtils.loadSpriteFrame(dataItem.image_url),
            }

            return item;
        })

        const dataItemsPromise = await Promise.all(listPromise);
        return dataItemsPromise;
    } 

    private GetObstacelTypeFromUrl(url: string): ObstacelType {
        if(url == null || url.length == 0) return ObstacelType.NONE;

        let fileName: string = url.substring(url.lastIndexOf('/')+1); // image_url.png
        if(fileName.includes("_ground.png"))
        {
            return ObstacelType.GROUND;
        }
        else if(fileName.includes("_sky.png"))
        {
            return ObstacelType.SKY
        }

        return ObstacelType.NONE;
    }

    private GetObstacelTypeFromID(id: number): ObstacelType {
        if(id == null || id < 0) return ObstacelType.NONE;
        
        return id%2 == 0 ? ObstacelType.GROUND : ObstacelType.SKY; // Chắn là ground lẽ là sky
    }

    loadDataObstacelPositions(dataItemPositions): DataObstacelPosition[] {
        if(dataItemPositions == null) return null;
        let listPromise: DataObstacelPosition[] = dataItemPositions.map((dataItem) => {
            const item: DataObstacelPosition = {
                id: dataItem.idObstacle,
                position: new cc.Vec2(dataItem.position.x, dataItem.position.y)
            }

            return item;
        })

        return listPromise;
    }

    //#endregion
    async startGame() {
        console.log("Start Game: ", this.jsonDataLevels);
        let data: DataLevel = await this.loadDataById(0);
        this._dataLevels.push(data);
        UIManager.instance.displayUITutorial(this._dataTutorial);
        GameManager.instance.loadData(this._dataLevels);        
        this.updateState(GAME_STATE.START);
        console.log("Xong cais 0");
        this._dataLevels = await this.loadData(this.jsonDataLevels);     
        console.log("Xong all");
        GameManager.instance.loadData(this._dataLevels);   
    }

    playGame() {
        this.updateState(GAME_STATE.PLAY);  
        InputManager.instance.enabledTouchDetectionEvent();
        AudioManager.instance.playBackground();      
        GameManager.instance.OnStartLevel();
        //TODO: Bật bg âm thanh
    }

    pauseGame() {
        this.updateState(GAME_STATE.PAUSE);
    }

    endGame() {
        this.updateState(GAME_STATE.END);
        InputManager.instance.disableTouchDetectionEvent();
        AudioManager.instance.stopAllSound();
        let wPos = GameManager.instance.getCamera().getWorldPosition();
        let dataFinish = this.handleDataFinish(GameManager.instance.timeRemaining, GameManager.instance.totalTime);
        UIManager.instance.displayUIFinish(dataFinish, wPos);         
    }

    handleDataFinish(timeRemaining: number, totalTime: number): DataFinish {
        console.log("Time Remaining: ", timeRemaining);
        console.log("Total Time: ", totalTime);
        if(timeRemaining <= totalTime/3) {
            return {
                totalStarCompleted: 1,
                totalStar: 3
            } as DataFinish
        }
        else if(timeRemaining <= totalTime/2) {
            return {
                totalStarCompleted: 2,
                totalStar: 3
            } as DataFinish
        }
        else {
            return {
                totalStarCompleted: 3,
                totalStar: 3
            } as DataFinish            
        }
    }

    updateState(state: GAME_STATE) {
        this.currentState = state;
    }
}
