const db = require('diskdb');
const puppeteer = require('puppeteer');
const randomUserAgent = require('random-useragent');

db.connect('./db', ['searches', 'searchResultsOfferUp']);

const seekOffer = async (query = 'bicycle', lat = 29.8323, lng = -95.736) => {
  try {
    const agent = randomUserAgent.getRandom();
    const url = `https://offerup.com/webapi/search/v4/feed/?lat=${lat}&lon=${lng}&limit=50&platform=web&experiment_id=experimentmodel24&q=${query}&delivery_param=p_s&radius=50`;
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 50,
    });
    const page = await browser.newPage();
    await page.setUserAgent(agent);
    await page.goto(url, { waitUntil: 'networkidle2' });
    const data = await page.evaluate(() => {
      const jsonEl = document.querySelector('pre');
      if (jsonEl) {
        const jsonText = jsonEl.textContent;
        const parsedData = JSON.parse(jsonText);
        return parsedData.data.feed_items;
      }
      return;
    });
    // const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log(userAgent);
    await browser.close();
    const items = data
      ? data
          .filter((item) => item.item)
          .filter((item, i) => i < 20)
          .map((item) => {
            return {
              searchTerm: query,
              platform: 'OfferUp',
              interested: true,
              id: item.tile_id,
              postDate: Date.parse(item.item.post_date),
              location: item.item.location_name,
              itemName: item.item.title,
              url: item.item.get_full_url,
              description: item.item.description,
              image:
                item.item.photos[0].images.detail_full.url ||
                '../static/placeholder.jpg',
              price: parseInt(item.item.price.replace('.', '')),
            };
          })
      : [];

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
