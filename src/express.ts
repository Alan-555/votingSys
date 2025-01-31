import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session, { Session } from "express-session";
import secretConfig from "./../secret.json" with { type: "json" };
import { VotingContext } from "./types.js";
import { requestNewVote, vote } from "./backend.js";
import { changeClipHP } from "./dataBase.js";
import { inspect } from "util";


const app = express();

export default app;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(

    session({
        secret: secretConfig.sessionSecret, // Change this to a strong secret
        resave: false, // Avoid resaving unchanged sessions
        saveUninitialized: true, // Save new sessions
        cookie: { secure: false } // Set `true` if using HTTPS
    })
);

app.use((req, res, next) => {
    if (!getSessionData<VotingContext>(req.session, "votingContext")) {
        setSessionData<VotingContext>(req.session, "votingContext",{
            clips:[],
            sessionId: req.sessionID,
            votes: 0
        } );
    }
    next();
});


// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Define a simple API route
app.get("/api", (req, res) => {
    res.json({ message: "Hello from API!" + JSON.stringify(getSessionData<VotingContext>(req.session, "votingContext")) });
});
app.post("/api/new", (req, res) => {
    let clips = requestNewVote(req);
    res.json({ message: "Your clips: " + JSON.stringify(clips) });
});
app.post("/api/vote", (req, res) => {
    try{
        let newContext = vote(getVotingContext(req.session), 0);
        setVotingContext(req.session, newContext);
        res.json({ message: "Voted succesfully"}).status(200);
    }catch(e){
        console.log(e);
        res.json({ message: "Error voting! "+e}).status(500);
    }
    
})


app.get("/destroy-session", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error destroying session");
        }
        res.send("Session destroyed!");
    });
});

export function setSessionData<T = any>(session: session.Session, key: string, value: T) {
    (session as any)[key] = value;
}
export function getSessionData<T>(session: session.Session, key: string): any {
    return (session as any)[key] as T;
}
export function getVotingContext(session: session.Session) : VotingContext{
    return getSessionData<VotingContext>(session, "votingContext");
}
export function setVotingContext(session: session.Session, context: VotingContext){
    setSessionData<VotingContext>(session, "votingContext",context);
}