module.exports = function exports(grunt) {
  'use strict';
  return {debug: {grunt: grunt, context: Object.keys(this)}};
};
