exports.run = async function(client, comment, issue, repository) {
  const commenter = comment.user.login;
  const repoName = repository.name;
  const repoOwner = repository.owner.login;

  if (issue.assignees.find(assignee => assignee.login === commenter)) {
    const error = "**ERROR:** You have already claimed this issue.";
    return client.newComment(issue, repository, error);
  }

  try {
    await client.repos.checkCollaborator({
      owner: repoOwner, repo: repoName, username: commenter
    });
    exports.claimIssue(client, comment, issue, repository);
  } catch (response) {
    if (response.code !== 404) {
      const error = "**ERROR:** Unexpected response from GitHub API.";
      return client.newComment(issue, repository, error);
    }

    if (!client.cfg.addCollabPermission) {
      const error = "**ERROR:** `addCollabPermission` wasn't configured.";
      return client.newComment(issue, repository, error);
    }

    const newComment = client.templates.get("newContributor")
      .replace("[commenter]", commenter)
      .replace("[repoName]", repoName).replace("[repoOwner]", repoOwner);

    client.newComment(issue, repository, newComment);

    if (client.invites.get(commenter)) return;

    const perm = client.cfg.addCollabPermission;

    client.repos.addCollaborator({
      owner: repoOwner, repo: repoName, username: commenter, permission: perm
    });

    client.invites.set(commenter, `${repoOwner}/${repoName}#${issue.number}`);
  }
};

exports.claimIssue = async function(client, comment, issue, repository) {
  const commenter = comment.user.login;
  const number = issue.number;
  const repoName = repository.name;
  const repoOwner = repository.owner.login;

  const response = await client.issues.addAssigneesToIssue({
    owner: repoOwner, repo: repoName, number: number, assignees: [commenter]
  });

  if (response.data.assignees.length) return;

  const error = "**ERROR:** Issue claiming failed (no assignee was added).";
  client.newComment(issue, repository, error);
};

exports.aliases = require("../config.js").claimCommands;
exports.args = false;
