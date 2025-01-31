import app from "./express.js";
import appConfig from "../config.json" with { type: "json" };
import { changeClipHP, initDB } from "./dataBase.js";
import readline from "readline";

export default appConfig;

export let VoteOpen = false;
export let VoteDone = false;

export function endVote(){
    VoteOpen = false;
    VoteDone = true;
}
export function startVote(){
    VoteOpen = true;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", (input) => {
    handleCommand(input);
});

initDB();


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
        default:
            console.log("❌ Unknown command.");
    }
}

