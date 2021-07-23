const releaseRules = [
  {type: "build", release: "minor"},
  {type: "ci", release: "patch"},
  {type: "docs", release: "minor"},
  {type: "style", release: "patch"},
  {type: "refactor", release: "patch"},
  {type: "test", release: "patch"},
  {type: "revert", release: "patch"},
  {type: "chore", release: false},
];

module.exports = releaseRules;
