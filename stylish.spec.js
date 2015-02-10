'use strict';

var assert = require('chai').assert;
var expect = require('chai').expect;
var chalk = require('chalk');
var CLIEngine = require('eslint').CLIEngine;
var cli = new CLIEngine({
  envs: ['browser', 'node'],
  useEslintrc: false,
  rules: {
    semi: 2,
    indent: 4
  }
});
var report = cli.executeOnFiles(['./stylish.js']);
var ANSI_MAGENTA = '\x1b[35m';

describe('ESLint', function () {
  it('should be used', function () {

    expect(report.errorCount).to.be.gt(0);
  });

  it('should be custom styled', function () {
    var formatter = cli.getFormatter('./stylish.js');
    var res = formatter(report.results);

    expect(res).to.contain(ANSI_MAGENTA)
  });
});
