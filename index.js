const cron = require('node-cron');
const fetch = require('node-fetch');
require('dotenv').config();

//TODO: fetch videos from channel
//TODO: save video to disk
//TODO: check if disk has video
//TODO: add database with logs
//TODO: display logs somewhere

async function temp() {
  console.log('Starting...');
  const { access_token } = await getBearerToken();
  console.log('Access token: ', access_token);
  const videos = await getVideos(access_token);
  console.log('Videos: ', videos);
}

// cron.schedule('0 12 * * *', async function () {
// });

//TODO: only refetch when the old token is expired
async function getBearerToken() {
  console.log('Getting bearer token...');
  let headersList = {
    Accept: '*/*',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: headersList
    }
  ).then(function (response) {
    return response.json();
  });

  return res;
}

async function getVideos(bearer) {
  console.log('Getting videos...');
  let headersList = {
    Accept: '*/*',
    'Client-Id': process.env.CLIENT_ID,
    Authorization: `Bearer ${bearer}`
  };

  const res = await fetch(`https://api.twitch.tv/helix/videos?user_id=${process.env.USER_ID}`, {
    method: 'GET',
    headers: headersList
  }).then(function (response) {
    return response.json();
  });

  return res;
}

temp();
