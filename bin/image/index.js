inquirer
	.prompt([
		{
			type: "list",
			name: "imageID",
			message: "Chọn Image Cần Xóa:",
			choices: ["Container", "Image"],
		},
	])
	.then((answers) => {
		if (answers.type === "Image") {
			dockerCommand("images").then(function (data) {});
		}
	});
