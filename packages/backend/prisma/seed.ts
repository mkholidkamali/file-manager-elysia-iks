import "dotenv/config"; 
import prisma from '../src/utils/prisma';

// Called
seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


// Function
async function createFolderWithPath(data: {
	name: string,
	parentId?: bigint | number | null
}) {
	// Create
	const folder = await prisma.folder.create({
		data: {
			name: data.name,
			parentId: data.parentId ?? null
		}
	});

	// Search parent
	let path = `/${folder.id}/`
	let depth = 0;
	if (data.parentId) {
		const parent = await prisma.folder.findUnique({ where: { id: data.parentId } });
		if (!parent) throw new Error("Parent folder not found");

		path = `/${parent.id}/${folder.id}/`;
		depth = parent.depth + 1;
	}

	// Update depth
	await prisma.folder.update({
		where: { id: folder.id },
		data: { path, depth }
	});

	return { ...folder, path, depth };
}

async function seed() {
	// Check env
	const env = process.env.APP_ENV ?? "development";
	if (env.toLowerCase().includes("prod")) {
		console.log("Production mode, skip");
		return;
	}

	// Connect prism
	console.log("Menabur benih...");
	await prisma.$connect();

	// Refresh
	await prisma.file.deleteMany();
	await prisma.folder.deleteMany();

	// Add Root folder
	const rootA = await createFolderWithPath({ name: "Root A" });
	const rootB = await createFolderWithPath({ name: "Root B" });
	
	// Add Child folder
	const childA1 = await createFolderWithPath({ name: "Child A1", parentId: rootA.id });
	const childA2 = await createFolderWithPath({ name: "Child A2", parentId: rootA.id });

	// Add Sub folder
	const subA1a = await createFolderWithPath({ name: "Sub A1a", parentId: childA1.id });

	// Add files per-folder
	await prisma.file.createMany({
		data: [
			{ folderId: rootA.id, name: "readme.md", size: 1234 },
			{ folderId: childA1.id, name: "photo.jpg", size: 1234 },
			{ folderId: subA1a.id, name: "notes.txt", size: 1234 },
		]
	});

	console.log("Benih tertabur...");
}