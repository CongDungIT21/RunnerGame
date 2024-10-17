// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { delay } from "./AsyncUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResourceUtils extends cc.Component {
    private static CROS = "";

    public static getAPIFromWindow(): string | null{
        let windowURL = new URL(window.location.href);
        let api_CodeURL = windowURL.searchParams.get("api");        
        return api_CodeURL ? decodeURIComponent(api_CodeURL) : null;
    }

    public static getAPIFromUrl(url: string): string | null {
        let windowURL = new URL(url);
        let api_CodeURL = windowURL.searchParams.get("api");
        return api_CodeURL ? decodeURIComponent(api_CodeURL) : null;
    }

    public static async getJSONData(url: string, errorCount = 0) {
        
        const ERROR_COUNT_MAX = -1; //Backoff
        const response = await fetch(url, {
            method: 'GET',
            headers: [["Content-Type", 'application/json']]
        });        
        if(response.status < 200 || response.status >= 300) {
            if(errorCount > ERROR_COUNT_MAX) 
                return response;
            
            await delay(errorCount * 3000 + Math.random() * 1000);
            this.getJSONData(url, errorCount + 1);
        }

        return await response.json();
    }

    public static urlCheck(oldUrl: string): string {            
        if(oldUrl.search("http") !== 0)
            return this.CROS + oldUrl;

        return oldUrl;
    }

    public static preUrlHandle(url: string): string {
        let deURL = decodeURIComponent(url);
        return this.urlCheck(deURL);
    }

    public static loadConfigOnline(apiUrl: string) {
        this.CROS = "";
        return this.getJSONData(apiUrl);
    }

    public static loadConfigOffline() {
        this.CROS = window.location.origin + window.location.pathname + "source/";
        let url = this.CROS + "Config.txt";
        return this.getJSONData(url);   
    }


    public static loadTextFile(url): Promise<cc.JsonAsset> {
        url = this.preUrlHandle(url);
        return new Promise((resolve, reject) => {
            cc.loader.load({
                url: url,
                type: "txt"
            }, (err, data) => {
                if (err) {
                    reject(new Error("Load Text File Fail: " + err));
                } else {
                    let jsonAsset = new cc.JsonAsset();
                    jsonAsset.json = JSON.stringify(data);
                    resolve(jsonAsset);
                }
            });
        });
    }

    public static loadSpriteFrame(url: string): Promise<cc.SpriteFrame> {
        url = this.preUrlHandle(url);
        return new Promise((resolve, reject) => {
            cc.loader.load({
                url: url,
                type: "png" || "jpg"
            }, (err, texture) => {
                if (err) {
                    reject(new Error("Load Sprite Frame Fail: " + err));
                } else {
                    let spriteFrame = new cc.SpriteFrame(texture);
                    resolve(spriteFrame);
                }
            })
        })
    }

    public static loadAudioClip(url: string): Promise<cc.AudioClip> {
        url = this.preUrlHandle(url);
        return new Promise((resolve, reject) => {
            cc.loader.load({
                url: url,
                type: "mp3"
            }, (err, audioClip) => {
                if (err) {
                    reject(new Error("Load Audio Clip Fail: " + err));
                } else {
                    resolve(audioClip);
                }
            })
        })
    }
}
