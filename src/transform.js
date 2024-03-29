const ast = require("abstract-syntax-tree");
const path = require("path");

/*
 * Template to be used for each module.
 * module: load exports onto
 * _ourRequire: import system
 */
const buildModuleTemplateString = (moduleCode, index) => `
/* index/id ${index} */
(function(module, _ourRequire) {
  "use strict";
  ${moduleCode}
})
`;

// Our main template containing the bundles runtime.
const buildRuntimeTemplateString = (allModules) => `
(function(modules) {
  // Define runtime.
  const installedModules = {}; // id/index + exports
  function _our_require_(moduleId) {
    // Module in cache?
    if (installedModules[moduleId]) {
        // return function exported in module
       return installedModules[moduleId].exports
    }
    // Build module, store exports against this ref.
    const module = {
       i: moduleId,
       exports: {},
    }
    // Execute module template function. Add exports to ref.
    modules[moduleId](module, _our_require_);
    // cache exports of module
    const exports = module.exports;
    installedModules[moduleId] = exports
    // Return exports of module
    return exports;
  }
  // Load entry module via id + return exports
  return _our_require_(0);
})
/* Dep tree */
([
 ${allModules}
]);
`;


const getImport = (item, allDeps) => {
  // get variable we import onto
  // console.log(item.declarations[0].init.arguments[0].value);
  const importFunctionName = item.declarations[0].id.name;
  // console.log( 'allDeps',item.declarations[0].init.arguments[0])
  // get files full path and find index in deps array.
  const fullFile = path.resolve("./demo/", item.declarations[0].init.arguments[0].value);
  return {
    type: "VariableDeclaration",
    kind: "const",
    declarations: [
      {
        type: "VariableDeclarator",
        init: {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "_ourRequire",
          },
          arguments: [
            {
              type: "Literal",
              value: itemId,
            },
          ],
        },
        id: {
          type: "Identifier",
          name: importFunctionName,
        },
      },
    ],
  };
};


const getExport = (item) => {
  // get export functions name
  const moduleName = item.specifiers[0].exported.name;
  return {
    type: "ExpressionStatement",
    expression: {
      type: "AssignmentExpression",
      left: {
        type: "MemberExpression",
        object: { type: "Identifier", name: "module" },
        computed: false,
        property: { type: "Identifier", name: "exports" },
      },
      operator: "=",
      right: { type: "Identifier", name: moduleName },
    },
  };
};

/*
 * Take depsArray and return bundle string
 */
const transform = (depsArray) => {
  const updatedModules = depsArray.reduce((acc, dependency, index) => {
    const updatedAst = dependency.source.body.map((item) => {
      if (item.type === "VariableDeclaration") {
        // replace module imports with ours
        item = getImport(item, depsArray);
      }
      if (item.type === "ExpressionStatement") {
        // replaces function name with real exported function
        item = getExport(item);
      }
      return item;
    });
    dependency.source.body = updatedAst;

    // Turn AST back into string
    const updatedSource = ast.generate(dependency.source);

    // Bind module source to module template
    const updatedTemplate = buildModuleTemplateString(updatedSource, index);
    acc.push(updatedTemplate);
    return acc;
  }, []);

  // Add all modules to bundle
  const bundleString = buildRuntimeTemplateString(updatedModules.join(","));

  return bundleString;
};

module.exports = {
  transform
}
