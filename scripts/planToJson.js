#!/usr/bin/env node
const Plan = require('../lib/plan.js');

console.log(JSON.stringify((new Plan(process.argv[2])).plan, null, 2));
