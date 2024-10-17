// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameController, { DataItem, DataItemPosition, DataLevel, DataObstacel, DataObstacelPosition, GAME_STATE, GAME_TYPE, ObstacelType } from "../GameController";
import Camera from "../Models/Camera";
import Clock from "../Models/Clock";
import Letter from "../Models/Letter";
import Obstacle from "../Models/Obstacle";
import Player from "../Models/Player";
import TouchLayer from "../Models/TouchLayer";
import UIEndLevel from "../UI/UIEndLevel";
import { activeNode, delay } from "../Utils/AsyncUtils";
import { getRandomHexStringColor, getRandomNumber, roundToOneDecimal, shuffle } from "../Utils/MathUtils";
import ParabolUtils from "../Utils/ParabolUtils";
import ResourceUtils from "../Utils/ResourceUtils";
import AudioManager from "./AudioManager";
import InputManager from "./InputManager";
import UIManager from "./UIManager";
import VFXManager from "./VFXManager";

const {ccclass, property} = cc._decorator;

export type LetterPresenter = {
    id: number,
    letter: string,
    img: cc.SpriteFrame,
}

@ccclass
export default class GameManager extends cc.Component {
    //#region SINGLETON
    private static _instance: GameManager = null;
    public static get instance(): GameManager {
        if (GameManager._instance == null) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }
    //#region 

    @property(cc.Node)
    letters_bottom: cc.Node = null;
    @property(cc.Node)
    letters_top: cc.Node = null;
    @property(cc.Prefab)
    letter: cc.Prefab = null;

    @property(cc.Node)
    nd_obstacles: cc.Node = null;

    @property(cc.Prefab)
    pf_obstacles: cc.Prefab[] = [];
    @property(cc.Prefab)
    pf_obstacle: cc.Prefab;

    @property(cc.Node)
    player: cc.Node = null;
    @property(cc.Node)
    players: cc.Node[] = [];
      
    @property(cc.Node)
    camera: cc.Node = null;
    @property(TouchLayer)
    touchLayer: TouchLayer;

    @property(Clock)
    clock: Clock  = null;

    @property(cc.Node)
    platforms: cc.Node = null;
    @property(cc.Sprite)
    backgrounds: cc.Sprite[] = [];
    @property(cc.Sprite)
    platfrorms: cc.Sprite[] = [];

    mapLetters: Map<number, cc.Node> = new Map(); // Bottom Letters
    queueLetters: cc.Node[] = []; // Top Letters
    _lastTopNode: cc.Node = null;

    //TEST
    _idxOfItemPosition = 0;
    _idxOfObstacelPosition = 0;
    //END TEST

    private EndLevel: boolean = false;

    //#region DATA
    private readonly speeds: number[] = [300, 400];
    private readonly words: string[] = ["Pencil", "Apple"];

    private readonly offsetX = {
        x: 600,
        y: 900
    }

    private readonly offsetY = {
        x: -100,
        y: 400
    }

    private readonly obsOffsetY = {
        x: 150,
        y: 450
    }

    private readonly obsOffsetY_1 = -540 + 340 - 30;

    private readonly minDistance = 350;

    readonly time: number = 60;
    //#endregion

    timeCouter: number = 0;

    public idxCurrentData = 0;
    private currentData: LetterPresenter[] = null;

    private _dataLevels: DataLevel[] = null;
    private _dataLevel: DataLevel = {
        gameType: null,
        playerType: 1,
        letterTemplateFolder: null,
        letterTemplateRootPath: null,
        text: "",
        speed: 0,
        time: 0,
        audioIntro: null,
        background: null,
        ground: null,
        image: null,
        audio: null,
        itemPositions: [],
        items: [],
        obstacels: [],
        obstacelPositions: []
    }
    private _idxLevel: number = 0;
    private playerScript: Player = null;
    public INIT_TYPE: number;

    private _timeRemaining: number = 0;
     
    public get timeRemaining() : number {
        return this._timeRemaining; 
    }
    
