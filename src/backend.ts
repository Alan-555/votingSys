import { Express, Request, Response } from "express";
import { getAllSessions, getSessionData, getVotingContext, setVotingContext } from "./express.js";
import { Clip, VotingContext } from "./types.js";
import { changeClipHP, getRemaining, getTwoClips } from "./dataBase.js";
import appConfig, { HardModeState, setHardMode } from "./app.js";
export function requestNewVote(req: Request): [Clip, Clip] {
    setHardMode();
    let context = getVotingContext(req.session);
    let clips = getTwoClips();
    context.clips = clips;
    context.expiresAt = Date.now() + appConfig.voteTime;
    if (context.newSkip++ == appConfig.newSkipRewardAfterVotes) {
        context.skips += 3;
        context.newSkip = 0;
    }
    setVotingContext(req.session, context);
    return clips;
}

export function vote(context: VotingContext, clip: number): VotingContext {
    if (!context) {
        throw new Error("No voting context found");
    }
    if (context.clips.length != 2) {
        throw new Error("Ilegal voting context (clip length != 2)");
    }
    context.votes += 1;
    let offset = HardModeState;
    changeClipHP(context.clips[clip].name, 1);
    changeClipHP(context.clips[clip == 0 ? 1 : 0].name, -offset);
    context.clips = [];
    return context;
}

/**
 * Checks if a given VotingContext is legal to vote from.
 * @returns 0 if legal, 1 if context.clips.length != 2, 2 if context.expiresAt is reached
 */
export function isContextLegal(context: VotingContext): number {
    if (!context) throw new Error("No voting context found");
    if (context.clips.length != 2) return 1;
    return context.expiresAt < Date.now() ? 2 : 0;
}


export function getRandomVoteMessage(): string {
    let options = [
        "Tuhle píčovinu???",
        "No nic moc teda.",
        "Hmmm, proč vůbec hlasujem. Tohle by mohl být... i když.... ne. Měl bych zase začít žrát ty prášky.",
        "Co????",
        "CO JE S TEBOU ŠPATNĚ?!!",
        "Karel gott.",
        "To docela ujde.",
        "HAHAHAHAH COMEDY!!!",
        "Si asi updal z jahody na znak?",
        "Hmmmm. I'm not here to judge, but...",
        "Haf.",
        "To docela ujde...",
        "Hmmm, máš zajímavý vkus.",
        "Proti gustu žádný dišputát.",
        "No....",
        "TOHLE?? TYS TAM MĚL TAKOVOU ÚŽASNOST A VYBRALS TATMOT??????",
        "Tak s tím si dovolím nesouhlasit!",

        "Ty vole, to je jak pěst na oko.",
        "Eh. No... takhle sis to představoval?",
        "Kdo tě k tomu donutil?!",
        "Tady někdo zapomněl brát léky.",
        "Tohle je umění? Nebo spíš trestný čin?",
        "Tak tomu říkám... odvážná volba.",
        "Tohle by neprošlo ani u babičky na vesnické soutěži.",
        "Hmmm, no dobře... ale proč?",
        "To je tak špatný, až je to vlastně docela dobrý.",
        "Kdo tě v dětství takhle traumatizoval?",
        "Haha, díky, teď mám migrénu!",
        "Fajn, kdo tohle pustil do hlasování?!",
        "Na tohle musím jít na panáka.",
        "Zamysli se nad svými životními rozhodnutími.",
        "No, asi máme jiný vkus... a jiný mozek. A jiný druh",
        "Někdo tady zapomněl, že vkus není trestný čin.",
        "To ujde.",
        "Radši bych si dal pětihodinový rozhovor s úředníkem z finančáku.",
        "Tohle mi sežral pes a vyzvracel něco lepšího.",
        "Haha, počkej... to myslíš vážně?",
        "No, někde ve vesmíru právě vybuchla planeta.",
        "Děkujeme za účast, ale příště radši ne.",
        "Radši bych si vrazil hřebík do kolena.",
        "No, aspoň jsi to zkusil.",
        "Některé věci by měly zůstat v utajení... třeba tohle.",
        "Tohle je jako instantní žaludeční nevolnost.",
        "Říká se, že každý má právo na názor... ale ne každý by ho měl říkat nahlas.",
        "Tohle je ten typ věci, co ti zničí den, ale pak na to vzpomínáš a směješ se.",
        "Tohle by schválila jen naprosto šílená porota.",
        "Hmmm, no, může být... ale spíš nemůže.",
        "Hahaha, ne.",
        "No tak tohle... tohle fakt ne.",
        "Říká se, že každý máme jiný vkus, ale tohle je přímo z jiného vesmíru.",
        "Můj pes má lepší vkus. A to jí svoje hovínka.",
        "Jsi si jistý, že sis to nepopletl s něčím jiným?",
        "Tohle je tak špatné, že se o tom bude psát v učebnicích.",

    ]
    return options[Math.floor(Math.random() * options.length)];

}

export function getHardModeMessage(): string | null {
    let options = [
        null,
        "ČTVRTINA KLIPŮ JE Z KOLA VEN. Double damage zapnut!",
        "PŮLKA KLIPŮ JE Z KOLA VEN. Triple damage zapnut!",
        "ZBÝVÁ FINÁLNÍ ČTVRTINA. Nic nového se neděje tho..."
    ]
    return options[HardModeState - 1];
}