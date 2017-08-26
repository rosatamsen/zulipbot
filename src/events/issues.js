const recentlyClosed = new Map();

exports.run = (client, payload) => {
  const action = payload.action;
  const issue = payload.issue;
  const repository = payload.repository;
  const payloadBody = payload.comment || issue;
  if (client.cfg.inactivity.issues.inProgressLabel()) {
    exports.cleanInProgress(client, payload);
  }
  if (action === "labeled" && client.cfg.issues.areaLabelSystem()) {
    return client.automations.get("areaLabel").run(client, issue, repository, payload.label);
  } else if (action === "closed" && issue.assignees.length && client.cfg.inactivity.issues.clearClosed()) {
    recentlyClosed.set(issue.id, issue);
    return setTimeout(() => {
      if (recentlyClosed.has(issue.id)) {
        const assignees = issue.assignees.map(a => a.login);
        client.abandonIssue(client, assignees, repository, issue);
      }
      recentlyClosed.delete(issue.id);
    }, client.cfg.eventsDelay() * 60000);
  } else if (action === "reopened" && recentlyClosed.has(issue.id)) {
    return recentlyClosed.delete(issue.id);
  } else if (action === "opened" || action === "created") {
    exports.parseCommands(client, payloadBody, issue, repository);
  }
};

exports.parseCommands = (client, payloadBody, issue, repository) => {
  const commenter = payloadBody.user.login;
  const body = payloadBody.body;
  const issueCreator = issue.user.login;
  if (commenter === client.cfg.username() || !body) return;
  const parseCommands = body.match(new RegExp("@" + client.cfg.username() + "\\s(\\w*)", "g"));
  if (!parseCommands) return;
  parseCommands.forEach((command) => {
    if (body.includes(`\`${command}\``) || body.includes(`\`\`\`\r\n${command}\r\n\`\`\``)) return;
    let cmdFile = client.commands.get(command.split(" ")[1]);
    if (cmdFile && !cmdFile.args) return cmdFile.run(client, payloadBody, issue, repository);
    else if (!cmdFile || !body.match(/".*?"/g)) return;
    let self = typeof client.cfg.label.selfLabelingOnly();
    if (self === "boolean") self = client.cfg.label.selfLabelingOnly();
    else if (self === "object") self = client.cfg.label.selfLabelingOnly.sudoUsers().includes(commenter);
    else if (self === "undefined") self = undefined;
    const permissionsCheck = self ? commenter !== issueCreator : false;
    if (permissionsCheck) {
      const c = `**ERROR:** You do not have the permissions to use the ${command.split(" ")[1]} command.`;
      return client.newComment(issue, repository, c);
    }
    const splitBody = body.split(`@${client.cfg.username()}`).filter((splitString) => {
      return splitString.includes(` ${command.split(" ")[1]} "`);
    }).join(" ");
    cmdFile.run(client, splitBody, issue, repository);
  });
};

exports.cleanInProgress = (client, payload) => {
  const action = payload.action;
  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const number = payload.issue.number;
  const inProgress = client.cfg.inactivity.issues.inProgressLabel();
  const labeled = payload.issue.labels.find(label => label.name === inProgress);
  if (action === "assigned" && !labeled) {
    client.issues.addLabels({
      owner: repoOwner, repo: repoName, number: number, labels: [inProgress]
    });
  } else if (action === "unassigned" && !payload.issue.assignees.length && labeled) {
    client.issues.removeLabel({
      owner: repoOwner, repo: repoName, number: number, name: inProgress
    });
  } else if (payload.issue.assignees.length && !labeled) {
    client.issues.getComments({
      owner: repoOwner, repo: repoName, number: number, per_page: 100
    }).then((comments) => {
      const comment = "**ERROR:** This issue has been assigned but is not labeled as being in progress.";
      const c = comments.data.slice(-1).pop();
      const warning = c.body.includes(comment) && c.user.login === client.cfg.username();
      if (!warning) client.newComment(payload.issue, payload.repository, comment);
    });
  }
};

exports.events = ["issues", "issue_comment"];
