(function(exports) {
	// Place the script in strict mode
	'use strict';
	
	// Load required modules
	var fs = require('fs'),
		path = require('path'),
		exec = require('child_process').exec;
	
	// Set the package root
	require.paths.unshift(path.join(__dirname, '..'));
	
	/**
	 * Class for watching source files for changes and processing them accordingly
	 * 
	 * @param {Object} config Optional settings Sentinel should use, such as which files to watch
	 */
	function Sentinel(config) {
		// Set up the config
		this.config = {
			files: [],
			processors: {}
		};
		
		// Merge in any passed configurations
		if(config) {
			this.mergeConfig(config);
		}
	}
	
	/**
	 * Merges the passed config object with the current one recursively
	 * 
	 * @param {Object} config Config object to merge
	 * @param {Object} targetConfig The target to merge into, defaults to the current config
	 * @returns {Object} The current instance, this allows chianing
	 */
	Sentinel.prototype.mergeConfig = function(config, targetConfig) {
		// Initialise variables
		var target = targetConfig || this.config,
			i = null;
		
		// Loop over all in the passed config
		for(i  in config) {
			if(config.hasOwnProperty(i)) {
				// If the targets equivilent is an object, recurse
				// Otherwise store it
				if(typeof target[i] === 'object') {
					// It is an object, we need to recurse
					this.mergeConfig(config[i], target[i]);
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
	Sentinel.prototype.loadConfig = function(file, callback) {
		// Initialise variables
		var self = this;
		
		// Make sure the file is okay
		fs.stat(file, function(err, stats) {
			if(!err && stats.isFile()) {
				// It is okay. Now load the file
				fs.readFile(file, function(err, data) {
					if(!err) {
						// File loaded!
						// Now attempt to parse the config
						try {
							self.mergeConfig(JSON.parse(data));
							
							// The config was loaded and merged
							// We can now call the callback
							// Pass the error as null
							callback.call(self, null);
						}
						catch(e) {
							callback.call(self, new Error('The config file is not valid JSON.'));
						}
					}
					else {
						callback.call(self, new Error('The config file could not be read.'));
					}
				});
			}
			else {
				callback.call(self, new Error('The config file does not exist.'));
			}
		});
		
		// Return this to allow chianing
		return this;
	};
	
	/**
	 * Begins watching files specified in the config
	 * 
	 * @returns {Object} The current instance, this allows chaining
	 */
	Sentinel.prototype.start = function() {
		// Initialise variables
		var self = this,
			i = null,
			a = null,
			file = null,
			command = null;
		
		// Loop over all files in the config
		for(i = 0; i < this.config.files.length; i += 1) {
			// Grab the current file
			file = this.config.files[i];
			
			// Add the watcher
			fs.watchFile(file.path, function(curr, prev) {
				// If there is a processor specified which exists then execute it
				if(file.processor && self.config.processors.hasOwnProperty(file.processor)) {
					// Copy the command
					command = self.config.processors[file.processor];
					
					// Replace the arguments if any where passed
					for(a in file) {
						if(file.hasOwnProperty(a)) {
							command = command.replace('{{' + a + '}}', file[a], 'g');
						}
					}
					
					// Execute it
					exec(command, function(err, stdout, stderr) {
						// Display the output
						if(!err) {
							console.log(stdout);
						}
						else {
							throw err;
						}
					});
				}
			});
		}
		
		// Return this to allow chianing
		return this;
	};
	
	/**
	 * Stops watching the files specified by the config
	 * 
	 * @returns {Object} The current instance, this allows chaining
	 */
	Sentinel.prototype.stop = function() {
		// Initialise variables
		var i = null;
		
		// Loop over all files in the config
		for(i = 0; i < this.config.files.length; i += 1) {
			// Unwatch the file
			fs.unwatchFile(this.config.files[i].path);
		}
		
		// Return this to allow chianing
		return this;
	};
	
	// Export the class
	exports.Sentinel = Sentinel;
}(this));