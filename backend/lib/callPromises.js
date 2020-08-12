const seekFaceAll = require('./seekFace');
const seekLetAll = require('./seekLet');
const seekOfferAll = require('./seekOffer');

const callPromises = async () => {
  const promises = [seekFaceAll, seekLetAll, seekOfferAll];
  for (promise of promises) {
    await promise();
  }
};

module.exports = callPromises;
