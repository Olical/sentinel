/**
 * Loads a JSON config file and merges it with the current config
 * 
 * @param {String} config Path to the config file to load
 * @param {Function} callback Function to run when the loading has finished
 * @returns {Object} The current instance, this allows chianing
 */
exports.loadConfig = function(config, callback) {
	// Return this to allow chianing
	return this;
};