    private _totalTime: number = 0;

    public get totalTime() : number {
        return this._totalTime; 
    }

    protected onLoad(): void {
        console.log("OnLoad GameManager");
        GameManager._instance = this;
    }

    protected start(): void {
        console.log("Start GameManager");
    }

    protected lateUpdate(dt: number): void {
        if(this.player == null) return;

        if(this.backgrounds[this.backgrounds.length - 1].node.getWorldPosition().x - this.player.getWorldPosition().x < 1920) {
            let bg: cc.Node = cc.instantiate(this.backgrounds[this.backgrounds.length - 1].node);
            this.backgrounds[this.backgrounds.length - 1].node.parent.addChild(bg);
            this.backgrounds.push(bg.getComponent(cc.Sprite));
        }

        if(this.platfrorms[this.platfrorms.length - 1].node.getWorldPosition().x - this.player.getWorldPosition().x < 1920) {
            let bg: cc.Node = cc.instantiate(this.platfrorms[this.platfrorms.length - 1].node);
            this.platfrorms[this.platfrorms.length - 1].node.parent.addChild(bg);
            this.platfrorms.push(bg.getComponent(cc.Sprite));
        }
    }

    loadData(data: DataLevel[]) {
        this._dataLevels = data;        
    }

    //#region Init Level
    public async OnInit() {
        this._idxLevel = 0;
        this._timeRemaining = 0;
        this._totalTime = 0;

        await this.OnResert();

        this.player = this._dataLevel.playerType ? this.players[this._dataLevel.playerType - 1] : this.players[0];
        this.player.active = true;
        this.playerScript = this.player.getComponent(Player);

        this.camera.getComponent(Camera).OnInit();
        this.camera.getComponent(Camera).SetUp(this.player);
        this.touchLayer.SetUp(this.player);
        InputManager.instance.SetUp(this.touchLayer);

        let speed = this._dataLevel.speed;
        this.InitPlayer(speed);

        if(this._dataLevel.background)
        {
            this.backgrounds.forEach((bg: cc.Sprite) => {
                bg.spriteFrame = this._dataLevel.background;
            });
        }

        if(this._dataLevel.ground)
        {
            this.platfrorms.forEach((platfrrom: cc.Sprite) => {
                platfrrom.spriteFrame = this._dataLevel.ground;
            });
        }

        if(this._dataLevel.gameType == GAME_TYPE.AUTO) {
            let word = this._dataLevel.text;
            this.InitContentsAuto(word); 
        }
        else {
            let word = this._dataLevel.text;
            this.InitContentsManual(word);
        }

        let time = this._dataLevel.time;
        this.clock.OnInit(time);

        await AudioManager.instance.asyncPlayAudio(this._dataLevel.audioIntro);
        GameController.instance.playGame();   
    }

    private HanldeItemPosition(itemPositions: DataItemPosition[], maxPosX: number) : DataItemPosition[]
    {
        let k = 1000;
        let idx = 0;
        let positons = itemPositions.slice(0);
        console.log("HanldeItemPosition", positons);
        let lastPos = positons[positons.length - 1].position;
        while(true)
        {            
            if(k-- < 0) {
                console.error("Some thing wrong");
                break;
            }

            if(positons[positons.length - 1].position.x > maxPosX)
            {
                break;
            }
            
            let newPos = {
                id: null,
                position: itemPositions[idx].position
            }            
            newPos.position = new cc.Vec2(lastPos.x + newPos.position.x, lastPos.y + newPos.position.y);
            
            positons.push(newPos);

            idx++;
            if(idx >= itemPositions.length) {
                idx = 0;
                lastPos = positons[positons.length - 1].position;
            }
        }

        return positons;
    }

