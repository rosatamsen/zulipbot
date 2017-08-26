exports.run = (client, payload) => {
  const action = payload.action;
  const pullRequest = payload.pull_request;
  const number = pullRequest.number;
  const repository = payload.repository;
  const repoName = repository.name;
  const repoOwner = repository.owner.login;
  const review = payload.review;
  if (client.cfg.inactivity.pullRequests()) {
    exports.managePRLabels(client, action, pullRequest, review, repository);
  }
  if (action === "submitted" && client.cfg.inactivity.pullRequests.reviewed.assignee()) {
    client.issues.addAssigneesToIssue({
      owner: repoOwner, repo: repoName, number: number, assignees: [review.user.login]
    });
  } else if (action === "labeled" && client.cfg.issues.areaLabelSystem()) {
    client.issues.get({
      owner: repoOwner, repo: repoName, number: number
    }).then((response) => {
      client.automations.get("areaLabel").run(client, response.data, repository, payload.label);
    });
  } else if (!client.cfg.issues.areaLabelSystem() || !client.cfg.issues.commitReferences()) {
    return;
  }
  if (action === "opened" && !pullRequest.title.includes(client.cfg.pullRequests.escapeWIPString())) {
    client.automations.get("issueReferenced").run(client, pullRequest, repository, true);
  } else if (action === "synchronize") {
    client.automations.get("issueReferenced").run(client, pullRequest, repository, false);
    if (client.cfg.pullRequests.checkMergeConflicts()) {
      client.automations.get("checkMergeConflicts").check(client, number, repoName, repoOwner);
    }
  }
};

exports.managePRLabels = (client, action, pullRequest, review, repository) => {
  const number = pullRequest.number;
  const repoName = repository.name;
  const repoOwner = repository.owner.login;
  client.issues.getIssueLabels({
    owner: repoOwner, repo: repoName, number: number
  }).then((response) => {
    let labels = response.data.map(label => label.name);
    const reviewedLabel = client.cfg.inactivity.pullRequests.reviewed.label();
    const needsReviewLabel = client.cfg.inactivity.pullRequests.needsReview.label();
    const n = labels.includes(needsReviewLabel);
    const r = labels.includes(reviewedLabel);
    if (action === "opened" || action === "reopened") {
      labels.push(needsReviewLabel);
    } else if (action === "submitted" && n && review.user.login !== pullRequest.user.login) {
      labels[labels.indexOf(needsReviewLabel)] = reviewedLabel;
    } else if (action === "synchronize" && r) {
      labels[labels.indexOf(reviewedLabel)] = needsReviewLabel;
    } else if (action === "closed" && r) {
      labels.splice(labels.indexOf(reviewedLabel), 1);
    } else if (action === "closed" && n) {
      labels.splice(labels.indexOf(needsReviewLabel), 1);
    } else {
      return;
    }
    client.issues.replaceAllLabels({
      owner: repoOwner, repo: repoName, number: number, labels: labels
    });
  });
};

exports.events = ["pull_request", "pull_request_review"];
