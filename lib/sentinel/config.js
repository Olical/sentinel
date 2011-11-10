// Load required modules
var fs = require('fs');

/**
 * Merges the passed config object with the current one recursively
 * 
 * @param {Object} config Config object to merge
 * @param {Object} targetConfig The target to merge into, defaults to the current config
 * @returns {Object} The current instance, this allows chianing
 */
exports.merge = function(config, targetConfig) {
	// Initialise variables
	var target = targetConfig || this.configStorage,
		i = null;
	
	// Loop over all in the passed config
	for(i  in config) {
		if(config.hasOwnProperty(i)) {
			// If the targets equivilent is an object, recurse
			// Otherwise store it
			if(typeof target[i] === 'object') {
				// It is an object, we need to recurse
				this.config.merge(config[i], target[i]);
			}
			else {
				// It does not exist or it is something else
				// Copy in the new one
				target[i] = config[i];
			}
		}
	}
	
	// Return this to allow chianing
	return this;
};

/**
 * Loads a JSON config file and merges it with the current config
 * 
 * @param {String} file Path to the config file to load
 * @param {Function} callback Function to run when the loading has finished
 * @returns {Object} The current instance, this allows chianing
 */
exports.load = function(file, callback) {
	// Make sure the file is okay
	fs.stat(file, function(err, stats) {
		if(!err && stats.isFile()) {
			// It is okay. Now load the file
			fs.readFile(file, function(err, data) {
				if(!err) {
					// File loaded!
					// Now attempt to parse the config
					try {
						this.config.merge(JSON.parse(data));
						
						// The config was loaded and merged
						// We can now call the callback
						// Pass the error as null
						callback.call(this, null);
					}
					catch(e) {
						throw e;
						callback.call(this, new Error('The config file is not valid JSON.'));
					}
				}
				else {
					callback.call(this, new Error('The config file could not be read.'));
				}
			});
		}
		else {
			callback.call(this, new Error('The config file does not exist.'));
		}
	});
	
	// Return this to allow chianing
	return this;
};