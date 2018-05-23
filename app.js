const fs = require('fs');
const path = require('path');

/**
 * Recursively walk through a directory structure and call the given callback
 * function for each file that has the given extension.
 *
 * @param {string} directory the directory to start from
 * @param {string} extension which file type to apply the callback to
 * @param {function} callback a function taking the file path as argument and
 * returning some result structure
 * @param done a function taking an potential error object and the results as
 * arguments
 */
const walk = (directory, extension, callback, done) => {
  let results = [];

  fs.readdir(directory, (err, list) => {
    if (err) {
      return done(err);
    }

    let pending = list.length;
    if (!pending) {
      return done(null, results);
    }

    list.forEach(file => {
      file = path.resolve(directory, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, extension, callback, (err, res) => {
            results = results.concat(res);

            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          if (file.substr(-1 * extension.length) === extension) {
            const callbackResult = callback(file);

            if (callbackResult !== null) {
              results.push(callbackResult);
            }
          }

          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

/**
 * Replaces the value of all configuration parameters in the given file, if the
 * configuration parameter is given as key in the configuration object.
 *
 * @param {string} file absolute path to the file
 * @param {object} configuration object with a configuration parameter -> value mapping
 *
 * @returns {{processedFile: string, numberOfChanges: number}}
 */
const replaceConfigurationValuesInFile = (file, configuration) => {
  let changeCounter = 0;

  const modifiedFileContent =
    fs.readFileSync(file, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map(line => {
        if (
          line.startsWith('$') &&
          line.indexOf('=') > -1 &&
          configuration.hasOwnProperty(line.split('=')[0])
        ) {
          changeCounter++;
          const parameterName = line.split('=')[0];
          return parameterName + '=' + configuration[parameterName];
        }
        return line;
      })
      .join('\n');

  fs.writeFile(file, modifiedFileContent, {}, err => {
    if (err) {
      console.error('Could not write file:', err);
    }
  });

  return {
    processedFile: file,
    numberOfChanges: changeCounter
  };
};

// read and parse the configuration file
if (!fs.existsSync('./parser.config')) {
  console.error('The configuration file cannot be found. Please make sure, ' +
    'that a file named \'parser.config\' is present in the same directory ' +
    'where this script is started from.')
}

const configuration = fs.readFileSync(path.join('.', 'parser.config'), 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map(line => {
    if (line.startsWith('$') && line.indexOf('=') > -1) {
      const parameterArray = line.split('=');
      return {
        key: parameterArray[0],
        value: parameterArray[1]
      };
    }
  })
  .filter(Boolean)
  .reduce((aggregator, parameter) => {
    aggregator[parameter.key] = parameter.value;
    return aggregator;
  }, {});

// print out statistics
console.log('Number of configuration parameters:', Object.keys(configuration).length);
console.log('');

// start the recursive processing of impex files and print out the result
walk('.', '.impex', file => {
  return replaceConfigurationValuesInFile(file, configuration)
}, (error, results) => {
  if (error) {
    console.error('A problem occurred:', error);
    return;
  }

  console.log('Results\n------------------------------------');
  console.log('Number of matching files:', results.length);
  console.log('Number of modified files:', results.filter(result => result.numberOfChanges > 0).length);
});
