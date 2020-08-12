const db = require('diskdb');
const puppeteer = require('puppeteer');
const randomUserAgent = require('random-useragent');

db.connect('./db', ['searches', 'searchResultsOfferUp']);

const seekOffer = async (query = 'bicycle', lat = 29.8323, lng = -95.736) => {
  try {
    const agent = randomUserAgent.getRandom();
    const url = `https://offerup.com/webapi/search/v4/feed/?lat=${lat}&lon=${lng}&limit=50&platform=web&experiment_id=experimentmodel24&q=${query}&delivery_param=p_s&radius=50`;
    let data;
    const browser = await puppeteer.launch({
      headless: true,
      // slowMo: 1500
    });
    const page = await browser.newPage();
    page.on('response', async (response) => {
      try {
        data = await response.json();
        data = await data.data.feed_items;
      } catch (e) {
        console.log(e);
      }
    });
    await page.setUserAgent(agent);
    await page.goto(url, { waitUntil: 'networkidle2' });
    // const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log(userAgent);
    await browser.close();
    const items = data ? data
      .filter((item) => item.item)
      .filter((item, i) => i < 20)
      .map((item) => {
        return {
          searchTerm: query,
          platform: 'OfferUp',
          interested: true,
          id: item.tile_id,
          // distance: item.item.distance,
          postDate: Date.parse(item.item.post_date),
          // owner: item.item.owner.first_name,
          // ownerAvatar: item.item.owner.get_profile.avatar_square,
          location: item.item.location_name,
          itemName: item.item.title,
          // howLongAgo: item.item.post_date_ago,
          url: item.item.get_full_url,
          description: item.item.description,
          image: item.item.photos[0].images.detail_full.url || '../static/placeholder.jpg',
          price: parseInt(item.item.price.replace('.', '')),
        };
      }) : [];

    items.forEach(async (item) => {
      try {
        const existingItem = await db.searchResultsOfferUp.findOne({
          postDate: item.postDate,
        });
        if (existingItem) {
          return;
        }
        await db.searchResultsOfferUp.save(item);
      } catch (e) {
        console.log(e);
      }
    });
    return items;
  } catch (e) {
    console.log(e);
  }
};

const seekOfferAll = async () => {
  try {
    const searches = await db.searches.find();
    const searchResults = await searches.map((search) =>
      seekOffer(search.name, search.lat, search.lng)
    );
    await Promise.allSettled(searchResults);
    console.log('Finished with OfferUp');
  } catch (e) {
    console.log(e);
  }
};

module.exports = seekOfferAll;
