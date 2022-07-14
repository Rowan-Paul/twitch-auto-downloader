const cron = require('node-cron');
const fetch = require('node-fetch');
const cmd = require('node-cmd');
require('dotenv').config();
const fs = require('fs');

//TODO: check if disk has video
//TODO: add database with logs
//TODO: display logs somewhere
//TODO: add ffmpeg path variable
//TODO: add h265
async function temp() {
  console.log('Starting...');
  const { access_token } = await getBearerToken();
  console.log('Access token: ', access_token);

  const videos = await getVideos(access_token);
  console.log('Videos: ', videos);

  console.log(`Found ${videos.data.length} streams, downloading now`);
  videos.data.forEach((video) => {
    const vodid = video.url.match(/([0-9]{10})/g)[0];
    const title = video.title;
    console.log(`VOD id+title: ${vodid}_${title}`);

    let downloadedFiles = [];
    fs.readdir('./output', (err, files) => {
      files.forEach((file) => {
        downloadedFiles.push(file);
      });
    });

    if (!downloadedFiles.includes(`${vodid}_${title}.mp4`)) {
      cmd
        .run(
          `TwitchDownloaderCLI -m VideoDownload --id ${vodid} --ffmpeg-path "ffmpeg.exe" -o "output/${vodid}_${title}.mp4"`,
          function (err, data, stderr) {
            console.log('Finished');
          }
        )
        .stdout.on('data', (data) => console.log(data));
      cmd
        .run(
          `TwitchDownloaderCLI -m ChatDownload --id ${vodid} -o "output/${vodid}_chat.json"`,
          function (err, data, stderr) {
            console.log('Finished');
          }
        )
        .stdout.on('data', (data) => console.log(data));
      cmd
        .run(
          `TwitchDownloaderCLI -m ChatRender -i "output/${vodid}_chat.json" -h 600 -w 350 --framerate 60 --update-rate 1 -o "output/${vodid}_${title}_chat.mp4"`,
          function (err, data, stderr) {
            console.log('Finished');
          }
        )
        .stdout.on('data', (data) => console.log(data));
    } else {
      console.log('Stream already downloaded');
    }

    console.log('===');
  });
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
