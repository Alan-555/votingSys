import appConfig from "./app.js";
import { getFileCount, getFiles } from "./filesManager.js";
import { modifyDB, readDB, writeDB } from "./jsonHelper.js";
import { Clip, Data } from "./types.js";



export function initDB(){
    let dict = getFiles();
    let data : Data = {};
    for(let v of dict){
        data[v.path.split("/").pop()!] = v;
    }
    
    writeDB(data,true);
    
}

export function changeClipHP(name : string, hp : number){
    modifyDB((data) => {
        if(!data[name]) return;
        if(data[name].hp+hp>appConfig.maxHP)
            data[name].hp = appConfig.maxHP;
        else
            data[name].hp+= hp;
        
    });
}

export function getRemaining() : number {
    return Object.keys(readDB()).length;
}

export function getTwoClips() : [Clip,Clip] {//TODO: do not give the clip that was given before?
    const files = readDB();
    let ret = getTwoRandomItems<Clip>(files);
    if(ret)
        return ret;
    else
        throw new Error("No files found");
}

function getTwoRandomItems<T>(obj: Record<string, T>): [T, T] | null {
    const values = Object.values(obj); // Extract values from the object

    if (values.length < 2) return null; // Ensure at least two items

    const shuffled = values.sort(() => Math.random() - 0.5); // Shuffle copy
    return [shuffled[0], shuffled[1]]; // Pick first two unique items
}
