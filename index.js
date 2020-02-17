#!/usr/bin/env node
const options = { await: true };
require = require('esm')(module, options); // eslint-disable-line no-global-assign
module.exports = require('./main.js');
