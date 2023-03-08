const plugins = [
  [
    "babel-plugin-import",
    {
      libraryName: "@mui/material",
      libraryDirectory: "",
      camel2DashComponentName: false,
    },
    "core",
  ],
  [
    "babel-plugin-import",
    {
      libraryName: "@mui/icons-material",
      libraryDirectory: "",
      camel2DashComponentName: false,
    },
    "icons",
  ],
  ["babel-plugin-direct-import", { modules: ["@mui/material", "@mui/icons-material"] }],
];

const presets = [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"];

module.exports = { plugins, presets };
