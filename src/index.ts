import { config } from "./utils/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler, uncaughtExceptionHandler } from "./utils/middleware/errorHandler";
import authRouter from "./router/authRouter";
import jwt from "jsonwebtoken";
import { deserializeUser } from "./utils/middleware/deserializeUser";

const app = express();

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

app.use(deserializeUser)

// routes
app.all('/', (_req: Request, res: Response) => {
    res.status(200).json({
        Status: 'OK',
        RunTime: process.uptime(),
    });
});
app.use('/api/v1/auth', authRouter)
app.get('/api/v1/user', (req: Request, res: Response, next: NextFunction) => {
    const decode = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM4NDkxNDQ3LCJleHAiOjE3Mzg0OTUwNDd9.K6D6xBJuGGPFmh5GQTH5zxcdHZ8VWh5Q1agmdelBQwI", config.JWT_SECRET);
    res.status(200).json({
        decode
    });
})

// these will handle the uncaught exceptions and unhandled rejections
process.on('unhandledRejection', uncaughtExceptionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

// this will handle all the errors
app.use(errorHandler);

// for starting the server
app.listen(config.PORT, () => {
    console.log(`Start on ${config.PORT} ✅`)
})