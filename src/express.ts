import express,{Request,Response} from "express";
import path from "path";
import { fileURLToPath } from "url";
import session, { Session } from "express-session";
import secretConfig from "./../secret.json" with { type: "json" };
import { VotingContext } from "./types.js";
import { getHardModeMessage, getRandomVoteMessage, isContextLegal, requestNewVote, vote } from "./backend.js";
import { changeClipHP, getRemaining } from "./dataBase.js";
import { inspect } from "util";
import flash from "express-flash";
import { readDB } from "./jsonHelper.js";
import appConfig, { endVote, HardModeState, startVote, VoteDone, VoteOpen } from "./app.js";


const app = express();

export default app;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const store = new session.MemoryStore();

app.use(

    session({
        secret: secretConfig.sessionSecret, // Change this to a strong secret
        resave: false, // Avoid resaving unchanged sessions
        saveUninitialized: true, // Save new sessions
        cookie: { secure: false }, // Set `true` if using HTTPS
        store: store
    })
);
app.use(flash());

app.use((req, res, next) => {
    if (!getSessionData<VotingContext>(req.session, "votingContext")) {
        setSessionData<VotingContext>(req.session, "votingContext", {
            clips: [],
            sessionId: req.sessionID,
            votes: 0,
            expiresAt: 0,
            skips: 5,
            newSkip: 0,
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
            "message" : VoteDone ? "Bylo vybráno nejlepších "+appConfig.voteEnd : "Tak se připrav",
            errorMessages : req.flash("e"),
            isAdmin : getSessionData(req.session, "isAdmin")
        });
        return;
    }


    let voteStatus = isContextLegal(getVotingContext(req.session));
    if (voteStatus == 1) {
        requestNewVote(req);
    }
    else if (voteStatus == 2) {
        requestNewVote(req);
        req.flash("e", "Čas vypršel!");
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
        errorMessages : req.flash("e"),
        isAdmin : getSessionData(req.session, "isAdmin"),
        hardMode : getHardModeMessage()
    });

});
app.get("/login", (req, res) => {
    res.render("login",{
        messages : req.flash("m"),
        errorMessages : req.flash("e")
    });
});

adminGet('/sessions', async (req, res) => {
    try{
        res.json(await getAllSessions());
    }
    catch(e){
        res.json({error: e});
    }
  });

// Define a simple API route
app.get("/api", (req, res) => {
    res.json({ message: "Hello from API!" + JSON.stringify(getSessionData<VotingContext>(req.session, "votingContext")) });
});
app.post("/api/new", (req, res) => {
    let context = getVotingContext(req.session);
    if(context.skips ==0){
        req.flash("e", "Nepřeskakuješ nějak často?!! Tu a tam halsuj a přeskakovat budeš zase moct.");
        res.redirect("/");
        return;
    }
    context.skips--;
    setVotingContext(req.session, context);
    requestNewVote(req);
    req.flash("m", "Tady máš něco nového, ale nepřeskakuj moc často >:(");
    res.redirect("/");
});
app.post("/api/admin", (req, res) => {
   if(req.body["password"] == secretConfig.adminPass){
      setSessionData(req.session, "isAdmin",true);
      req.flash("m", "You are now admin!");
      res.redirect("/");

   } 
   else{
      req.flash("e", "Wrong password!");
      res.redirect("/login");
   }
});
adminGet("/list", (req, res) => {
    res.render("clips",{
        "clips" : Object.values(readDB()),
        isAdmin : getSessionData(req.session, "isAdmin")
    });
 });


adminGet("/api/list", (req, res) => {
    res.json(readDB());
 });
adminGet("/api/start", (req, res) => {
    startVote();
    res.json({ message: "Voting started!" });
});
adminGet("/api/end", (req, res) => {
    endVote();
    res.json({ message: "Voting ended!" });
});

app.post("/api/vote", (req, res) => {
    if(!VoteOpen){
        req.flash("e", "The voting is not open!");
        res.redirect("/");
        return;
    }
    try {
        let context = getVotingContext(req.session);
        if (isContextLegal(context) ==2) {
            req.flash("e", "Toto hlasování již vypršelo!");
            res.redirect("/");
            return;
        }
        let newContext = vote(context, req.body["clip"]);
        setVotingContext(req.session, newContext);
        if(getRemaining()<= appConfig.voteEnd){
            endVote();
            req.flash("m", "A JE TO! GRATULUJI SEŠ TEN CO DAL HLAS POSLEDNÍ!!!!!");
            res.redirect("/");
            return;
        }
        req.flash("m", getRandomVoteMessage() + " Každopádně, tvůj hlas byl uložen.");
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

export function getAllSessions(): Promise<session.SessionData[]> {
    return new Promise((resolve, reject) => {
        store.all((err, sessions) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(sessions as unknown as session.SessionData[]);
            }
          });
    });
}


function adminGet(path : string, callback : (req : Request, res : Response) => void){
    app.get(path, (req, res) => {
        if(getSessionData(req.session, "isAdmin")){
            callback(req, res);
        }
        else{
            res.json({ message: "You are not admin!" }).status(403);
        }
     });
}

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