// Defaults applied when a tenant's `settings` jsonb doesn't specify a key.
// Keeps the "what happens if unset" decision in one place rather than
// scattered across services.
module.exports = {
  allowFinishWithPendingBalance: true, // default ON — preserves existing behavior
};