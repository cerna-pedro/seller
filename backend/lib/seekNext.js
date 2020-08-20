require('dotenv').config();
const fs = require('fs');
const db = require('diskdb');
const puppeteer = require('puppeteer');
const randomUserAgent = require('random-useragent');

db.connect('./db', ['searches', 'searchResultsNext']);

const seekNext = async (query = 'bicycle') => {
  try {
    const agent = randomUserAgent.getRandom();
    const url1 = `https://nextdoor.com/login/`;
    const url2 = `https://nextdoor.com/api/classifieds?page_from=0&query=${query}&sort_order=2`;
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
    });
    const page = await browser.newPage();
    await page.setUserAgent(agent);
    let dateToCompare;
    let existingCookies;
    try {
      const cookiesString = await fs.readFileSync('./cookies.json');
      existingCookies = JSON.parse(cookiesString);
      dateToCompare =
      existingCookies.find((cookie) => cookie.name === 'flaskTrackReferrer')
      .expires * 1000;
    } catch (e) {
      dateToCompare = 0;
    }
    if (Date.now() >= dateToCompare) {
      await page.goto(url1, { waitUntil: 'networkidle2' });
      await page.waitForSelector('#id_email');
      await page.type('#id_email', process.env.NEXT_USER);
      await page.keyboard.down('Tab');
      await page.keyboard.type(process.env.NEXT_PW);
      await page.evaluate(() => {
        document.querySelector('#signin_button').click();
      });
      await page.waitFor(4000);
      const cookies = await page.cookies();
      await fs.writeFileSync('./cookies.json', JSON.stringify(cookies));
    } else {
      await page.setCookie(...existingCookies);
    }
    await page.goto(url2, { waitUntil: 'networkidle2' });
    const data = await page.evaluate(() => {
      const jsonEl = document.querySelector('pre');
      if (jsonEl) {
        const jsonText = jsonEl.textContent;
        const parsedData = JSON.parse(jsonText);
        return parsedData.classifieds;
      }
      return;
    });
    // const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log(userAgent);
    await browser.close();
    const items = data
      ? data
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
              price: item.price ? parseInt(item.price) * 100 : 'Price N/A',
            };
          })
      : [];
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
    const searchResults = await searches.map((search) => seekNext(search.name));
    await Promise.allSettled(searchResults);
    console.log('Finished with Nextdoor');
  } catch (e) {
    console.log(e);
  }
};

module.exports = seekNextAll;
