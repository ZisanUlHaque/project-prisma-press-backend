import app from "./app";
import { prisma } from "./lib/prisma";
import "dotenv/config";

const PORT = process.env.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the Database Successfully!!!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Error startig the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
