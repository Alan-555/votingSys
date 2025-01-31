import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { File_ } from "./types.js";

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function getFiles(): File_[] {
    const directoryPath = path.join(__dirname, "../public/files");

    // Check if directory exists
    if (!fs.existsSync(directoryPath)) {
        console.error(`Directory not found: ${directoryPath}`);
        return [];
    }

    const files = fs.readdirSync(directoryPath);
    const fileDict: File_[] = [];

    files.forEach((file) => {
        fileDict.push({ name: file, path: `../public/files/${file}` });
    });

    return fileDict;
}


export function getTwoClips() : [File_, File_] {//TODO: do not give the clip that was given before?
    const files = getFiles();
    let ret = getTwoRandomItems<File_>(files);
    if(ret)
        return ret;
    else
        throw new Error("No files found");
}

export function getFileCount() : number {
    return Object.keys(getFiles()).length;
}


function getTwoRandomItems<T>(arr: T[]): [T, T] | null {
    if (arr.length < 2) return null; // Ensure array has at least two items

    const shuffled = arr.slice().sort(() => Math.random() - 0.5); // Shuffle copy
    return [shuffled[0], shuffled[1]]; // Pick first two unique items
}