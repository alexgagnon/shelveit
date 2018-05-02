const {store, retrieve} = require('../dist/bundle.js');

const thing = {
  name: 'Romario'
};

(async() => {
  await store(thing, {encrypt: {password: 'romario'}});
  console.log(await retrieve({encrypt: {password: 'romario'}}));
})();
