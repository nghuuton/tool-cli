const inquirer = require("inquirer");
const { dockerCommand } = require("docker-cli-js");
const shell = require("shelljs");

function updateServiceRemoveImageAndContainer() {
	dockerCommand("container ps -a").then(function (data) {
		const containers = data.containerList.map((item) => ({
			name: item.names,
			containerID: item["container id"],
			imageID: item.image,
			status: item.status,
		}));
		const containerNames = data.containerList.map((item) => item.names);

		const prompt = [
			{
				type: "list",
				name: "containerName",
				message: "Select service to update:",
				choices: containerNames,
			},
		];
		promtSelectContainer(prompt, containers);
	});
}

function promtSelectContainer(prompt, containers) {
	inquirer.prompt(prompt).then((answers) => {
		const containerExits = containers.find((item) => item.name === answers.containerName);
		if (containerExits) {
			removeContainer(
				answers.containerName,
				containerExits.containerID,
				containerExits.imageID,
				/Exited/.test(containerExits.status)
			);
		}
	});
}

async function removeContainer(nameService, containerID, imageID, isStop) {
	if (!isStop) {
		await dockerCommand(`stop ${containerID}`);
	}
	await dockerCommand(`rm ${containerID}`);
	await dockerCommand(`rmi ${imageID}`);

	await shell.exec(`mvn clean package -pl ${nameService} -am`);
	await shell.exec(`docker-compose up -d --force-recreate --no-deps --build ${nameService}`);
}

module.exports = {
	updateServiceRemoveImageAndContainer,
};
