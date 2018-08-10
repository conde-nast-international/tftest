#!/usr/bin/env node
const Plan = require('../lib/plan.js');

const plan = new Plan(process.argv[2]);
console.log(JSON.stringify(plan.plan, null, 2));
