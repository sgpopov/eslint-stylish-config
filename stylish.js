'use strict';

var
  chalk = require('chalk'),
  table = require('text-table'),
  extend = require('util-extend'),
  fs = require('fs'),
  path = require('path');

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
  var
    output = '\n',
    summary = '',
    total = 0,
    errors = 0,
    warnings = 0,
    colors = {};

  if (fs.existsSync(path.resolve('.stylishcolors'))) {
    var rc = fs.readFileSync('.stylishcolors', { encoding: 'utf8' });
    colors = JSON.parse(rc);
  }

  colors = extend({
    'path': 'gray',
    'position': 'gray',
    'warning': 'yellow',
    'error': 'red',
    'description': 'gray',
    'rule': 'gray',
    'summary': 'yellow',
    'noproblem': 'green'
  }, colors);

  results.forEach(function (result) {
    var messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    total += messages.length;
    output += chalk.underline(chalk[colors.path](result.filePath)) + '\n';
    output += table(
      messages.map(function (message) {
        var messageType;

        if (message.fatal || message.severity === 2) {
          messageType = chalk[colors.error]('error');
          errors++;
        }
        else {
          messageType = chalk[colors.warning]('warning');
          warnings++;
        }

        return [
          '',
          message.line || 0,
          message.column || 0,
          messageType,
          chalk[colors.description](message.message.replace(/\.$/, '')),
          chalk[colors.rule](message.ruleId || '')
        ];
      }),
      {
        align: ['', 'r', 'l'],
        stringLength: function (str) {
          return chalk.stripColor(str).length;
        }
      }
    )
    .split('\n').map(function (el) {
      return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
        return chalk[colors.position](p1 + ':' + p2);
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
      output += chalk[colors.error].bold(summary);
    }
    else {
      output += chalk[colors.summary].bold(summary);
    }
  }

  return total > 0 ? output : chalk[colors.noproblem].bold('\u2714 No problems');
};
