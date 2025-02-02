import { rateLimit } from 'express-rate-limit';

const rateLimiter = rateLimit({
    windowMs: 30 * 1000,// 30 seconds
    limit: 100,
    message: "Too many request from this IP, please try again after a 60 second pause",
    standardHeaders: true, // return a rate limit info in 'RateLimit' headers
    legacyHeaders: false, // remove the 'X-RateLimit' headers
})
export default rateLimiter;