const inquirer = require("inquirer");
const fs = require("fs");
const shell = require("shelljs");
const HA_FE = [];

function settingHA() {
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
			stdInput(answers.os);
		});
}

async function stdInput(os) {
	settingRedirectFE(os);
}

async function settingRedirectFE(os) {
	if (os === "Ubuntu") {
		await shell.exec(`apt install haproxy -y`);
	}
	if (os === "Centos") {
		await shell.exec(`yum install -y haproxy`);
	}
	inquirer.prompt([{ type: "input", message: "Number FE:", name: "number" }]).then(async (answers) => {
		if (/[1-9]/.test(answers.number)) {
			for (let index = 0; index <= Number(answers.number) - 1; index++) {
				await inquirer
					.prompt([
						{ type: "input", message: "frontend :", name: "name" },
						{ type: "input", message: "port:", name: "port" },
						{ type: "input", message: "default_backend:", name: "default_backend" },
						{ type: "input", message: "number server:", name: "numberService" },
					])
					.then(async (answers) => {
						if (answers.numberService) {
							const result = await settingRedirectBE(answers.numberService);
							HA_FE.push({
								name: answers.name,
								port: answers.port,
								default_backend: answers.default_backend,
								backendName: answers.backendName,
								server: result,
							});
						}
					});
			}
			const resultFE = HA_FE.map(
				(item) => `
frontend ${item.name} *:${item.port}
	default_backend ${item.default_backend}`
			).join("");
			console.log(resultFE);

			const resultBE = HA_FE.map(
				(item) => `
backend ${item.default_backend}
	balance roundrobin${mapServer(item.server)}`
			).join("");
			console.log(resultBE);
			writeFile(resultFE, resultBE);
		} else {
			console.log("Input must be a number.");
			settingRedirectFE();
		}
	});
}

function mapServer(servers) {
	return servers
		.map(
			(item) => `
	server ${item.server} ${item.ip}:${item.port} check`
		)
		.join("");
}

async function settingRedirectBE(number) {
	const HA_BE = [];
	if (/[1-9]/.test(number)) {
		for (let index = 0; index <= Number(number) - 1; index++) {
			await inquirer
				.prompt([
					{ type: "input", message: `serve name ${index + 1} :`, name: "server" },
					{ type: "input", message: "ip :", name: "ip" },
					{ type: "input", message: "port :", name: "port" },
				])
				.then((answers) => {
					HA_BE.push(answers);
				});
		}
		return HA_BE;
	} else {
		console.log("Input must be a number.");
		settingRedirectBE();
	}
}

function writeFile(FE, BE) {
	if (FE && BE) {
		const path = __dirname + "/template/haproxy.backup.cfg";
		const newPath = __dirname + "/template/haproxy.cfg";
		fs.readFile(path, "utf-8", (err, buff) => {
			fs.writeFile(newPath, buff + FE + "\n" + BE, async (err) => {
				if (err) {
					console.log(err);
				} else {
					await shell.exec(`mv ${newPath} /etc/haproxy/haproxy.cfg`);
					await shell.exec(`setsebool -P haproxy_connect_any=1`);
					await shell.exec(`systemctl start haproxy`);
					await shell.exec(`systemctl status haproxy`);
				}
			});
		});
	}
}

module.exports = {
	stdInput,
	settingHA,
};