    private HanldeObstacelPosition(obstaclePositions: DataObstacelPosition[], maxPosX: number) : DataObstacelPosition[]
    {
        let k = 1000;
        let idx = 0;
        let positons = obstaclePositions.slice();
        console.log("HanldeObstacelPosition", positons);
        let lastPos = positons[positons.length - 1].position;
        while(true)
        {            
            if(k-- < 0) {
                console.error("Some thing wrong");
                break;
            }

            if(positons[positons.length - 1].position.x > maxPosX)
            {
                break;
            }
            
            let newPos = {
                id: obstaclePositions[idx].id,
                position: obstaclePositions[idx].position
            }
                     
            newPos.position = new cc.Vec2(lastPos.x + newPos.position.x, lastPos.y + newPos.position.y);
            
            positons.push(newPos);

            idx++;
            if(idx >= obstaclePositions.length) {
                idx = 0;
                lastPos = positons[positons.length - 1].position;
            }
        }

        return positons;
    }

    public async OnInitLevel() {
        await delay(1000);
        if(this._idxLevel >= this._dataLevels.length - 1) {
            VFXManager.instance.setVFXFireWord(this.camera.getWorldPosition());
            await VFXManager.instance.spawnVFXFireWork();             
            GameController.instance.endGame();
            return;
        }

        this._idxLevel += 1;

        await this.OnResert();

        this.player = this._dataLevel.playerType ? this.players[this._dataLevel.playerType - 1] : this.players[0];
        this.player.active = true;
        this.playerScript = this.player.getComponent(Player);

        this.camera.getComponent(Camera).OnInit();
        this.camera.getComponent(Camera).SetUp(this.player);
        this.touchLayer.SetUp(this.player);
        InputManager.instance.SetUp(this.touchLayer);

        if(this._dataLevel.background)
            {
                this.backgrounds.forEach((bg: cc.Sprite) => {
                    bg.spriteFrame = this._dataLevel.background;
                });
            }

        if(this._dataLevel.ground)
            {
                this.platfrorms.forEach((platfrorms: cc.Sprite) => {
                    platfrorms.spriteFrame = this._dataLevel.ground;
                });
            }

        let speed = this._dataLevel.speed;
        this.InitPlayer(speed);

        if(this._dataLevel.gameType == GAME_TYPE.AUTO) {
            let word = this._dataLevel.text;
            this.InitContentsAuto(word); 
        }
        else {
            let word = this._dataLevel.text;
            this.InitContentsManual(word);
        }
       
        let time = this._dataLevel.time;
        this.clock.OnInit(time);
        
        await AudioManager.instance.asyncPlayAudio(this._dataLevel.audioIntro);
        GameController.instance.playGame();
        
    }

    //Resert trước mỗi level
    private async OnResert() {
        UIManager.instance.rootUI.removeAllChildren(); //BAD

        this.players.forEach(player => {
            player.active = false;
        });

        

        if(this._dataLevels === null)
        {
            console.log("Load By ID");
            await GameController.instance.loadDataById(this._idxLevel);
        }
        else
        {
            console.log("Load from Local");
            this._dataLevel = this._dataLevels[this._idxLevel];  
        }

        //TEST
        //this._dataLevel.playerType = 2;
        //this._dataLevel.gameType = GAME_TYPE.MANUAL;

        this.mapLetters = new Map();        
        this.timeCouter = 0;     
        this.currentData = [];
        this._lastTopNode = null;

        //TEST
        this._idxOfItemPosition = 0;
        this._idxOfObstacelPosition = 0;
        //END TEST

        this.letters_bottom.removeAllChildren();
        this.letters_top.removeAllChildren();    
        this.nd_obstacles.removeAllChildren();       
        
        // if(this._dataLevel.text == "" || this._dataLevel.text == null) {    
        //     this.INIT_TYPE = 2;
        // }
        // else {
        //     this.INIT_TYPE = 1;
        // }
    }

