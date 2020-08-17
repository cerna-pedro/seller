require('dotenv').config();
const db = require('diskdb');
const puppeteer = require('puppeteer');
const randomUserAgent = require('random-useragent');

db.connect('./db', ['searches', 'searchResultsNext']);

const seekNext = async (query = 'bicycle') => {
  try {
    const agent = randomUserAgent.getRandom();
    const url1 = `https://nextdoor.com/login/`;
    const url2 = `https://nextdoor.com/api/classifieds?page_from=0&query=${query}&sort_order=2`;
    let data;
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 50,
    });
    const page = await browser.newPage();
    await page.setUserAgent(agent);
    await page.goto(url1, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#id_email');
    await page.type('#id_email', process.env.NEXT_USER);
    await page.keyboard.down('Tab');
    await page.keyboard.type(process.env.NEXT_PW);
    await page.evaluate(() => {
      document.querySelector('#signin_button').click();
    });
    await page.waitFor(4000);
    page.on('response', async (response) => {
      try {
        data = await response.json();
        data = data.classifieds
      } catch (e) {
        console.log(e);
      }
    });
    await page.goto(url2, { waitUntil: 'networkidle2' });
    // const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log(userAgent);
    await browser.close();
    const items = data ? data
      .filter((item) => item.id)
      .filter((item, i) => i < 20)
      .map((item) => {
        return {
          searchTerm: query,
          platform: 'Nextdoor',
          interested: true,
          id: item.id,
          postDate: item.creation_date,
          location: item.author_profile.neighborhood_name,
          itemName: item.title,
          url: item.share_text,
          description: item.description,
          image: item.photo_urls[0] || '../static/placeholder.jpg',
          price: item.price ? parseInt(item.price) * 100 : 'Price N/A'
        };
      }) : [];
    items.forEach(async (item) => {
      try {
        const existingItem = await db.searchResultsNext.findOne({
          postDate: item.postDate,
        });
        if (existingItem) {
          return;
        }
        await db.searchResultsNext.save(item);
      } catch (e) {
        console.log(e);
      }
    });
    return items;
  } catch (e) {
    console.log(e);
  }
};

const seekNextAll = async () => {
  try {
    const searches = await db.searches.find();
    const searchResults = await searches.map((search) =>
      seekNext(search.name)
    );
    await Promise.allSettled(searchResults);
    console.log('Finished with Nextdoor');
  } catch (e) {
    console.log(e);
  }
};

module.exports = seekNextAll;
