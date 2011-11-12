# Sentinel

This program, when configured correctly, will watch your source files and run them through other programs when they are modified. It was intended for [LESS](http://lesscss.org/) and JavaScript files although can be set up to run anything you want. Sentinel is built to run on [node.js](http://nodejs.org/).

At the moment the only way to stop it is with `Ctrl + C`. I am planning on implementing some kind of interface so that you can prompt things like reloading the config, or forcing the processing of a file. I would also like to add regular expression file matching.

## Configuration

Like `make`, sentinel looks in your current directory for a config file. This file should be named `sentinel.json`. It will also look for a global config in your home directory called `.sentinel.json`. The local one in your current folder will overwrite things set in the global one via inheritence.

As you can tell from the name, the configuration is written in JSON, lets have a look at a very basic one that runs a JavaScript file through JSHint.

    {
    	"files": [
    		{
    			"path": "assets/javascript/main.js",
    			"processor": "jshint"
    		}
    	],
    	"processors": {
    		"jshint": "jshint {{path}}"
    	}
    }

Lets walk through this. We have a fairly simple JSON object containin two top level properties, `files` and `processors`. Files is an array of objects that contain data about your source files. Each of the files values are actually arguments, this is because they replace their associated value in the processor string. So if you write `{{path}}` in your processor it will be replaced with the path value. The processor value can either be a string or an array of strings, these let Sentinel know what processor you wish to run the file through.

The processors object is a list of key value pairs containing the name of the processor and a small bash script to run your script to. You can utilise any passed values in a file object by simply wrapping the name of the value in double curly braces (`{{value name}}`). So you can use the path value as an input and output as the destination.

If you wanted to, you could copy this (less the files array) into `~/.sentinel.json` and have the JSHint processor avaliable in every project.

## Licence

Sentinel - Watch source files for changes and processes them accordingly

Copyright (C) 2011 Oliver Caldwell

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licences/gpl.html>.

## Author

Written by [Oliver Caldwell](http://olivercaldwell.co.uk).