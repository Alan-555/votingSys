import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session, { Session } from "express-session";
import secretConfig from "./../secret.json" with { type: "json" };
import { VotingContext } from "./types.js";
import { getRandomVoteMessage, isContextLegal, requestNewVote, vote } from "./backend.js";
import { changeClipHP, getRemaining } from "./dataBase.js";
import { inspect } from "util";
import flash from "express-flash";
import { readDB } from "./jsonHelper.js";
import appConfig, { endVote, VoteDone, VoteOpen } from "./app.js";


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
app.use(flash());

app.use((req, res, next) => {
    if (!getSessionData<VotingContext>(req.session, "votingContext")) {
        setSessionData<VotingContext>(req.session, "votingContext", {
            clips: [],
            sessionId: req.sessionID,
            votes: 0,
            expiresAt: 0
        });
    }
    next();
});
app.use(express.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));


// Serve static files
app.use(express.static(path.join(__dirname, "../public")));


app.get("/", (req, res) => {
    if(!VoteOpen){
        res.render("message", {
            messages : req.flash("m"),
            "title" : VoteDone ? "hlasování je ukonce" : "Zachvíli začneme hlasování!",
            "message" : VoteDone ? "Bylo vybráno nejlepších "+appConfig.voteEnd : "(snad to bude fungovat lol)",
            errorMessages : req.flash("e")
        });
        return;
    }


    let voteStatus = isContextLegal(getVotingContext(req.session));
    if (voteStatus == 1) {
        requestNewVote(req);
    }
    else if (voteStatus == 2) {
        requestNewVote(req);
        req.flash("e", "The voting period has ended!");
        res.redirect("/");
        return;
    }
    let clips = getVotingContext(req.session);
    let m = req.flash("m");
    res.render("index", {
        clips: clips.clips,
        remainingClips: getRemaining(),
        time: ((clips.expiresAt - Date.now()) / 1000).toPrecision(2),
        messages: m,
        errorMessages : req.flash("e")
    });

});


// Define a simple API route
app.get("/api", (req, res) => {
    res.json({ message: "Hello from API!" + JSON.stringify(getSessionData<VotingContext>(req.session, "votingContext")) });
});
app.post("/api/new", (req, res) => {
    let clips = requestNewVote(req);
    res.json({ message: "Your clips: " + JSON.stringify(clips) });
});
app.post("/api/admin", (req, res) => {
   if(req.body["password"] == secretConfig.adminPassword){

   } 
});
app.post("/api/vote", (req, res) => {
    if(!VoteOpen){
        req.flash("e", "The voting is not open!");
        res.redirect("/");
    }
    try {
        let newContext = vote(getVotingContext(req.session), req.body["clip"]);
        setVotingContext(req.session, newContext);
        if(getRemaining()<= appConfig.voteEnd){
            endVote();
            req.flash("m", "A JE TO! GRATULUJI SEŠ TEN CO DAL HLAS POSLEDNÍ!!!!!");
            res.redirect("/");
            return;
        }
        req.flash("m", getRandomVoteMessage() + " Každopádně, tvůj hlas byl uložen. Snad.");
        res.redirect("/");

    } catch (e) {
        console.log(e);
        req.flash("e", "An error occured while voting!\n"+e);
        res.redirect("/");
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
export function getVotingContext(session: session.Session): VotingContext {
    return getSessionData<VotingContext>(session, "votingContext");
}
export function setVotingContext(session: session.Session, context: VotingContext) {
    setSessionData<VotingContext>(session, "votingContext", context);
}