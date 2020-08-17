const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const callPromises = require('./lib/callPromises');
const db = require('diskdb');
require('./lib/cron');

db.connect('./db', [
  'searches',
  'searchResultsOfferUp',
  'searchResultsLetGo',
  'searchResultsFacebook',
  'searchResultsNext',
]);

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

callPromises();

app.get('/listings/', async (req, res) => {
  const searchTerms = await db.searches.find();
  const nextData = await db.searchResultsNext.find({ interested: true });
  const offerData = await db.searchResultsOfferUp.find({ interested: true });
  const letData = await db.searchResultsLetGo.find({ interested: true });
  const faceData = await db.searchResultsFacebook.find({ interested: true });
  const allData = {
    searchTerms: [...searchTerms],
    Nextdoor:[...nextData],
    OfferUp: [...offerData],
    LetGo: [...letData],
    Facebook: [...faceData],
  };
  res.json(allData);
});

app.get('/listings/not-interested/', async (req, res) => {
  const searchTerms = await db.searches.find();
  const nextNotInterested = await db.searchResultsNext.find({
    interested: false,
  });
  const offerNotInterested = await db.searchResultsOfferUp.find({
    interested: false,
  });
  const letNotInterested = await db.searchResultsLetGo.find({
    interested: false,
  });
  const faceNotInterested = await db.searchResultsFacebook.find({
    interested: false,
  });
  const allData = {
    searchTerms: [...searchTerms],
    Nextdoor:[...nextNotInterested],
    OfferUp: [...offerNotInterested],
    LetGo: [...letNotInterested],
    Facebook: [...faceNotInterested],
  };
  res.json(allData);
});

app.post('/listings/add/', async (req, res) => {
  const existingSearches = db.searches.find();
  const existingSearch = db.searches.findOne({ name: req.body.name });
  if (existingSearch) {
    return;
  }
  db.searches.save(req.body, existingSearches);
});

app.post('/listings/remove/:word', async (req, res) => {
  const existingSearch = db.searches.findOne({ name: req.params.word });
  if (existingSearch) {
    await db.searches.remove({ name: req.params.word });
    await db.searchResultsFacebook.remove({ searchTerm: req.params.word });
    await db.searchResultsLetGo.remove({ searchTerm: req.params.word });
    await db.searchResultsOfferUp.remove({ searchTerm: req.params.word });
    await db.searchResultsNext.remove({ searchTerm: req.params.word });
  }
});

app.post('/listings/reset/', async (req, res) => {
  fs.writeFileSync('./db/searches.json', '[]');
  fs.writeFileSync('./db/searchResultsFacebook.json', '[]');
  fs.writeFileSync('./db/searchResultsLetGo.json', '[]');
  fs.writeFileSync('./db/searchResultsOfferUp.json', '[]');
  fs.writeFileSync('./db/searchResultsNext.json', '[]');
  fs.writeFileSync('./db/searches.json', '[]');
  fs.writeFileSync('./db/searchResultsFacebook.json', '[]');
  fs.writeFileSync('./db/searchResultsLetGo.json', '[]');
  fs.writeFileSync('./db/searchResultsOfferUp.json', '[]');
  fs.writeFileSync('./db/searchResultsNext.json', '[]');
});

app.post('/listings/interested/:id', async (req, res) => {
  const options = {
    multi: false,
    upsert: false,
  };
  const query = {
    id: req.params.id,
  };
  const item = await db.searchResultsOfferUp.findOne({ id: req.params.id }) || await db.searchResultsLetGo.findOne({ id: req.params.id }) || await db.searchResultsFacebook.findOne({ id: req.params.id }) || await db.searchResultsNext.findOne({ id: req.params.id })
  const isInterested = item.interested
  await db.searchResultsOfferUp.update(query, { interested: !isInterested }, options);
  await db.searchResultsLetGo.update(query, { interested: !isInterested }, options);
  await db.searchResultsFacebook.update(query, { interested: !isInterested }, options);
  await db.searchResultsNext.update(query, { interested: !isInterested }, options);
  res.redirect(req.get('referer'))
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/listings/`);
});
