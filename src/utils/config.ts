import dotenv from 'dotenv'
dotenv.config()

export const config = {
    PORT: 4000,
    F_URL: "http://localhost:3000",
    ATTL: '5s' as const,
    RFTL: '7d' as const,

    // below value will come from .env file or docker-compose.yml file
    JWT_SECRET: process.env.JWT_SECRET || "put your own jwt secret",
}