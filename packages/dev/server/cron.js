// this file is imported via next.config.js as runtime configuration on the server
// it creates a single cron database, ensuring that only one handler exists
// if a new handler is registered with the same name, it replaces the old handler
const cron = require("node-cron");
const crons = {};
const running = {};

const destroy = (name) => {
  if (crons[name]) {
    crons[name].stop();
  }
  delete running[name];
  delete crons[name];
};

module.exports = () => ({
  register: (name, timing, handler) => {
    destroy(name);
    crons[name] = cron.schedule(timing, () => {
      if (running[name]) return;
      running[name] = true;
      Promise.resolve(handler())
        .then(() => {
          running[name] = false;
        })
        .catch(() => {
          running[name] = false;
        });
    });
  },
  destroy: (name) => {
    destroy(name);
  },
});
