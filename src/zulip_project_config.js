const secrets = require("./secrets.json");

module.exports = {
  username: process.env.USERNAME || secrets.username,
  password: process.env.PASSWORD || secrets.password,
  webhookSecret: process.env.WEBHOOK_SECRET || secrets.webhookSecret,
  claimCommands: ["claim"],
  addCollabPermission: "pull",
  abandonCommands: ["abandon", "unclaim", "abort"],
  labelCommands: ["label", "add"],
  removeCommands: ["remove", "unlabel"],
  sudoUsers: ["tabbott", "showell", "rishig"],
  selfLabelingOnly: false,
  commitReferenceEnabled: true,
  clearClosedIssues: true,
  checkMergeConflicts: true,
  repoEventsDelay: 3,
  escapeWIPString: "WIP",
  areaLabels: new Map([
    ["area: accessibility", "server-misc"],
    ["area: analytics", "server-analytics"],
    ["area: api", "server-api"],
    ["area: authentication", "server-authentication"],
    ["area: bots", "server-bots"],
    ["area: browser-support", "server-browser-support"],
    ["area: compose", "server-compose"],
    ["area: db cleanup", "server-misc"],
    ["area: dependencies", "server-dependencies"],
    ["area: documentation (api and integrations)", "server-api"],
    ["area: documentation (developer)", "server-development"],
    ["area: documentation (production)", "server-production"],
    ["area: documentation (user)", "server-user-docs"],
    ["area: emails", "server-development"],
    ["area: emoji", "server-emoji"],
    ["area: export", "server-misc"],
    ["area: hotkeys", "server-hotkeys"],
    ["area: i18n", "server-i18n"],
    ["area: in", "server-in"],
    ["area: integrations", "server-integrations"],
    ["area: left-sidebar", "server-sidebars"],
    ["area: markdown", "server-markdown"],
    ["area: message-editing", "server-message-view"],
    ["area: message view", "server-message-view"],
    ["area: misc", "server-misc"],
    ["area: notifications (messages)", "server-notifications"],
    ["area: notifications (other)", "server-notifications"],
    ["area: onboarding", "server-onboarding"],
    ["area: portico", "server-misc"],
    ["area: production installer", "server-production"],
    ["area: production", "server-production"],
    ["area: provision", "server-development"],
    ["area: real-time sync", "server-misc"],
    ["area: refactoring", "server-refactoring"],
    ["area: right-sidebar", "server-sidebars"],
    ["area: search", "server-search"],
    ["area: settings (admin/org)", "server-settings"],
    ["area: settings UI", "server-settings"],
    ["area: settings (user)", "server-settings"],
    ["area: stream settings", "server-streams"],
    ["area: testing-coverage", "server-testing"],
    ["area: testing-infrastructure", "server-testing"],
    ["area: tooling", "server-tooling"],
    ["area: topics", "server-misc"],
    ["area: uploads", "server-misc"],
    ["area: webpack", "server-development"]
  ]),
  activeRepos: [
    "zulip/zulip",
    "zulip/python-zulip-api",
    "zulip/zulip-electron",
    "zulip/zulipbot"
  ],
  checkInactivityTimeout: 12,
  inactivityTimeLimit: 10,
  autoAbandonTimeLimit: 4,
  travisLabel: "travis updates",
  inProgressLabel: "in progress",
  inactiveLabel: "inactive",
  reviewedLabel: "reviewed",
  needsReviewLabel: "needs review",
  priorityLabels: ["priority: blocker", "priority: high"],
  pullRequestsAssignee: false
};
