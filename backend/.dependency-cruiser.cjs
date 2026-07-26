// Automated check for the Clean Architecture dependency rule (Martin): domain must never depend
// on infrastructure or interfaces. Run with: npm run check-architecture
//
// If this reports a violation, it means something outside the domain leaked in — e.g. a domain
// file importing the Anthropic client or a Firestore type directly.

module.exports = {
  forbidden: [
    {
      name: "domain-must-not-depend-on-infrastructure",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/infrastructure" },
    },
    {
      name: "domain-must-not-depend-on-interfaces",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/interfaces" },
    },
    {
      name: "application-must-not-depend-on-infrastructure",
      severity: "error",
      from: { path: "^src/application" },
      to: { path: "^src/infrastructure" },
      comment: "application depends on infra only through ports (interfaces), never concrete adapters directly",
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
  },
};
