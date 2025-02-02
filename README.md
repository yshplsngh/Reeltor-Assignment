## 🛠️ Tech Stack

- TypeScript
- Express.js
- Prisma (ORM)
- PostgreSQL
- JSON Web Tokens
- Zod (Schema validation)

## Prerequisites for Installation

- Docker
- Docker Compose

## 🏗️ Installation using docker
1. Clone the repository
2. Run ```docker-compose up```
3. The server will be running on `http://localhost:4000`
- Note: You need to turn off your local postgres server before running this command

## 🏗️ Manual Installation

1. Clone the repository
2. Run ```npm install```
3. Run ```npx prisma migrate dev```
4. Run ```npm run dev```
5. The server will be running on `http://localhost:4000`
