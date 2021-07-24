module.exports = {
  "branches": ["main"],
  "plugins": [
    ["@semantic-release/commit-analyzer", {
      "preset": "conventionalcommits",
      "releaseRules": "./src/release-rules.js"
    }],
    ["@semantic-release/release-notes-generator", {
      "preset": "conventionalcommits"
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
        "baseImageName": `${process.env.DOCKER_USER}/${process.env.DOCKER_IMAGE}`,
        "registries": [
          {
            "url": "ghcr.io",
            "imageName": `ghcr.io/${process.env.REPO_OWNER}/${process.env.REPO_NAME}`,
            "user": "REPO_OWNER",
            "password": "GITHUB_TOKEN"
          },
          {
            "url": "cloud.canister.io:5000",
            "imageName": `${process.env.CANISTER_USER}/${process.env.REPO_NAME}`,
            "user": `deploy+${process.env.CANISTER_USER}`,
            "password": "CANISTER_PASSWORD"
          }
        ]
      }
    ]
  ]
}
