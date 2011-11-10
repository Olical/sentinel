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

/**
 * Loads a JSON config file and merges it with the current config
 * 
 * @param {String} config Path to the config file to load
 * @param {Function} callback Function to run when the loading has finished
 * @returns {Object} The current instance, this allows chianing
 */
Sentinel.prototype.loadConfig = function(config, callback) {
	// Return this to allow chianing
	return this;
};

// Export the class
exports.Sentinel = Sentinel;