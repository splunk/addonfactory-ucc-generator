module.exports = function(grunt) {
  'use strict';
  return {
    development: {
      files: ['package/**/*.js', 'package/**/*.css', 'package/**/*.html',
        'package/**/*.py', 'package/**/*.xml'
      ],
      tasks: ['dev-watch']
    }
  };
};
