import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";


const PORT = config.port || 3000;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the DB successfully");

    app.listen(PORT, () => {
      console.log(`FixItNow Server Is Running on Port : ${PORT}`);
    });
  } catch (error) {
    console.log("Error Starting the server", Error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
