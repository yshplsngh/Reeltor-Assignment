import config from "./utils/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandler";

const app  = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: config.F_URL,
    credentials: true
}));




app.use(errorHandler);
app.listen(config.PORT, () => {
    console.log(`Start on ${config.PORT} ✅`)
})