    //Khởi tạo Player với speed 
    private InitPlayer(speed: number) {      
        let playerScript: Player = this.player.getComponent(Player);    
        playerScript.OnInit(speed);
        //playerScript.OnPause();
    }
    async LoadLetterPresenters(dataItems): Promise<LetterPresenter[]> {
        let listPromise: Promise<LetterPresenter>[] = dataItems.map(async (dataItem) => {
            const itemPresenter: LetterPresenter = {
                id: dataItem.id,
                letter: dataItem.letter,
                img: await this.loadLetterImage(dataItem.img),
            }

            return itemPresenter;
        })

        const dataItemPresenters = await Promise.all(listPromise);
        return dataItemPresenters;
    }

    async loadLetterImage(url: string): Promise<cc.SpriteFrame> {
        try {
            return await ResourceUtils.loadSpriteFrame(url)
        } catch (error) {
            return null;
        }
    }
    //#region AUTO    
    private async InitContentsAuto(word: string) {
        let arrWord = word.split("");
        let itemDatas = [];

        for(let i = 0; i < arrWord.length; i++) {
            let data = {
                id: i,                
                letter: arrWord[i],
                img: this._dataLevel.letterTemplateRootPath + this._dataLevel.letterTemplateFolder + `${arrWord[i]}.png`
            }
            itemDatas.push(data);
        }
        this.currentData = await this.LoadLetterPresenters(itemDatas);

        this.loadBottomLetters(this.currentData);
        this.loadTopLetters(this.currentData);
        ////this.loadObstacles();
    }      

