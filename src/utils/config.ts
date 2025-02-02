import dotenv from 'dotenv'
dotenv.config()

export default {
    PORT: process.env.PORT || 4000,
    F_URL: process.env.F_URL || "here goes the frontend url",
    

}