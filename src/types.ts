export type VotingContext = {
    sessionId : string,
    clips : Clip[],
    votes : number,
    expiresAt : number,
    skips : number,
    newSkip : number
}

export type Data = {
    [key : string] : Clip
}

export type Clip = {
    path : string,
    hp : number,
    displayName : string,
    name : string
}