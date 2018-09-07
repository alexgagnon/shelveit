const {readFileP, unlinkP} = require('../libs/fsp.js');
const {store, retrieve} = require('../dist/bundle.js');
const globby = require('globby');

const string = 'justastring';
const array = ['one', 2];
const flat = {
  name: 'shelveit'
};
const nested = {
  name: 'shelveit',
  nested: {
    prop: 'value'
  }
};

afterEach(async() => {
  await Promise.all(
    (await globby(['.shelveit*', '.test-file*'])).map(file => {
      return unlinkP(file);
    })
  );
});

test('creates default file', async() => {
  await store(flat);
  const file = await readFileP('.shelveit.json', {encoding: 'utf8'});
  expect(file).toBe(JSON.stringify(flat));
  const data = await retrieve();
  expect(data).toEqual(flat);
});

test('creates file with custom path', async() => {
  await store(string, {filename: './sample/test-file'});
  const file = await readFileP('.test-file.json', {encoding: 'utf8'});
  expect(file).toBe(JSON.stringify(string));
  expect(await retrieve({path: '.test-file.json'})).toEqual(string);
});

test('');
