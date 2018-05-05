'use strict';

let store = (() => {
  var _ref = _asyncToGenerator(function* (data, options = {}) {
    // let ext = extensions[0];
    const extensions = [].concat(options.extensions || 'json');
    const filename = options.filename || '.shelveit';
    const algorithm = options.encrypt && options.encrypt.algorithm || 'aes256';

    yield Promise.all(extensions.map((() => {
      var _ref2 = _asyncToGenerator(function* (ext) {
        let state;
        switch (ext) {
          case 'yml':
          case 'yaml':
            state = yaml.dump(data);
            break;
          case 'tml':
          case 'toml':
            state = tomlify.toToml(data);
            break;
          case 'ini':
            state = ini.stringify(data);
            break;
          case 'json':
          default:
            state = JSON.stringify(data);
            ext = 'json';
        }

        if (options.encrypt != null) {
          state = encrypt(state, options.encrypt.password, algorithm);
          ext += '.aes';
        }

        try {
          yield writeFileP(resolve([filename, ext].join('.')), state, {
            encoding: 'utf8'
          });
        } catch (error) {
          console.error(error);
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));
  });

  return function store(_x) {
    return _ref.apply(this, arguments);
  };
})();

let retrieve = (() => {
  var _ref3 = _asyncToGenerator(function* (options = {}) {
    const algorithm = options.encrypt && options.encrypt.algorithm || 'aes256';
    let file = options.path;
    if (file == null) {
      file = (yield globby('.shelveit*'))[0];
      if (!file) throw Error('Cannot find stored file!');
    }

    const ext = basename(file).split('.')[2];

    try {
      let data = yield readFileP(file, { encoding: 'utf8' });

      if (options.encrypt != null) {
        data = decrypt(data, options.encrypt.password, algorithm);
      }

      switch (ext) {
        case 'yml':
        case 'yaml':
          data = yaml.safeLoad(data);
          break;
        case 'tml':
        case 'toml':
          data = toml.parse(data);
          break;
        case 'ini':
          data = ini.parse(data);
          break;
        case 'json':
        default:
          data = JSON.parse(data);
      }

      return data;
    } catch (error) {
      throw error;
    }
  });

  return function retrieve() {
    return _ref3.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('core-js/modules/es6.typed.array-buffer');

require('core-js/modules/es6.typed.int8-array');

require('core-js/modules/es6.typed.uint8-array');

require('core-js/modules/es6.typed.uint8-clamped-array');

require('core-js/modules/es6.typed.int16-array');

require('core-js/modules/es6.typed.uint16-array');

require('core-js/modules/es6.typed.int32-array');

require('core-js/modules/es6.typed.uint32-array');

require('core-js/modules/es6.typed.float32-array');

require('core-js/modules/es6.typed.float64-array');

require('core-js/modules/es6.map');

require('core-js/modules/es6.set');

require('core-js/modules/es6.weak-map');

require('core-js/modules/es6.weak-set');

require('core-js/modules/es6.promise');

require('core-js/modules/es6.symbol');

require('core-js/modules/es6.function.name');

require('core-js/modules/es6.array.from');

require('core-js/modules/es7.object.values');

require('core-js/modules/es7.object.entries');

require('core-js/modules/es7.object.get-own-property-descriptors');

require('core-js/modules/es7.string.pad-start');

require('core-js/modules/es7.string.pad-end');

var _require = require('path');

const basename = _require.basename,
      extname = _require.extname,
      resolve = _require.resolve;

var _require2 = require('crypto');

const createHash = _require2.createHash,
      createCipher = _require2.createCipher,
      createDecipher = _require2.createDecipher,
      randomBytes = _require2.randomBytes;

var _require3 = require('util');

const promisify = _require3.promisify;

var _require4 = require('fs');

const readFile = _require4.readFile,
      stat = _require4.stat,
      writeFile = _require4.writeFile;

const readFileP = promisify(readFile),
      writeFileP = promisify(writeFile);
const ini = require('ini');
const toml = require('toml-j0.4');
const tomlify = require('tomlify-j0.4');
const yaml = require('js-yaml');
const globby = require('globby');

function encrypt(data, password, algorithm) {
  /*
    if upgrading to createCipheriv
  */
  // const iv = randomBytes(16);
  // const key = createHash('sha1')
  // .update(password)
  // .digest()
  // .toString('hex')
  // .slice(0, 32);

  const cipher = createCipher(algorithm, password);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(data, password, algorithm) {
  const decipher = createDecipher('aes256', password);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  store,
  retrieve
};