    private loadBottomLetters(data: LetterPresenter[]) {
        this.letters_bottom.getComponent(cc.Layout).enabled = true;

        data.forEach(letterData => {
            let letter = cc.instantiate(this.letter);            
            letter.removeComponent(cc.PhysicsCircleCollider)
            letter.removeComponent(cc.RigidBody)
            letter.getComponent(Letter).OnInit(letterData);
            this.letters_bottom.addChild(letter);
            
            letter.children.forEach(node => {
               node.active = false; 
            });

            this.mapLetters.set(letterData.id, letter);
        });

        setTimeout(() => {
            this.letters_bottom.getComponent(cc.Layout).enabled = false;
            this.letters_bottom.children.forEach(letter => {
                letter.children.forEach(node => {
                    node.active = true; 
                }); 
                letter.active = false;
            });
        }, ((cc.director.getDeltaTime() * 1000)  + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()) * 2));
    }

    private loadTopLetters(data: LetterPresenter[]) {
        data = shuffle(data);
        data.forEach(letterData => {
            let letter = this.spawnLetterTop(letterData);
            this._lastTopNode = letter;
            this.queueLetters.push(letter);

            this.spawnObstacle();
        });
    }

    private spawnLetterTop(letterData: LetterPresenter) {
        let letter = cc.instantiate(this.letter);
        letter.getComponent(Letter).OnInit(letterData);
        this.letters_top.addChild(letter);
        letter.setPosition(this.randomLetterTopPosition());
        letter.getComponent(Letter).inited();

        return letter;
    }

    private randomLetterTopPosition() {
        let localPos = null;
        if(!this._lastTopNode) {
            localPos = cc.v2(-1920/2, -50);
        }
        else
        {
            const dependWordPos = this._lastTopNode.getWorldPosition();
            localPos = this.letters_top.getLocalPosition(dependWordPos);
            localPos = cc.v2(localPos.x, -50);
        }
        
        const posMax = this.getMaxHeight(cc.v2(localPos.x, localPos.y));
        const posMin = this.getMinHeight(posMax);

        const speed = this.playerScript.runForce;
        const offsetX = posMin.x + getRandomNumber(0.5 * speed, 1.5 * speed);
        const offsetY = getRandomNumber(this.offsetY.x, this.offsetY.y);

        return cc.v2(offsetX, offsetY);
    }


    //#endregion AUTO

    //#region MANUAL
    private async InitContentsManual(word: string) {
        console.log("InitContentsManual");
        console.log(this._dataLevel);
        let arrWord = word.split("");
        let itemDatas = [];

        for(let i = 0; i < arrWord.length; i++) {
            let data = {
                id: i,                
                letter: arrWord[i],
                img: this._dataLevel.letterTemplateRootPath + this._dataLevel.letterTemplateFolder + `${arrWord[i]}.png`
            }
            itemDatas.push(data);
        }
        this.currentData = await this.LoadLetterPresenters(itemDatas);
        this.loadBottomLetters_manual(this.currentData);
        this.loadTopLetters_manual(this.currentData, this._dataLevel.itemPositions);
        this.loadObstacel_manual(this._dataLevel.obstacels, this._dataLevel.obstacelPositions);
    }

    private loadObstacel_manual(obstacels: DataObstacel[], obstacelPositions: DataObstacelPosition[]) {
        this._idxOfObstacelPosition = obstacelPositions.length - 1;
        obstacelPositions.forEach((obstacelPos: DataObstacelPosition) => {
            let obstacel: DataObstacel = null;
            if(obstacelPos.id)
            {
                obstacel = obstacels.find(obstacel => obstacel.id === obstacelPos.id);
            }
            else 
            {
                obstacel = shuffle(obstacels)[0];
            }

            let obs = cc.instantiate(this.pf_obstacle);
            this.nd_obstacles.addChild(obs);
            obs.getComponent(Obstacle).OnInit_v2(obstacel);
            obs.setPosition(obstacelPos.position);
        })
    }

    private loadTopLetters_manual(datas: LetterPresenter[], itemPositions: DataItemPosition[]) {
        this._idxOfItemPosition = 0;

        datas = shuffle(datas);
        datas.forEach(letterData => {
            let pos: DataItemPosition = itemPositions[this._idxOfItemPosition];
            this._idxOfItemPosition++;

            let letter = this.spawnLetterTop_manual(letterData);
            letter.setPosition(pos.position);
            this._lastTopNode = letter;
            this.queueLetters.push(letter);
        });
    }

    private spawnLetterTop_manual(letterData: LetterPresenter) {
        let letter = cc.instantiate(this.letter);
        letter.getComponent(Letter).OnInit(letterData);
        this.letters_top.addChild(letter);
        letter.getComponent(Letter).inited();

        return letter;
    }

    private loadBottomLetters_manual(datas: LetterPresenter[]) {
        this.letters_bottom.getComponent(cc.Layout).enabled = true;

        datas.forEach(letterData => {
            let letter = cc.instantiate(this.letter);            
            letter.removeComponent(cc.PhysicsCircleCollider)
            letter.removeComponent(cc.RigidBody)
            letter.getComponent(Letter).OnInit(letterData);
            this.letters_bottom.addChild(letter);
            
            letter.children.forEach(node => {
               node.active = false; 
            });

            this.mapLetters.set(letterData.id, letter);
        });

        setTimeout(() => {
            this.letters_bottom.getComponent(cc.Layout).enabled = false;
            this.letters_bottom.children.forEach(letter => {
                letter.children.forEach(node => {
                    node.active = true; 
                }); 
                letter.active = false;
            });
        }, ((cc.director.getDeltaTime() * 1000)  + Math.ceil(cc.director.getTotalTime() / cc.director.getTotalFrames()) * 2));
    }

    //#endregion MANUAL
 
    //#region LEVEL STATE
    public OnStartLevel() {
        UIManager.instance.displayUIStartLevel();
    }

    public StartLevel() {
        this.EndLevel = false;
        this.clock.OnStart();
        this.player.getComponent(Player).OnStart();
        this.camera.getComponent(Camera).OnStart();
    }

    OnPauseLevel() {
        console.log("OnPauseLevel");
        console.log(this.player.position);
        this.nd_obstacles.children.forEach(child => child.getComponent(Obstacle).OnPause()); //Ensure player can't collide with obstacle
        console.log(this.player.position);
        InputManager.instance.disableTouchDetectionEvent();
        console.log(this.player.position);
        this.player.getComponent(Player).OnPause();
        console.log(this.player.position);
        this.camera.getComponent(Camera).OnPause();
        console.log(this.player.position);
        this.clock.OnPause();
        console.log(this.player.position);
        //this.camera.getComponent(Camera).OnPause();
        // AudioManager.instance.stopAllSound();

        // let uiEndLevel: UIEndLevel = await UIManager.instance.displayUIEndLevel(this.camera.getWorldPosition(), this.currentData);
        // uiEndLevel.ShowLetterImage(this._dataLevel.image);
        // uiEndLevel.PlayLetterAudio(this._dataLevel.audio);
        
        //await delay(2000);
        //VFXManager.instance.setVFXFireWord(this.camera.getWorldPosition());
        //await VFXManager.instance.spawnVFXFireWork(); 
        //GameController.instance.endGame();
        //UIManager.instance.displayUIFinish(this.camera.getWorldPosition());       
    }

    async OnEndLevel() {
        console.log("OnEndLevel");
        if(this.EndLevel) 
            return;

        this.EndLevel = true;

        this._totalTime += this._dataLevel.time;
        this._timeRemaining += this.clock.getCurrentTime();

        AudioManager.instance.stopAllSound();
        this.player.getComponent(Player).OnEnd();
        this.camera.getComponent(Camera).OnPause();

        let uiEndLevel: UIEndLevel = await UIManager.instance.displayUIEndLevel(this.camera.getWorldPosition(), this.currentData);
        uiEndLevel.ShowLetterImage(this._dataLevel.image);
        uiEndLevel.PlayLetterAudio(this._dataLevel.audio);

        await delay(1000);
        this.OnInitLevel();
    }
    //#endregion


    //Cập nhật vị trí của letterBottom theo camera
    updatePositionLetterBottom(positon: cc.Vec2) {
        this.letters_bottom.x = positon.x;
    }

    reSpawnLetterTop(letter: cc.Node) {
        if(letter.getComponent(Letter).isCollected) return;

        if(this._dataLevel.gameType == GAME_TYPE.MANUAL)
        {
            console.log("Respawn Manula");
            this.reSpawnLetterTop_v2(letter);
        }
        else 
        {        
            console.log("Respawn auto");
            let instance = cc.instantiate(letter);
            this.letters_top.addChild(instance);
            instance.setPosition(this.randomLetterTopPosition());
            instance.getComponent(Letter).id = letter.getComponent(Letter).id;
            instance.getComponent(Letter).inited();
            
            this._lastTopNode = instance;
            this.queueLetters.push(instance);
            this.spawnObstacle();
        }
    }


    reSpawnLetterTop_v2(letter: cc.Node) {
        let instance = cc.instantiate(letter);
        this.letters_top.addChild(instance);

        this._idxOfItemPosition++;

        let pos: cc.Vec2 = null;
        if(this._idxOfItemPosition < this._dataLevel.itemPositions.length) 
        {
            pos = this._dataLevel.itemPositions[this._idxOfItemPosition].position;
        }
        else
        {
            console.log("Random Position");
            pos = this.randomLetterTopPosition();
        }

        instance.setPosition(pos);
        instance.getComponent(Letter).id = letter.getComponent(Letter).id;
        instance.getComponent(Letter).inited();

        this._lastTopNode = letter;
        this.queueLetters.push(instance);
        //KO spawn obstacel
    }

    public getPositionLetterBottom(letterTop: cc.Node): cc.Vec3 {             
        const id = letterTop.getComponent(Letter).id;
        const letterBottom = this.mapLetters.get(id);
        
        letterBottom.active = true;
        const index = this.queueLetters.indexOf(letterTop);
        if (index !== -1) {
            this.queueLetters.splice(index, 1);
        }        

        return letterBottom.getWorldPosition();
    }

    public getLetterBottom(letterTop: cc.Node) {
        const id = letterTop.getComponent(Letter).id;
        const letterBottom = this.mapLetters.get(id);
        return letterBottom;        
    }

 
    //#region Obstacle
    private spawnObstacle() {
        if(this._dataLevel.obstacels == null)
        {
            const typeObs = Math.floor(Math.random() * 2);        
            let obs = cc.instantiate(this.pf_obstacles[typeObs]);
            this.nd_obstacles.addChild(obs);
            let localPos = this.randomObstaclePosition(typeObs);
            obs.setPosition(localPos);
            this._lastTopNode = obs;
    
            const density = Math.floor(Math.random() * (100 - 1 + 1) + 1);
            if(density > 80) obs.active = false;
        }
        else 
        {
            let randomObs: number = Math.floor(Math.random() * this._dataLevel.obstacels.length);
            let obsData: DataObstacel = this._dataLevel.obstacels[randomObs];
            let typeObs = (obsData.type === ObstacelType.GROUND) ? 1 : 0;
            let obs: cc.Node = cc.instantiate(this.pf_obstacles[typeObs]);
            this.nd_obstacles.addChild(obs);
            obs.getComponent(Obstacle).OnInit_v2(obsData);
            let localPos = this.randomObstaclePosition(typeObs);
            obs.setPosition(localPos);
            this._lastTopNode = obs;

            const density = Math.floor(Math.random() * (100 - 1 + 1) + 1);
            if(density > 80) obs.active = false;
        }
    }

    private randomObstaclePosition(type): cc.Vec2 {
        const dependWordPos = this._lastTopNode.getWorldPosition();
        const localPos = this.nd_obstacles.getLocalPosition(dependWordPos)
        const posMax = this.getMaxHeight(cc.v2(localPos.x, localPos.y));
        const posMin = this.getMinHeight(posMax);

        let offsetX = 0;
        let offsetY = 0;

        if(type == 1) {
            offsetY = -540 + 340 - 30;
        }
        else {
            offsetY = getRandomNumber(150, 450);
        }

        const speed = this.playerScript.runForce;
        offsetX = posMin.x + getRandomNumber(0.5 * speed, 1.5 * speed);
               
        return cc.v2(offsetX, offsetY);
    }
    //#endregion

    checkEndLevel() {
        let values = Array.from(this.mapLetters.values());
        for(let i = 0; i < values.length; i++) {
            if(values[i].active === false) 
                return;
        }
        
        this.OnPauseLevel();
    }

    checkEndLevel_v2(currNode: cc.Node)
    {
        let values = Array.from(this.mapLetters.values());
        for(let i = 0; i < values.length; i++) {
            if(values[i] === currNode)
                continue;
            if(values[i].active === false) 
                return false;
        }
        
        return true;
    }

    downTime(time: number = 5) {
        this.clock.downTime(5);
    }

    getCurrentTime() {
        return this.clock.getCurrentTime();
    }

    getLevelTime() {
        return this._dataLevel.time;
    }

    getCamera() {
        return this.camera;
    }

    // #region Parabol
    private getMaxHeight(posJump: cc.Vec2) {
        let gravityJump = ParabolUtils.convertGravity(this.playerScript.singleJumpGravity); // 1.5 gravity khi player nhảy
        let velInit = this.playerScript.getVelocityInitial();
        let velMaxHeihgt = cc.v2(velInit.x, 0);
        let timeJump = ParabolUtils.getTimeJumping(gravityJump, velMaxHeihgt, velInit);
        let posMaxHeight = ParabolUtils.getPositionDependTime(gravityJump, timeJump, velInit, posJump);

        return posMaxHeight;
    }

    private getMinHeight(maxPos: cc.Vec2) {
        let gravityFall = ParabolUtils.convertGravity(this.playerScript.fallGravity);
        let timeFall = ParabolUtils.getTimeFalling(maxPos, gravityFall);
        let velInit = this.playerScript.getVelocityInitial();
        let velMaxHeihgt = cc.v2(velInit.x, 0);
        let posMinHeight = ParabolUtils.getPositionDependTime(gravityFall, timeFall, velMaxHeihgt, maxPos);
        return posMinHeight;
    }
    //#endregion
}


