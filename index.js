const cron = require('node-cron');
const fetch = require('node-fetch');
const cmd = require('node-cmd');
require('dotenv').config();
const fs = require('fs');

cron.schedule('0 12 * * *', async function () {
  console.log('Starting...');
  const { access_token } = await getBearerToken();
  const videos = await getVideos(access_token);

  console.log(`\nFound ${videos.data.length} streams, starting download. This might take a while`);

  let downloadedFiles = fs.readdirSync('./output');

  console.log('\nID         Title');
  videos.data.forEach((video, i) => {
    const vodid = video.url.match(/([0-9]{10})/g)[0];
    const title = video.title;

    console.log(`${vodid} ${title}`);

    if (!downloadedFiles.includes(`${vodid}_${title}.mp4`)) {
      downloadVideo(vodid, title);
      downloadAndRenderChat(vodid, title);
    } else {
      console.log(`\nStream #${vodid} already downloaded, going to the next stream`);
    }
  });
});

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

async function downloadVideo(vodid, title) {
  cmd.run(
    `TwitchDownloaderCLI -m VideoDownload --id ${vodid} --ffmpeg-path "ffmpeg.exe" -o "output/${vodid}_${title}.mp4"`,
    function (err, data, stderr) {
      if (err) {
        console.log(err);
      }
      console.log(`Finished downloading video for ${vodid}`);
    }
  );
  // .stdout.on('data', (data) => console.log(data));
}

async function downloadAndRenderChat(vodid, title) {
  cmd.run(
    `TwitchDownloaderCLI -m ChatDownload --id ${vodid} -o "output/${vodid}_chat.json"`,
    function (err, data, stderr) {
      if (err) {
        console.log(err);
      }
      console.log(`\nFinished downloading chat for ${vodid}`);
      renderChat(vodid, title);
    }
  );
  // .stdout.on('data', (data) => console.log(data));
}

async function renderChat(vodid, title) {
  cmd.run(
    `TwitchDownloaderCLI -m ChatRender -i "output/${vodid}_chat.json" -h 600 -w 350 --framerate 60 --update-rate 1 -o "output/${vodid}_${title}_chat.mp4"`,
    function (err, data, stderr) {
      if (err) {
        console.log(err);
      }
      console.log(`Finished rendering chat for ${vodid}`);
    }
  );
  // .stdout.on('data', (data) => console.log(data));
}

temp();
