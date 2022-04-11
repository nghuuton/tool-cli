const inquirer = require("inquirer");
const fs = require("fs");
const shell = require("shelljs");
const { settingHA } = require("../haproxy/stdSystem");

function settingVituarlIP(hasSettingHA) {
	inquirer
		.prompt([
			{
				type: "list",
				name: "os",
				message: "Select OS:",
				choices: ["Ubuntu", "Centos"],
			},
		])
		.then((answers) => {
			stdInput(answers.os, hasSettingHA);
		});
}

async function stdInput(os, hasSettingHA) {
	settingVituarlIPInfo(os, hasSettingHA);
}

async function settingVituarlIPInfo(os, hasSettingHA) {
	if (os === "Ubuntu") {
		await shell.exec(`apt install haproxy -y`);
	}
	if (os === "Centos") {
		await shell.exec(`yum install -y keepalived`);
		await shell.exec(`systemctl enable --now keepalived`);
	}
	inquirer
		.prompt([
			{ type: "input", message: "state <BACKUP | MASTER>", name: "state" },
			{ type: "input", message: "interface <IFCONFIG | ens192>", name: "interface" },
			{ type: "input", message: "priority", name: "priority" },
			{ type: "input", message: "virtual_ipaddress", name: "virtual_ipaddress" },
		])
		.then((answers) => {
			writeFile(answers, hasSettingHA);
		});
}

function writeFile(answers, hasSettingHA) {
	const path = __dirname + "/keepalived.backup.conf";
	const pathNew = __dirname + "/keepalived.conf";
	fs.readFile(path, "utf8", (err, data) => {
		const resultState = data.replace(/<state>/g, answers.state);
		const resultInterface = resultState.replace(/<interface>/g, answers.interface);
		const resultPriority = resultInterface.replace(/<priority>/g, answers.priority);
		const result = resultPriority.replace(/<virtual_ipaddress>/g, answers.virtual_ipaddress);
		fs.writeFile(pathNew, result, async (err) => {
			if (err) {
				console.log(err);
			} else {
				await shell.exec(`mv ${pathNew} /etc/keepalived/keepalived.cfg`);
				await shell.exec(`systemctl start keepalived`);
				await shell.exec(`systemctl status keepalived`);
				if (hasSettingHA) {
					settingHA();
				}
			}
		});
	});
}

module.exports = {
	settingVituarlIP,
};
