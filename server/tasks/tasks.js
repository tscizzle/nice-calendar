const _ = require('lodash');

const generateOccurrences = require('./generate-occurrences');

const SECOND = 1000;

const tasks = [
  { key: 'generate-occurrences', func: generateOccurrences, ms: 10 * SECOND },
];

const taskFuncWrapper = ({ key, func }) => {
  return () => {
    try {
      func();
    } catch (err) {
      console.log(`Error in ${key}: ${err.message}`);
    }
  };
};

const kickOffTasks = () => {
  _.each(tasks, ({ key, func, ms }) => {
    const wrappedFunc = taskFuncWrapper({ key, func });
    const delay = ms || 1000;
    wrappedFunc();
    setInterval(wrappedFunc, delay);
  });
};

module.exports = kickOffTasks;
