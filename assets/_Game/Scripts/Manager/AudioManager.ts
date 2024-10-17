// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { delay } from "../Utils/AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {
    //#region SINGLETON
    private static _instance: AudioManager = null;
    public static get instance(): AudioManager {
        if (AudioManager._instance == null) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }
    //#region

    @property(cc.AudioClip)
    ac_words: cc.AudioClip[] = [];
    @property(cc.AudioClip)
    ac_bg: cc.AudioClip = null;
    @property(cc.AudioClip)
    ac_results: cc.AudioClip[] = [];
    @property(cc.AudioClip)
    ac_touchScreen: cc.AudioClip = null;
    @property(cc.AudioClip)
    ac_cheer: cc.AudioClip = null;
    @property(cc.AudioClip)
    ac_starCount: cc.AudioClip = null;
    @property(cc.AudioClip)
    ac_stars: cc.AudioClip[] = [];

    private audioSource: cc.AudioSource = null;

    protected onLoad(): void {
        AudioManager._instance = this;
        this.audioSource = this.node.getComponent(cc.AudioSource);
    }

    playAudioWord(idx: number) {
        this.audioSource.clip = this.ac_words[idx];
        this.audioSource.play();
    }

    playResult(result: boolean) {
        this.audioSource.clip = this.ac_results[result ? 0 : 1];
        this.audioSource.play();
    }

    playBackground() {
        cc.audioEngine.playMusic(this.ac_bg, true);        
    }

    playAudioTouchScreen() {
        this.audioSource.clip = this.ac_touchScreen;
        this.audioSource.play();
    }

    playAudioCheer() {
        this.audioSource.clip = this.ac_cheer;
        this.audioSource.play();
    }

    playAudioStar(numberStar: any) {
        this.audioSource.clip = this.ac_stars[numberStar - 1];
        this.audioSource.play();
    }
    playAudioStarCount() {
        this.audioSource.clip = this.ac_starCount;
        this.audioSource.play();
    }

    stopAllSound() {
        this.audioSource.stop();
        cc.audioEngine.stopMusic();
    }

    async asyncPlayAudio(audio: cc.AudioClip) {
        this.audioSource.clip = audio;
        this.audioSource.play();
        await delay(1000 * 5);
        return Promise.resolve();
    }

    playAudio(audio: cc.AudioClip)
    {
        this.audioSource.clip = audio;
        this.audioSource.play();
    }
}
