exports.run = (client, payload) => {
  const repository = payload.repository;
  if (payload.ref !== "refs/heads/master" || !client.cfg.pullRequests.checkMergeConflicts) return;
  setTimeout(() => {
    client.automations.get("checkMergeConflicts").run(client, repository);
  }, client.cfg.eventsDelay * 60000);
};

exports.events = ["push"];
