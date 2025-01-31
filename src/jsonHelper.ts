import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Clip, Data } from "./types.js";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let FILE_DATA = "../data.json";
let writeLock = false;

/**
 * Function to read a JSON file safely
 */
export function readDB(): Data {
    try {
        const fullPath = path.join(__dirname, FILE_DATA);
        const data = fs.readFileSync(fullPath, "utf-8");
        return filterZeroHpEntries(JSON.parse(data) as Data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return {} as Data; // Return empty object if error
    }
}
export function filterZeroHpEntries(data: Data): Data {
    return Object.fromEntries(
        Object.entries(data).filter(([_, clip]) => clip.hp > 0)
    );
}

/**
 * Function to write to a JSON file safely with an optional locking mechanism
 */
export async function writeDB(data: Data, doLock = false): Promise<void> {
    if(doLock)
        closeLock();
    try {
        const fullPath = path.join(__dirname, FILE_DATA);
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error("Error writing JSON file:", error);
    } finally {
        if(doLock)
            openLock(); // Release lock after writing
    }
}

/**
 * Function to modify JSON (automatically updates the file) with race condition prevention
 */
export async function modifyDB(callback: (data: Data) => void): Promise<void> {
    while (writeLock) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Wait if another process is writing
    }

    closeLock();
    try {
        const data = readDB();
        callback(data);
        await writeDB(data);
    } finally {
        openLock(); // Release lock after modification
    }
}

function openLock(){
    writeLock = false;
}

function closeLock(){
    writeLock = true;
}