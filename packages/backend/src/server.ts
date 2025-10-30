import "dotenv/config";
import { app } from './app'
import prisma from './utils/prisma'


// Listen
(async () => {
	const port = process.env.PORT ? Number(process.env.PORT) : 3000

	try {
		app.listen(port);
		console.log(`Server goes brrrr on port ${port}`);
	} catch (err) {
		console.error("[startup] failed to start server:", err);
		try {
			await prisma.$disconnect();
		} catch (e) {
			console.error("[startup] error disconnecting prisma:", e);
		}
		process.exit(1);
	}
}) ();

// Shutdown prisma
process.on("SIGINT", async () => {
	console.log("SIGINT received. Disconnecting prisma and exiting.");
	await prisma.$disconnect();
	process.exit(0);
});