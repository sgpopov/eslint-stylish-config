'use strict';

var CLIEngine = require('eslint').CLIEngine;
var assert = require('chai').assert;
var expect = require('chai').expect;
var chalk = require('chalk');

describe('ESLint', function () {
  var report, cli;

  beforeEach(function () {
    cli = new CLIEngine({
      envs: ['browser', 'node'],
      useEslintrc: false,
      rules: {
        semi: 2,
        indent: 4
      }
    });
    report = cli.executeOnFiles(['./stylish.js']);
  });

  it('should be used', function () {
    expect(report.errorCount).to.be.gt(0);
  });

  it('should be custom styled', function () {
    var formatter = cli.getFormatter('./stylish.js');
    var res = formatter(report.results);
    var ANSI_MAGENTA = '\x1b[35m';

    expect(res).to.contain(ANSI_MAGENTA);
  });

  it('position format should be changed', function () {
    var formatter = cli.getFormatter('./stylish.js');
    var res = formatter(report.results);

    expect(res).to.contain('line 3  col 21');
  });
});
