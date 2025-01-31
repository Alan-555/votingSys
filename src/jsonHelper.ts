import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Clip, Data } from "./types.js";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let FILE_DATA = "../data.json";

// Function to read a JSON file
export function readDB(): Data {
    try {
        const fullPath = path.join(__dirname, FILE_DATA);
        const data = fs.readFileSync(fullPath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return {} as Data; // Return empty object if error
    }
}

// Function to write to a JSON file
export function writeDB(data: Data): void {
    try {
        const fullPath = path.join(__dirname, FILE_DATA);
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error("Error writing JSON file:", error);
    }
}

// Function to modify JSON (automatically updates the file)
export function modifyDB(
    callback: (data: Data) => void
): void {
    const data = readDB();
    callback(data);
    writeDB(data);
}
