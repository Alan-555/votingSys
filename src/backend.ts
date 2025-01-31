import { Express, Request, Response } from "express";
import { getSessionData, getVotingContext, setVotingContext } from "./express.js";
import { File_, VotingContext } from "./types.js";
import { getTwoClips } from "./filesManager.js";
export function requestNewVote(req : Request) : [File_, File_] {
    let context = getVotingContext(req.session);
    let clips = getTwoClips();
    context.clips = clips;
    setVotingContext(req.session, context);
    return clips;
}