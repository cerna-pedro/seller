const db = require('diskdb');
const puppeteer = require('puppeteer');
const randomUserAgent = require('random-useragent');

db.connect('./db', ['searches', 'searchResultsLetGo']);

const seekLet = async (query = 'bicycle', lat = 29.7634, lng = -95.3634) => {
  try {
    const agent = randomUserAgent.getRandom();
    const url = `https://searchproducts.letgo.com/api/products?country_code=US&search_term=${query}&sort=recent&latitude=${lat}&longitude=${lng}&locale=en_US`;
    let data;
    const browser = await puppeteer.launch({
      headless: true,
      // slowMo: 1500
    });
    const page = await browser.newPage();
    page.on('response', async (response) => {
      try {
        data = await response.json();
      } catch (e) {
        console.log(e);
      }
    });
    await page.setUserAgent(agent);
    await page.goto(url, { waitUntil: 'networkidle2' });
    // const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log(userAgent);
    await browser.close();
    const items = data? data
      .filter((item) => item)
      .map((item) => {
        return {
          searchTerm: query,
          platform: 'letgo',
          interested: true,
          id: item.id,
          postDate: Date.parse(item.updated_at),
          location: item.geo.city,
          itemName: item.name,
          url: `https://www.letgo.com/en-us/i/${item.id}`,
          description: item.description,
          image: item.media[0].outputs.image || '../static/placeholder.jpg',
          price: item.price * 100,
        };
      })
      .sort((a, b) => b.postDate - a.postDate) : [];
    items.forEach(async (item) => {
      try {
        const existingItem = await db.searchResultsLetGo.findOne({
          postDate: item.postDate,
        });
        if (existingItem) {
          return;
        }
        await db.searchResultsLetGo.save(item);
      } catch (e) {
        console.log(e);
      }
    });
    return items;
  } catch (e) {
    console.log(e);
  }
};

const seekLetAll = async () => {
  try {
    const searches = await db.searches.find();
    const searchResults = await searches.map((search) => seekLet(search.name, search.lat, search.lng));
    await Promise.allSettled(searchResults);

    console.log('Finished with LetGo');
  } catch (e) {
    console.log(e);
  }
};

module.exports = seekLetAll;
