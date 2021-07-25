module.exports = {
  "branches": ["main"],
  "plugins": [
    ["@semantic-release/commit-analyzer", {
      "preset": "conventionalcommits",
      "releaseRules": "./src/release-rules.js"
    }],
    ["@semantic-release/release-notes-generator", {
      "preset": "conventionalcommits",
      "presetConfig": {
        types: [
          {type: 'feat', section: 'Features'},
          {type: 'feature', section: 'Features'},
          {type: 'fix', section: 'Bug Fixes'},
          {type: 'perf', section: 'Performance Improvements'},
          {type: 'revert', section: 'Reverts'},
          {type: 'docs', section: 'Documentation'},
          {type: 'style', section: 'Styles'},
          {type: 'refactor', section: 'Code Refactoring'},
          {type: 'test', section: 'Tests'},
          {type: 'build', section: 'Build System'},
          {type: 'ci', section: 'Continuous Integration'}
        ]
      }
    }],
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "tarballDir": "pack"
    }],
    ["@semantic-release/git", {
      "assets": [
        "CHANGELOG.md",
        "package.json",
        "npm-shrinkwrap.json"
      ],
      "message": `chore(release): \${nextRelease.version}\n\n\${nextRelease.notes}`
    }],
    ["@semantic-release/github", {
      "assets": [
        {
          "path": "pack/*.tgz",
          "label": "Static distribution"
        }
      ]
    }],
    [
      "@eclass/semantic-release-docker",
      {
        "baseImageName": `${process.env.GITHUB_REPOSITORY}`,
        "registries": [
          {
            "url": "ghcr.io",
            "imageName": `ghcr.io/${process.env.REPO_OWNER}/${process.env.REPO_NAME}`,
            "user": "REPO_OWNER",
            "password": "GITHUB_TOKEN"
          }
        ]
      }
    ]
  ]
}
