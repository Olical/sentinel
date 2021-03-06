#!/usr/bin/env node

// Load required scripts
var path = require('path'),
	fs = require('fs');

// Initialise variables
var Sentinel = require('sentinel').Sentinel,
	args = process.argv.splice(2),
	s = new Sentinel(),
	i = null,
	f = null,
	flags = {
		verbose: false,
		process: false
	};

// Loop over the arguments acting accordingly
for(i = 0; i < args.length; i += 1) {
	// Loop over all preset flags
	for(f in flags) {
		if(flags.hasOwnProperty(f)) {
			// Check if we have a match
			if(args[i] === '--' + f || args[i] === '-' + f[0]) {
				flags[f] = true;
				
				// If there is a string after, store instead of true
				if(typeof args[i + 1] === 'string') {
					flags[f] = args[i + 1];
				}
			}
		}
	}
}

// Check if we need verbose output
if(flags.verbose) {
	// This event will display file information whenever a file changes
	s.on('fileChanged', function(file, curr, prev) {
		console.log('File changed: ' + file.path + ' (' + prev.size + 'b -> ' + curr.size + 'b = ' + (curr.size - prev.size) + 'b)');
	});
	
	// Display information every time a processor is executed
	s.on('processorExecuted', function(proc, source, command) {
		console.log('Processor executed: ' + proc + ' (' + source + ' -> ' + command + ')');
	});
	
	// Log the loading of configuration
	s.on('configLoaded', function(file, parsedConfig, data) {
		console.log('Config loaded: ' + file);
	});
}

// Attempt to load the global config
s.loadConfig(process.env.HOME + '/.sentinel.json', function(err) {
	if(err && flags.verbose) {
		console.log(err.message);
	}
	
	// Attempt to load this directorys config
	s.loadConfig('./sentinel.json', function(err) {
		if(err && flags.verbose) {
			console.log(err.message);
		}
		
		if(typeof flags.process === 'string') {
			// Manually execute a processor
			for(i = 0; i < s.config.files.length; i += 1) {
				// Check if the file matchs
				if(s.config.files[i].path === flags.process) {
					// We have a match, process it
					s.executeProcessor(s.config.files[i].processor, s.config.files[i]);
				}
			}
		}
		else {
			// We must listen rather than going manually
			// Start the sentinel
			// It will now begin watching files
			s.start();
		}
	});
}, true);