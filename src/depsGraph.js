const path = require("path");
const fs = require("fs");
const ast = require("abstract-syntax-tree");

const depsArray = [];

const depsGraph = (file) => {
  const fullPath = path.resolve("./demo", file);
  console.log(fullPath);
  // return early if exists
  if (!!depsArray.find((item) => item.name === fullPath)) return;

  // store path + parsed source as module
  console.log(fullPath);
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const source = ast.parse(fileContents);
    const module = {
      name: fullPath,
      source,
    };
      // Add module to deps array
  depsArray.push(module);

  // process deps
  source.body.map((current) => {
    if (current.type === "ImportDeclaration") {
      // process module for each dep.
      depsGraph(current.source.value);
    }
  });
  } catch (e) {
  console.error(e)
  }





  return depsArray;
};

module.exports = { depsGraph };
