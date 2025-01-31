import { Express, Request, Response } from "express";
import { getSessionData, getVotingContext, setVotingContext } from "./express.js";
import { File_, VotingContext } from "./types.js";
import { getTwoClips } from "./filesManager.js";
import { changeClipHP } from "./dataBase.js";
export function requestNewVote(req : Request) : [File_, File_] {
    let context = getVotingContext(req.session);
    let clips = getTwoClips();
    context.clips = clips;
    setVotingContext(req.session, context);
    return clips;
}

export function vote(context : VotingContext, clip : number) : VotingContext {
    if(!context){
        throw new Error("No voting context found");
    }
    if(context.clips.length != 2){
        throw new Error("Ilegal voting context (clip length != 2)");
    }
    context.votes += 1;
    changeClipHP(context.clips[clip].name, 1);
    changeClipHP(context.clips[clip == 0 ? 1 : 0].name, -1);
    context.clips = [];
    return context;
}