#! /usr/bin/env node
console.log("The CLI is working 🚀");
const inquirer = require("inquirer");
const shell = require("shelljs");
const { updateServiceRemoveImageAndContainer } = require("./container");
const path = process.cwd();
const { initCLI } = require("./config/init.js");
const FE = "root@10.86.70.17:/home/adminvm/TraVinh/TTKTXH";

initCLI();

inquirer
	.prompt([
		{
			type: "list",
			name: "type",
			message: "Select Platform:",
			choices: ["FE", "BE"],
		},
	])
	.then((answers) => {
		if (answers.type === "FE") {
			shell.exec(`scp -r ${path}/build ${FE}`);
		}
		if (answers.type === "BE") {
			deployBE();
		}
	});

function deployBE() {
	inquirer
		.prompt([
			{
				type: "list",
				name: "type",
				message: "Select:",
				choices: ["Update Service", "Build New"],
			},
		])
		.then((answers) => {
			if (answers.type === "Update Service") {
				updateServiceRemoveImageAndContainer();
			}
		});
}
