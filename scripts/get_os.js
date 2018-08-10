#!/usr/bin/env node

const plat = (process.platform === 'win32') ? 'windows' : process.platform;

console.log(plat);
