const seekFaceAll = require('./seekFace');
const seekLetAll = require('./seekLet');
const seekOfferAll = require('./seekOffer');
const seekNextAll = require('./seekNext');

const callPromises = async () => {
  const promises = [seekFaceAll, seekLetAll, seekOfferAll,seekNextAll];
  for (promise of promises) {
    await promise();
  }
};

module.exports = callPromises;
