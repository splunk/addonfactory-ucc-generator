#!/bin/env node

var fs = require('fs')
var path = require('path')

var buildNum = process.env.BUILDNUMBER
var gitBranch = process.env.GITBRANCH

if (!buildNum || !gitBranch) {
  throw new Error('Could not get build number or git branch from bamboo env');
}

var ROOT = path.join(__dirname, '..');

fs.readFile(path.join(ROOT, 'package.json'), 'utf8', function(err, data) {
  if (err) {
    throw new Error('Could not find package.json, is it a NodeJS project?');
  }

  var meta = JSON.parse(data.toString());
  var newVersion = meta.version + '-' + gitBranch + '.' + buildNum;
  meta.version = newVersion;

  fs.writeFile(path.join(ROOT, 'package.json'), JSON.stringify(meta), function (err) {
    if (err) {
      throw new Error('update version failed ', err);
    }

    console.log('version updated');
  })
})
