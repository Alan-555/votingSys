export type VotingContext = {
    sessionId : string,
    clips : File_[],
    votes : number
}

export type Data = {
    [key : string] : Clip
}

export type Clip = {
    path : string,
    hp : number
}

export type File_ ={
    name : string,
    path : string
}