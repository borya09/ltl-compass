var fs = require('fs-extra');
var compass = require('../lib/ltl-compass');


//TODO: Test!!!
compass.compile({
	src_path: 'fixtures/one.sass',
	output_path: 'output'
}, function(error, errors){
	console.log(error);
});