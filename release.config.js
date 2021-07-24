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
      "message": `chore(release): \${nextRelease.version}\\n\\n\${nextRelease.notes}`
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
        "baseImageName": "docker",
        "registries": [
          {
            "url": "docker.io",
            "imageName": `docker.io/${process.env.REPO_NAME}`,
            "user": "DOCKER_REGISTRY_USER",
            "password": "DOCKER_REGISTRY_PASSWORD"
          },
          {
            "url": "ghcr.io",
            "imageName": `ghcr.io/${process.env.GITHUB_USERNAME}/${process.env.REPO_NAME}`,
            "user": "GITHUB_USER",
            "password": "GITHUB_TOKEN"
          }
        ]
      }
    ]
  ]
}
