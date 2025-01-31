import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Clip } from "./types.js";
import appConfig from "./app.js";

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function getFiles(): Clip[] {
    const directoryPath = path.join(__dirname, "../public/files");

    // Check if directory exists
    if (!fs.existsSync(directoryPath)) {
        console.error(`Directory not found: ${directoryPath}`);
        return [];
    }

    const files = fs.readdirSync(directoryPath);
    const fileDict: Clip[] = [];

    files.forEach((file) => {
        let displayName = file;
        try{

            displayName = file.split(";")[0].split(".")[0];
            displayName = toReadableString(displayName);
        }
        catch{

        }
        fileDict.push({name: file,path: `../public/files/${file}` ,displayName:displayName,hp : appConfig.initHP-5});
    });

    return fileDict;
}

function toReadableString(input: string): string {
    return input
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Convert camelCase or PascalCase
        .replace(/[_-]/g, " ") // Convert snake_case and kebab-case
        .toLowerCase(); // Convert to lowercase for consistency
}


export function getFileCount() : number {
    return Object.keys(getFiles()).length;
}

