#! /usr/bin/env node
console.log("The CLI is working 🚀");
const inquirer = require("inquirer");
const { updateServiceRemoveImageAndContainer } = require("./container");
const { initCLI } = require("./config/init.js");
const { settingHA } = require("./haproxy/stdSystem");
const { settingVituarlIP } = require("./vituarlIP");
const { inputFE } = require("./fe");
initCLI();

inquirer
	.prompt([
		{
			type: "list",
			name: "type",
			message: "Select:",
			choices: ["FE", "BE", "HAProxy", "Vituarl IP", "Vituarl IP + HAProxy"],
		},
	])
	.then((answers) => {
		if (answers.type === "FE") {
			inputFE();
		}
		if (answers.type === "BE") {
			deployBE();
		}
		if (answers.type === "HAProxy") {
			settingHA();
		}
		if (answers.type === "Vituarl IP") {
			settingVituarlIP();
		}
		if (answers.type === "Vituarl IP + HAProxy") {
			settingVituarlIP(true);
		}
	});

function deployBE() {
	inquirer
		.prompt([
			{
				type: "list",
				name: "type",
				message: "Select:",
				choices: ["Update Service"],
			},
		])
		.then((answers) => {
			if (answers.type === "Update Service") {
				updateServiceRemoveImageAndContainer();
			}
		});
}
