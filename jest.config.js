/* eslint-disable no-undef */
// Thanks to this issue: https://github.com/dividab/tsconfig-paths/issues/97
// According to the commenter the file needs to be .js otherwise the file paths can't be remapped properly
const { pathsToModuleNameMapper } = require("./node_modules/ts-jest");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  setupFilesAfterEnv: ["./jest.setup.js"],
};
