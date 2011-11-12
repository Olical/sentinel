(function(exports) {
	// Place the script in strict mode
	'use strict';
	
	// Load required modules
	var fs = require('fs'),
		path = require('path'),
		exec = require('child_process').exec,
		EventEmitter = require('events').EventEmitter;
	
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
	
	// Merge the EventEmitter prototype
	Sentinel.prototype = EventEmitter.prototype;
	
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
	 * @param {Bool} skipReplace If true, the directory replacement will not occour
	 * @returns {Object} The current instance, this allows chianing
	 */
	Sentinel.prototype.loadConfig = function(file, callback, skipReplace) {
		// Initialise variables
		var self = this,
			parsedConfig = null,
			data = null;
		
		// If we need to prepend with the correct directory, do so
		if(!skipReplace) {
			file = path.join(process.cwd() + '/', file);
		}
		
		// Make sure the file is okay
		fs.stat(file, function(err, stats) {
			if(!err && stats.isFile()) {
				// It is okay. Now load the file
				data = fs.readFileSync(file, 'utf8');
				
				if(data) {
					// File loaded!
					// Now attempt to parse the config
					try {
						parsedConfig = JSON.parse(data);
						self.mergeConfig(parsedConfig);
						
						// The config was loaded and merged
						// We can now call the callback
						// Pass the error as null
						callback.call(self, null);
						
						// Share the news about the new config
						self.emit('configLoaded', file, parsedConfig, data);
					}
					catch(e) {
						callback.call(self, new Error(file + ': The config file is not valid JSON.'));
					}
				}
				else {
					callback.call(self, new Error(file + ': The config file could not be read.'));
				}
			}
			else {
				callback.call(self, new Error(file + ': The config file does not exist.'));
			}
		});
		
		// Return this to allow chianing
		return this;
	};
	
	/**
	 * Executes a processor or processors and passes the arguments to it
	 * It will not execute it if it does not exist
	 * 
	 * @param {String|Array} proc Name of the processor or an array of processor names to execute
	 * @param {Object} args List of arguments to pass to the processor. It works like this: An argument of foo would replace {{foo}} in the processor string with its value
	 * @returns {Object} The current instance, this allows chaining
	 */
	Sentinel.prototype.executeProcessor = function(proc, args) {
		// Initialise variables
		var i = null,
			command = null;
		
		// If it is an array, loop over and recall this method
		if(proc instanceof Array) {
			for(i = 0; i < proc.length; i += 1) {
				this.executeProcessor(proc[i], args);
			}
		}
		else {
			// Make sure the processor exists
			if(this.config.processors.hasOwnProperty(proc)) {
				// Copy the command
				command = this.config.processors[proc];
				
				// Replace the argumentss
				for(i in args) {
					if(args.hasOwnProperty(i)) {
						command = command.replace(new RegExp('{{' + i + '}}', 'g'), args[i]);
					}
				}
				
				// Execute it
				exec(command, function(err, stdout, stderr) {
					// Display the output
					process.stdout.write(stdout);
					process.stderr.write(stderr);
				});
				
				// Let the world know that this precessor has executed
				this.emit('processorExecuted', proc, this.config.processors[proc], command);
			}
		}
		
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
			i = null;
		
		/**
		 * Adds a file watcher
		 * 
		 * @param {Object} file The file object to watch
		 */
		function watchFile(file) {
			fs.watchFile(file.path, function(curr, prev) {
				// If there have been changes, execute the processors (if any)
				if(file.processor && curr.size !== prev.size) {
					// Let the world know that the file has changed
					self.emit('fileChanged', file, curr, prev);
					
					self.executeProcessor(file.processor, file);
				}
			});
		}
		
		// Loop over all files in the config
		for(i = 0; i < this.config.files.length; i += 1) {
			// Add the watcher
			watchFile(this.config.files[i]);
		}
		
		// Fire the start event
		this.emit('start');
		
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
		
		// Fire the stop event
		this.emit('stop');
		
		// Return this to allow chianing
		return this;
	};
	
	// Export the class
	exports.Sentinel = Sentinel;
}(this));