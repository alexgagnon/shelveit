const {store, retrieve} = require('./bundle.js');

const thing = {
  name: 'Lisa'
};

(async() => {
  await store(thing, {extensions: ['json', 'toml', 'yaml', 'ini']});
  console.log(await retrieve({encrypt: {password: 'secret'}}));
})();
