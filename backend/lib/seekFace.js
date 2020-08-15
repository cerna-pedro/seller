const db = require('diskdb');
const fetch = require('node-fetch');

db.connect('./db', ['searches', 'searchResultsFacebook']);

const seekFace = async (
  query = 'bicycle',
  lat = 29.759216308594,
  lng = -95.366821289062
) => {
  try {
    const url = `https://www.facebook.com/api/graphql/`;
    const variables = {
      params: {
        bqf: { callsite: 'COMMERCE_MKTPLACE_WWW', query },
        browse_request_params: {
          // commerce_enable_local_pickup: true,
          // commerce_enable_shipping: true,
          // commerce_search_and_rp_category_id: [],
          // commerce_search_and_rp_condition: null,
          // commerce_search_and_rp_ctime_days: null,
          filter_location_latitude: lat,
          filter_location_longitude: lng,
          filter_price_lower_bound: 0,
          filter_price_upper_bound: 214748364700,
          // filter_radius_km: 65,
          commerce_search_sort_by: 'CREATION_TIME_DESCEND',
        },
        custom_request_params: {
          // contextual_filters: [],
          // saved_search_strid: null,
          search_vertical: 'C2C',
          // seo_url: null,
          surface: 'SEARCH',
          // virtual_contextual_filters: [],
        },
      },
    };
    const response = await fetch(url, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: `variables=${JSON.stringify(variables)}&doc_id=2760313464070848`,
      method: 'POST',
      mode: 'cors',
    });
    const data = await response.json();
    const items = data
      ? data.data.marketplace_search.feed_units.edges
          .filter((item, i) => i < 20)
          .map((edge) => {
            return {
              searchTerm: query,
              platform: 'Facebook',
              interested: true,
              id: edge.node.listing.id,
              postDate: 'N/A',
              location:
                edge.node.listing.location.reverse_geocode.city_page
                  .display_name,
              itemName: edge.node.listing.marketplace_listing_title,
              url: edge.node.listing.story.url,
              description: 'N/A',
              image:
                edge.node.listing.primary_listing_photo.image.uri ||
                '../static/placeholder.jpg',
              price:
                parseInt(
                  edge.node.listing.formatted_price.text
                    .replace('$', '')
                    .replace(',', '')
                ) * 100,
            };
          })
      : [];
    items.forEach(async (item) => {
      try {
        const existingItem = await db.searchResultsFacebook.findOne({
          id: item.id,
        });
        if (existingItem) {
          return;
        }
        await db.searchResultsFacebook.save(item);
      } catch (e) {
        console.log(e);
      }
    });
    return items;
  } catch (e) {
    console.log(e);
  }
};

const seekFaceAll = async () => {
  try {
    let searches = await db.searches.find();
    if (searches.length < 1) {
      await db.searches.save({
        name: 'bicycle',
        lat: 29.759216308594,
        lng: -95.366821289062,
      });
      searches = await db.searches.find();
    }
    const searchResults = await searches.map((search) =>
      seekFace(search.name, search.lat, search.lng)
    );
    await Promise.allSettled(searchResults);
    console.log('Finished with Facebook');
  } catch (e) {
    console.log(e);
  }
};

module.exports = seekFaceAll;
