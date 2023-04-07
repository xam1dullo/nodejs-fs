const fs = require('node:fs/promises');
const targetFile = "command.txt"
/*
1. open
2. read or write 
3. 
*/
console.log(targetFile);
;(async () => {
	// commands 
	const CREATE_FILE = "create the file";
	const DELETE_FILE = "delete the file";
	const RENAME_FILE = "rename the file";
	const ADD_TO_FILE = "add the the file";


	const createFile = async (path) => {
		try{
			const existingFileHandle = await fs.open(path, "r");
			existingFileHandle.close()
			return console.log(`The file  ${path} already exists. `);
		} catch (e){
			const newFileHandle = await fs.open(path, "w");
			console.log("A new file was successfully created");
			newFileHandle.close()

		}
	}

	const deleteFile = async (path) => {
		try {
			await fs.unlink(path);
			console.log(`The file was seccussfully removed.`)
		} catch(e){
			if(e.code === "ENOENT")
				console.log("No file at this path to remove");
			else
				console.log("An Error occurred while removeing the file");
			console.log(e)
		}
	}
	const  renameFile = async (oldPath, newPath) => {
		try {
			await fs.rename(oldPath, newPath);
			console.log(`The file was seccussfully renamed`)
		} catch(e) {
			if(e.code === "ENOENT")
				console.log("No file at this path to rename, or the destination doesn't exist.");
			else
				console.log("An Error occurred while removeing the file");
			console.log(e)
		}
	}

	const addToFile = async (path, content) => {
		try {
			const fileHandle = await fs.open(path, "a")
			fileHandle.write(content)
			console.log(`The content was added seccussfully`)
		} catch(e) {
				console.log("An Error occurred while removeing the file");
			console.log(e);
		}
	}

	const commandFileHandler = await  fs.open(`./${targetFile}`,"r"	)
	const watcher = fs.watch(`./${targetFile}`);
	
	commandFileHandler.on("change", async () => {
				//get the size our file
		const size = (await commandFileHandler.stat()).size
		const buff = Buffer.alloc(size)
		const offset = 0;
		const length = buff.byteLength
		const position = 0

				// we want to read content
		const content = await commandFileHandler.read(buff, offset, length, position)
		const command = buff.toString('utf-8')

				//create file 
				//create file  <path>
		if(command.includes(CREATE_FILE)){
			const filePath = command.substring(CREATE_FILE.length + 1)
			createFile(filePath);
		} 
				//delete file 
				//delete file  <path>
		if(command.includes(DELETE_FILE)){
			const filePath = command.substring(DELETE_FILE.length + 1)
			deleteFile(filePath);			
		}
				//rename file 
				//rename file  <path> to <path>
		if(command.includes(RENAME_FILE)){
			const _idx = command.indexOf(" to ")
			const oldPath = command.substring(RENAME_FILE.length + 1,_idx)
			const newPath = command.substring(_idx+4)
			renameFile(oldPath, newPath)
		}

				//add to the file 
				//add to the file <path> this content : <content>
		if(command.includes(ADD_TO_FILE)){
			const _idx = command.indexOf(" this content: ")
			const filePath = command.substring(ADD_TO_FILE.length + 1, _idx)
			const content = command.substring(_idx + 15)
			addToFile(filePath, content);			
		}


	})


	for await (const event of watcher)
		if(event.eventType === "change"){
			commandFileHandler.emit("change");
		}
	})();