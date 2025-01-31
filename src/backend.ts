import { Express, Request, Response } from "express";
import { getSessionData, getVotingContext, setVotingContext } from "./express.js";
import {Clip, VotingContext } from "./types.js";
import { changeClipHP, getTwoClips } from "./dataBase.js";
import appConfig from "./app.js";
export function requestNewVote(req : Request) : [Clip,Clip] {
    let context = getVotingContext(req.session);
    let clips = getTwoClips();
    context.clips = clips;
    context.expiresAt = Date.now() + appConfig.voteTime;
    if(context.newSkip++==appConfig.newSkipRewardAfterVotes){
        context.skips+=3;
        context.newSkip = 0;
    }
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

/**
 * Checks if a given VotingContext is legal to vote from.
 * @returns 0 if legal, 1 if context.clips.length != 2, 2 if context.expiresAt is reached
 */
export function isContextLegal(context : VotingContext) : number {
    if(!context) throw new Error("No voting context found");
    if(context.clips.length != 2) return 1;
    return context.expiresAt < Date.now() ? 2 : 0;
}


export function getRandomVoteMessage() : string{
    let options = [
        "Tuhle píčovinu???",
        "No nic moc teda.",
        "Hmmm, proč vůbec hlasujem. Tohle by mohl být... i když.... ne. Měl bych zase začít žrát ty prášky",
        "Co????",
        "CO JE S TEBOU ŠPATNĚ?!!",
        "Karel gott",
        "To docela ujde",
        "HAHAHAHAH COMEDY!!!",
        "Si asi updal z jahody na znak?",
        "Hmmmm. I'm not here to judge, but...",
        "Haf",
        "To docela ujde...",
        "Hmmm, máš zajímavý vkus",
        "Proti gustu žádný dišputát",
        "No....",
        "TOHLE?? TYS TAM MĚL TAKOVOU ÚŽASNOST A VYBRALS TATMOT??????",
        "Tak s tím si dovolím nesouhlasit!",
    ]
    return options[Math.floor(Math.random() * options.length)];

}