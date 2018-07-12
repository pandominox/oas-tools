/*!
OAS-tools module 0.0.0, built on: 2017-03-30
Copyright (C) 2017 Ignacio Peluaga Lozada (ISA Group)
https://github.com/ignpelloz
https://github.com/isa-group/project-oas-tools

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

'use strict';

/**
 * Module dependecies.
 * */
var jsyaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var winston = require('winston');


/*
 * Export functions and Objects
 */
var config = {
  setConfigurations: _setConfigurations // eslint-disable-line
};

module.exports = config;

module.exports.setProperty = function setProperty(propertyName, newValue) { 
  this[propertyName] = newValue;
};


/**
 * Implement the functions
 */
function _setConfigurations(options, encoding) { // eslint-disable-line

  if (!options) {
    throw new Error("Configurations parameter is required");
  } else if (typeof options == 'string') {
    try {
      var configString = fs.readFileSync(options, encoding); // eslint-disable-line
      var newConfigurations = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];
    } catch (err) {
      console.log("The specified configuration file wasn't found at " + options + ".  Default configurations will be set"); // eslint-disable-line
      config.setConfigurations(path.join(__dirname, 'configs.yaml'), 'utf8');
    }
  } else {
    newConfigurations = options;
  }

  if (newConfigurations.controllers == undefined) { //TODO: Fix this!
    newConfigurations.controllers = path.join(process.cwd(), './controllers'); // for production (document that if no controller is specified then 'node' must be done wher /controllers is)
  }
  //If newConfigurations does indeed contain 'controllers', it will be initialized inside the following lop:
  for (var c in newConfigurations) {
    this.setProperty(c, newConfigurations[c]);
    if(c == 'loglevel'){ //loglevel changes, then new logger is needed
      createLogger(); // eslint-disable-line
    }
  }
}

/**
 * Setup default configurations
 */
config.setConfigurations(path.join(__dirname, 'configs.yaml'), 'utf8');

winston.emitErrs = true;

function consoleLogger(customLevels) {
  module.exports.logger = new winston.Logger({
    levels: customLevels.levels,
    colors: customLevels.colors,
    transports: [
      new winston.transports.Console({
        level: config.loglevel,
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true
      })
    ],
    exitOnError: false
  });
}

function createLogger(){

  /**
   * Configure here your custom levels.
   */
  var customLevels = {
    levels: {
      error: 7,
      warning: 8,
      custom: 9,
      info: 10,
      debug: 11
    },
    colors: {
      error: 'red',
      warning: 'yellow',
      custom: 'magenta',
      info: 'white',
      debug: 'blue'
    }
  };

  if (config.logfile != undefined) {
    module.exports.logger = new winston.Logger({
      levels: customLevels.levels,
      colors: customLevels.colors,
      transports: [
        new winston.transports.File({
          level: config.loglevel,
          filename: config.logfile,
          handleExceptions: true,
          json: false,
          maxsize: 5242880, //5MB
          colorize: false
        }),
        new winston.transports.Console({
          level: config.loglevel,
          handleExceptions: true,
          json: false,
          colorize: true,
          timestamp: true
        })
      ],
      exitOnError: false
    });
  } else {
    consoleLogger(customLevels);
  }
}

createLogger();