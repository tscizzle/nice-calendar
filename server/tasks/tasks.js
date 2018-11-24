const _ = require('lodash');

const generateOccurrences = require('./generate-occurrences');

const SECOND = 1000;

const tasks = [
  { key: 'generate-occurrences', func: generateOccurrences, ms: 5 * SECOND },
];

const taskFuncWrapper = ({ key, func, argsObj }) => {
  return () => {
    try {
      func(argsObj);
    } catch (err) {
      console.error(`Error in ${key}: ${err.message}`);
    }
  };
};

const kickOffTasks = ({ io }) => {
  const argsObj = { io };
  _.each(tasks, ({ key, func, ms }) => {
    const wrappedFunc = taskFuncWrapper({ key, func, argsObj });
    const delay = ms || 1000;
    wrappedFunc();
    setInterval(wrappedFunc, delay);
  });
};

module.exports = kickOffTasks;
