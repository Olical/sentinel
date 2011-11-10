// Load required scripts
var EventEmitter = require('events').EventEmitter;

/**
 * Class for watching source files for changes and processing them accordingly
 * 
 * @param {Object} config Optional settings Sentinel should use, such as which files to watch
 */
function Sentinel(config) {
	// Set up the config
	// Copy the argument and defualt to an empty object
	this.config = config || {};
}

// Load the methods
Sentinel.prototype = {
	require('./loadConfig').loadConfig;
};

// Export the class
exports.Sentinel = Sentinel;