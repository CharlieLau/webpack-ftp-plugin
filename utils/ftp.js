var fs = require('fs');
var path = require('path');
var colors = require('colors')
var Ftp = require('jsftp');
var _ = require('lodash');
var iconv = require('iconv-lite');
var async = require('async');


var conf;

var ftp;

var toTransfer;



module.exports = function (options) {

    var _default = {
        ftp: {
            // "authKey": {
            //     "username": "xxx",
            //     "password": "xx"
            // },
            // "host": "xx.x.x.x",
            // "port": "21"
        },
        remoteRoot: '',
        localRoot: __dirname,
        deployPath: ''
    }


    if (options) {

        conf = _.assign(_default, options);
    }

    if (!exists(path.resolve('.ftppass'))) {
        console.info('\'authKey\' configuration provided but no valid \'.ftppass\' file found!'.yellow);
        return;
    }

    conf.ftp = getAuthVals();

    // Init
    ftp = new Ftp({
        host: conf.ftp.host,
        port: conf.ftp.port, // defaults to 21
        user: conf.ftp.authKey.username, // defaults to "anonymous"
        pass: conf.ftp.authKey.password, // defaults to "@anonymous",
        onError: function (err) {
            console.info('connect error=======>' + err)
        }
    });

    var deployPath = path.normalize(conf.localRoot + path.sep + conf.deployPath + path.sep);
    toTransfer = dirParseSync(deployPath);

    var locations = _.keys(toTransfer);

    async.eachSeries(locations, ftpProcessLocation, function () {
        ftp.raw('quit', function (err) {
            if (err) {
                console.error(err);
            } else {
                console.info('FTP upload done!'.green);
            }
        });
    });

}


// A method for parsing the source location and storing the information into a suitably formated object
function dirParseSync(startDir, result) {
    var files;
    var i;
    var tmpPath;
    var currFile;
    ftpProcessLocation

    // initialize the `result` object if it is the first iteration
    if (result === undefined) {
        result = {};
        result[path.sep] = [];
    }

    // check if `startDir` is a valid location
    if (!fs.existsSync(startDir)) {
        console.info(startDir + ' is not an existing location'.red);
    }

    // iterate throught the contents of the `startDir` location of the current iteration
    files = fs.readdirSync(startDir);
    for (i = 0; i < files.length; i++) {
        currFile = startDir + path.sep + files[i];

        if (isDir(currFile)) {
            tmpPath = path.relative(conf.localRoot, startDir + path.sep + files[i]);
            if (!_.has(result, tmpPath)) {
                result[tmpPath] = [];
            }
            dirParseSync(startDir + path.sep + files[i], result);
        } else {
            tmpPath = path.relative(conf.localRoot, startDir);
            if (!tmpPath.length) {
                tmpPath = path.sep;
            }
            if (!_.has(result, tmpPath)) {
                result[tmpPath] = [];
            }
            result[tmpPath].push(files[i]);
            // result[tmpPath].push(tmpPath + '/' + files[i]);
        }


    }

    return result;
}

function ftpCwd(inPath, cb) {
    ftp.raw('cwd', inPath, function (err) {
        if (err) {
            ftp.raw('mkd', inPath, function (err) {
                if (err) {
                    console.info('Error creating new remote folder ' + inPath + ' --> ' + err);
                    cb(err);
                } else {
                    console.info('New remote folder created ' + inPath);
                    ftpCwd(inPath, cb);
                }
            });
        } else {
            cb(null);
        }
    });
}

// A method for uploading a single file
function ftpPut(inFilename, done) {
    var fpath = path.normalize(conf.localRoot + path.sep + currPath + path.sep + inFilename);

    ftp.put(fpath, inFilename, function (err) {
        if (err) {
            console.info('Cannot upload file: ' + inFilename + ' --> ' + err);
            done(err);
        } else {
            console.info('Uploaded file: ' + inFilename.green + ' to: ' + currPath);
            done(null);
        }
    });
}

function ftpProcessLocation(inPath, cb) {
    if (!toTransfer[inPath]) {
        cb(new Error('Data for ' + inPath + ' not found'));
    }

    ftpCwd(path.normalize('/' + conf.remoteRoot + '/' + inPath).replace(/\\/gi, '/'), function (err) {
        var files;

        if (err) {
            console.warn('Could not switch to remote folder!'.red);
        }

        currPath = inPath;
        files = toTransfer[inPath];
        async.eachSeries(files, ftpPut, function (err) {
            if (err) {
                console.warn('Failed uploading files!'.red);
            }
            cb(null);
        });
    });
}



function getAuthVals() {
    var tmpData;
    var authFile = path.resolve('.ftppass');


    // If there is a valid auth file provided
    if (fs.existsSync(authFile)) {
        tmpData = JSON.parse(read(authFile));
        return tmpData;
    } else {
        console.info('\'authKey\' configuration provided but no valid \'.ftppass\' file found!'.yellow);
        return {};
    }
}

// True if the path is a directory.
function isDir() {
    var filepath = path.join.apply(path, arguments);
    return exists(filepath) && fs.statSync(filepath).isDirectory();
};

function exists() {
    var filepath = path.join.apply(path, arguments);
    return fs.existsSync(filepath);
};


function read(filepath, options) {
    if (!options) {
        options = {};
    }
    var contents;
    console.info("Reading...." + filepath + ".....".red);
    try {
        contents = fs.readFileSync(String(filepath));
        if (options.encoding !== null) {
            contents = iconv.decode(contents, 'utf8', {
                stripBOM: true
            });
        }
        return contents;
    } catch (e) {
        console.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
};