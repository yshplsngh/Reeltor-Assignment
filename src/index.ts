import config from "./utils/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandler";

const app  = express();

// when our backend is behind a reverse proxy like nginx, we need to set this
app.set('trust proxy', 1);

// so express does not parse body of the request by default, so we have to use this
app.use(express.json());

// to log the requests in the console
app.use(morgan('dev'));

// it will parse the cookies from req.headers.cookie and add it to req.cookies
app.use(cookieParser());

// when we want to allow a particular frontend to access our backend
app.use(cors({
    origin: config.F_URL,
    credentials: true
}));

// this will handle all the errors
app.use(errorHandler);

// for starting the server
app.listen(config.PORT, () => {
    console.log(`Start on ${config.PORT} ✅`)
})