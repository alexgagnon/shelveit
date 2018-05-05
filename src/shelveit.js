// @flow

require('babel-polyfill');
const {basename, extname, resolve} = require('path');
const {
  createHash,
  createCipher,
  createDecipher,
  randomBytes
} = require('crypto');
const {promisify} = require('util');
const {readFile, stat, writeFile} = require('fs');
const readFileP = promisify(readFile),
  writeFileP = promisify(writeFile);
const ini = require('ini');
const toml = require('toml-j0.4');
const tomlify = require('tomlify-j0.4');
const yaml = require('js-yaml');
const globby = require('globby');

async function store(
  data: any,
  options?: {
    encrypt?: {
      password: string | Buffer,
      algorithm?: string
    },
    extensions?: string | Array<string>,
    filename?: string
  } = {}
): Promise<any> {
  // let ext = extensions[0];
  const extensions = [].concat(options.extensions || 'json');
  const filename = options.filename || '.shelveit';
  const algorithm = (options.encrypt && options.encrypt.algorithm) || 'aes256';

  await Promise.all(
    extensions.map(async ext => {
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
        await writeFileP(resolve([filename, ext].join('.')), state, {
          encoding: 'utf8'
        });
      }
      catch (error) {
        console.error(error);
      }
    })
  );
}

async function retrieve(
  options?: {
    encrypt?: {password: string | Buffer, algorithm: string},
    path?: string
  } = {}
) {
  const algorithm = (options.encrypt && options.encrypt.algorithm) || 'aes256';
  let file = options.path;
  if (file == null) {
    file = (await globby('.shelveit*'))[0];
    if (!file) throw Error('Cannot find stored file!');
  }

  const ext = basename(file).split('.')[2];

  try {
    let data = await readFileP(file, {encoding: 'utf8'});

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
  }
  catch (error) {
    throw error;
  }
}

function encrypt(
  data: string | Buffer,
  password: string | Buffer,
  algorithm
): string {
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

function decrypt(data: string, password: string | Buffer, algorithm: string) {
  const decipher = createDecipher('aes256', password);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  store,
  retrieve
};
