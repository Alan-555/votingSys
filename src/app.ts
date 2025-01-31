import app from "./express.js";
import appConfig from "../config.json" with { type: "json" };
import { changeClipHP, getRemaining, initDB } from "./dataBase.js";
import readline from "readline";

export default appConfig;

export let VoteOpen = false;
export let VoteDone = false;
export let HardModeState = 1; //1 - normal, 2- double damage, 3- triple damage

export function endVote(){
    VoteOpen = false;
    VoteDone = true;
}
export function startVote(){
    VoteOpen = true;
}
export function setHardMode(){
    let d = 4;
    HardModeState = Math.floor(d+1 - getRemaining()/(Math.round(appConfig.totalClipCount / d)));
    HardModeState = Math.min(3, HardModeState);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", (input) => {
    handleCommand(input);
});



app.listen(3000, () => {
    console.log("Server started on port 3000");
});


function handleCommand(command: string) {
    switch (command.trim()) {
        case "voteStart" :
            VoteOpen = true;
            break;
        case "voteEnd":
            VoteOpen = false;
        break;
        case "initDB":
            initDB();
            break;
        default:
            console.log("❌ Unknown command.");
    }
}

