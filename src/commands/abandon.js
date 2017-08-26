const nn = require("nevernull");

exports.run = (client, comment, issue, repository) => {
  const commenter = comment.user.login;
  const assignees = issue.assignees.map(assignee => assignee.login);
  if (!assignees.includes(commenter)) {
    return client.newComment(issue, repository, "**ERROR:** You have not claimed this issue to work on yet.");
  }
  client.abandonIssue(client, commenter, repository, issue);
};

exports.aliases = nn(require("../config.js")).issues.commands.assign.abandon.aliases() || [];
exports.args = false;
