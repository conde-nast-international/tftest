#!/usr/bin/env node
const { getTfJson } = require('../lib/generic.js');
getTfJson(process.argv[2]);