const fs = require("fs");

// 读取文件内容
fs.readFile("generateStandardName/config.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // 按行拆分文件内容
  const lines = data.split("\n");

  let results = [];
  let containsSet = new Set();
  // 遍历每一行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (containsSet.has(line)) {
      continue;
    } else {
      containsSet.add(line);
    }

    const words = line.split(":");
    if (words.length === 2) {
      results.push(`
		{
      key: /\\b${words[0]}\\b/gi,
      value: "${words[1]}",
    }
		`);
    } else {
      results.push(`
		{
      key: /\\b${line}\\b/gi,
      value: "${line}",
    }
		`);
    }
  }

  let resultTemp = `
	const engList = [
  ${results.join(",")}
];
export { engList };`;
  fs.writeFile(
    "src/engList.ts",

    resultTemp,
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }

      console.log("File has been written successfully.");
    }
  );
});
