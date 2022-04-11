const inquirer = require("inquirer");
const fs = require("fs");
const pwd = process.cwd();
const path = __dirname + "/server.txt";
const shell = require("shelljs");

function inputFE() {
	fs.readFile(path, "utf-8", (err, data) => {
		if (data) {
			const result = data.split("\n").map((item) => JSON.parse(item));
			inquirer
				.prompt([
					{
						type: "list",
						name: "server",
						message: "Select Server To Build:",
						choices: ["Add New", "Clear Server", ...result.map((item) => `${item.name}/${item.ip}`)],
					},
				])
				.then((answers) => {
					if (answers.server === "Add New") {
						return addServer();
					}
					if (answers.server === "Clear Server") {
						return clearServer();
					}
					const server = result.find(
						(item) => item.name === answers.server.split("/")[0] && item.ip === answers.server.split("/")[1]
					);
					if (server) {
						if (`${pwd}/build` !== server.folder_path_local) {
							return shell.exec(`scp -r ${server.folder_path_local}/build root@${server.ip}:${server.folder_path}`);
						}
						shell.exec(`scp -r ${pwd}/build root@${server.ip}:${server.folder_path}`);
					}
				});
		} else {
			addServer();
		}
	});
}

function addServer() {
	inquirer
		.prompt([
			{ type: "input", message: "Name:", name: "name" },
			{ type: "input", message: "Ip:", name: "ip" },
			{ type: "input", message: "Folder_path:", name: "folder_path" },
			{ type: "input", message: "Folder_path_Local:", name: "folder_path_local" },
		])
		.then(async (answers) => {
			if (`${pwd}/build` !== answers.folder_path_local) {
				shell.exec(`scp -r ${answers.folder_path_local}/build root@${answers.ip}:${answers.folder_path}`);
			} else {
				shell.exec(`scp -r ${pwd}/build root@${answers.ip}:${answers.folder_path}`);
			}
			const newPath = __dirname + "/server.txt";
			fs.readFile(path, "utf-8", (err, buff) => {
				let data = buff;
				if (data) {
					data = buff + "\n" + JSON.stringify(answers);
				} else {
					data = JSON.stringify(answers);
				}
				fs.writeFile(newPath, data, async (err) => {
					if (err) {
						console.log(err);
					}
				});
			});
		});
}

function clearServer() {
	const newPath = __dirname + "/server.txt";
	fs.writeFile(newPath, "", async (err) => {
		if (err) {
			console.log(err);
		}
	});
}

module.exports = {
	inputFE,
};
