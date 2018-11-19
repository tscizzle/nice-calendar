const sendgrid = require('sendgrid');

const api = sendgrid(process.env.SENDGRID_API_KEY);

module.exports = api;
