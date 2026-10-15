// Local development entry point (npm run dev). In production the same Express app is served by
// Firebase Functions — see src/index.ts.
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env.dev") });

import { app } from "./app";

app.listen(process.env.PORT || 3000, () => console.log("backend listo"));
