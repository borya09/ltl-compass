var sass_files_to_test = [
	{

		sass_path: 'test/fixtures/1/one.sass',
		output_css_path: 'test/output/1/one.css',
		expected_css_path: 'test/expected/1/one.css'
	},
	{
		sass_path: 'test/fixtures/2/one.sass',
		output_css_path: 'test/output/2/one.css',
		expected_css_path: 'test/expected/2/one.css'
	}
];


describe('compilation of', function () {

	var fs = require('fs-extra');
	var compass = require('../lib/ltl-compass');
	var assert = require("assert");

	var testCompileFile = function (params) {
		describe('\'' + params.sass_path + '\'', function () {
			beforeEach(function (done) {
				compass.compile({
					src_path: params.sass_path,
					output_path: params.output_css_path
				}, function (error, errors) {
					done();
				});
			});

			it('should generate a css file like \'' + params.expected_css_path + '\'', function () {
				assert.equal(fs.readFileSync(params.output_css_path, "utf8"), fs.readFileSync(params.expected_css_path, "utf8"));
			});
		});
	};

	sass_files_to_test.forEach(function (test) {
		testCompileFile(test);
	});

	after(function () {
		fs.removeSync('test/output');
		fs.removeSync('.sass-cache');
	});

});