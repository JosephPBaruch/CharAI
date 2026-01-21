module.exports = {
  default: {
    features: ["./CharAI.feature"],
    require: ["support/**/*.ts", "features/step_definitions/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress", "html:reports/cucumber-report.html"],
    formatOptions: {
      snippetInterface: "async-await",
    },
  },
};
