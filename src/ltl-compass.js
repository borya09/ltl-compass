(function (exports, process, undefined) {
    'use strict';

    var exec = require('child_process').exec,
        path = require('path'),
        fs = require('fs.extra');

    var _optionsAreOk = (function () {

        var _hasOwnProperty = {}.hasOwnProperty;

        /**
         * @method _checkOptions
         * @param opts {Object}
         * @param supportedOpts {Object}
         *
         * @return {Array} of errors
         */
        //TODO: Check more things, not only mandatory fields: data type, length, ...
        return function (opts, supportedOpts) {

            var errors = [], supportedOpt;

            opts = opts || {};

            for (var name in supportedOpts) {
                if (_hasOwnProperty.call(supportedOpts, name)) {
                    supportedOpt = supportedOpts[name];
                    if (supportedOpt.mandatory && !opts[name]) {
                        //Required field not found
                        errors.push(name + 'is required');
                    }
                }
            }

            return errors;
        }

    })();

    var _getFileSizeInBytes = function (path) {
        var stats = fs.statSync(path);
        return stats["size"];
    };

    var _getCssName = function (lessName) {
        return lessName.replace(new RegExp(path.extname(lessName) + '$'), '.css');
    };


    exports.compile = (function () {

        var supportedOpts = {
            'src_path': { mandatory: true},
            'output_path': {  default: '.'},
            'output_style': {  default: 'compressed'},
            'log_time': {},
            'trace': {}
        };

        var tmp_path = '.tmp',
            path_separator = path.sep,
            _opts,
            DEFAULT_ERROR = 'Error compiling to css';

        var _buildArguments = function () {
            var args = ['compile'];

            if (process.platform === 'win32') {
                args.unshift('compass.bat');
            } else {
                args.unshift('compass');
            }

            args.push('--sass-dir', _opts.src_dir);
            args.push('--css-dir', _opts.tmp_dir);
            args.push('--output-style', _opts.output_style || supportedOpts.output_style.default);

            if (_opts.log_time) {
                args.push('--time');
            }
            if (_opts.trace) {
                args.push('--trace');
            }

            return args;
        };


        var _prepareOptions = function () {

            //SRC
            _opts.src_dir = path.dirname(_opts.src_path);
            _opts.src_name = path.basename(_opts.src_path);

            //OUTPUT
            _opts.output_path = _opts.output_path || supported_opts.output_path;
            var output_ext = path.extname(_opts.output_path);
            if (output_ext && output_ext.length) {
                //Output css filename given
                _opts.output_dir = path.dirname(_opts.output_path) + path_separator;
                _opts.output_name = path.basename(_opts.output_path);

            } else {
                //Output css filename NOT given: output_dir + src_name
                _opts.output_dir = _opts.output_path + path_separator;
                _opts.output_name = _getCssName(_opts.src_name);
            }

            //TMP
            _opts.tmp_dir = _opts.output_dir + tmp_path + path_separator;
            _opts.tmp_name = _opts.output_name;
        };

        var _removeTmpFolder = function (opts) {
            fs.rmrfSync(opts.tmp_dir)
        };

        var _copyCssToOutput = function (opts) {
            var input = opts.tmp_dir + _getCssName(opts.src_name),
                output = opts.output_dir + opts.output_name;
            fs.writeFileSync(output, fs.readFileSync(input), 'utf8');
        };


        var _checkIfOutputIsOk = function (opts) {
            var file = opts.output_dir + opts.output_name;
            return fs.statSync(file).isFile() && _getFileSizeInBytes(file) > 0;
        };


        var _execCallback = function (cb, error, errors) {
            cb && cb(error, errors);
        };

	    /**
	     * @method compile
	     * @param opts {Object} Compilation options
	     * @param cb {Function} Callback
	     *
	     */
        //TODO: Comment available options and callback
        return function (opts, cb) {

            _opts = opts;
            var errors = _optionsAreOk(_opts, supportedOpts);

            if (errors.length === 0) {

                _prepareOptions();

                var command = _buildArguments().join(' ');

                //console.info(command);

                exec(command, (function (opts) {

                    return function () {

                        _copyCssToOutput(opts);
                        _removeTmpFolder(opts);

                        var error = !_checkIfOutputIsOk(opts);
                        if (error) {
                            errors.push(DEFAULT_ERROR);
                        }

                        _execCallback(cb, error, errors);

                    }

                })(_opts));
            } else {
                _execCallback(cb, true, errors);
            }
        };

    })();

})(exports, process);




