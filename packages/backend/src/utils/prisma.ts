import "dotenv/config"; 
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

export default prisma;