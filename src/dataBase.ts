import appConfig from "./app.js";
import { getFileCount, getFiles } from "./filesManager.js";
import { modifyDB, readDB, writeDB } from "./jsonHelper.js";
import { Data } from "./types.js";



export function initDB(){
    let dict = getFiles();
    let data : Data = {};
    for(let v of dict){
        data[v.name] = {
            hp : appConfig.initHP,
            path : v.path
        };
    }
    writeDB(data);
    
}

export function changeClipHP(name : string, hp : number){
    modifyDB((data) => {
        data[name].hp+= hp;
        
    });
}