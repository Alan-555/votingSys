import app from "./express.js";
import appConfig from "../config.json" with { type: "json" };
import { changeClipHP, initDB } from "./dataBase.js";

export default appConfig;

initDB();


app.listen(3000, () => {
    console.log("Server started on port 3000");
});


