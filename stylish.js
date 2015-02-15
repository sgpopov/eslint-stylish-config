'use strict';

var extend = require('util-extend');
var table = require('text-table');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
  * Given a word and a count, append an s if count is not one.
  * @param {string} word A word in its singular form.
  * @param {int} count A number controlling whether word should be pluralized.
  * @returns {string} The original word with an s on the end if count is not one.
  */
function pluralize(word, count) {
  return (count === 1 ? word : word + 's');
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function (results) {
  var output = '\n';
  var warnings = 0;
  var summary = '';
  var settings = {};
  var errors = 0;
  var total = 0;

  if (fs.existsSync(path.resolve('.stylishconfig'))) {
    var rc = fs.readFileSync('.stylishconfig', { encoding: 'utf8' });
    settings = JSON.parse(rc);
  }

  settings = extend({
    'positionFormat': 'colon',
    'colors': {
      'path': 'gray',
      'position': 'gray',
      'warning': 'yellow',
      'error': 'red',
      'description': 'gray',
      'rule': 'gray',
      'summary': 'yellow',
      'noproblem': 'green'
    }
  }, settings);

  results.forEach(function (result) {
    var messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    total += messages.length;
    output += chalk.underline(chalk[settings.colors.path](result.filePath)) + '\n';
    output += table(
      messages.map(function (message) {
        var messageType;

        if (message.fatal || message.severity === 2) {
          messageType = chalk[settings.colors.error]('error');
          errors += 1;
        }
        else {
          messageType = chalk[settings.colors.warning]('warning');
          warnings += 1;
        }

        return [
          '',
          message.line || 0,
          message.column || 0,
          messageType,
          chalk[settings.colors.description](message.message.replace(/\.$/, '')),
          chalk[settings.colors.rule](message.ruleId || '')
        ];
      }),
      {
        align: ['', 'r', 'l'],
        stringLength: function (str) {
          return chalk.stripColor(str).length;
        }
      }
    )
    .split('\n')
    .map(function (el) {
      return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
        if (settings.positionFormat === 'line-col-comma') {
          return chalk[settings.colors.position]('line ' + p1 + ', col ' + p2);
        }
        else if (settings.positionFormat === 'line-col-space') {
          return chalk[settings.colors.position]('line ' + p1 + '  col ' + p2);
        }

        return chalk[settings.colors.position](p1 + ':' + p2);
      });
    })
    .join('\n') + '\n\n';
  });

  if (total > 0) {
    summary = [
      '\u2716 ', total, pluralize(' problem', total),
      ' (', errors, pluralize(' error', errors), ', ',
        warnings, pluralize(' warning', warnings), ')\n'
    ].join('');

    if (errors > 0) {
      output += chalk[settings.colors.error].bold(summary);
    }
    else {
      output += chalk[settings.colors.summary].bold(summary);
    }
  }

  return total > 0 ? output : chalk[settings.colors.noproblem].bold('\u2714 No problems');
};
