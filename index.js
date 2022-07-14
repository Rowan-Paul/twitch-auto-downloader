const cron = require('node-cron');
const fetch = require('node-fetch');
const cmd = require('node-cmd');
require('dotenv').config();
const fs = require('fs');

async function main() {
  console.log('Starting...');
  const { access_token } = await getBearerToken();
  const videos = await getVideos(access_token);

  console.log(`\nFound ${videos.data.length} streams, starting download. This might take a while`);

  let downloadedFiles = fs.readdirSync('./output');

  console.log('\ni ID         Title');
  videos.data.forEach((video, i) => {
    console.log(`${minTwoDigits(i + 1)} ${video.url.match(/([0-9]{10})/g)[0]} ${video.title}`);
  });
  console.log('\n');

  videos.data.forEach((video, i) => {
    const vodid = video.url.match(/([0-9]{10})/g)[0];
    const title = video.title;

    if (!downloadedFiles.includes(`${vodid}_${title}.mp4`)) {
      downloadVideo(vodid, title, i);
    } else {
      console.log(`Stream #${i + 1} ${vodid} already downloaded, going to the next stream`);
    }
    if (!downloadedFiles.includes(`{vodid}_${title}_chat.json`)) {
      downloadAndRenderChat(vodid, title, downloadedFiles, i);
    } else {
      console.log(`Stream chat #${i + 1} ${vodid} already downloaded, going to the next stream`);
    }
  });
}

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

async function downloadVideo(vodid, title, i) {
  cmd.run(
    `TwitchDownloaderCLI -m VideoDownload --id ${vodid} --ffmpeg-path "ffmpeg.exe" -o "output/${vodid}_${title}.mp4"`,
    function (err, data, stderr) {
      if (err) {
        console.log(err);
      }
      console.log(`Finished downloading video #${i + 1} for ${vodid}`);
    }
  );
  // .stdout.on('data', (data) => console.log(data));
}

async function downloadAndRenderChat(vodid, title, downloadedFiles, i) {
  cmd.run(
    `TwitchDownloaderCLI -m ChatDownload --id ${vodid} -o "output/${vodid}_chat.json"`,
    function (err, data, stderr) {
      if (err) {
        console.log(err);
      }
      console.log(`Finished downloading chat #${i + 1} for ${vodid}`);
      if (!downloadedFiles.includes(`{vodid}_${title}_chat.mp4`)) renderChat(vodid, title, i);
    }
  );
  // .stdout.on('data', (data) => console.log(data));
}

//TODO: fix emoji file in use error
async function renderChat(vodid, title, id) {
  cmd.run(
    `TwitchDownloaderCLI -m ChatRender -i "output/${vodid}_chat.json" -h 300 -w 350 --framerate 60 --update-rate 1 -o "output/${vodid}_${title}_chat.mp4"`,
    function (err, data, stderr) {
      if (err) {
        console.log(err);
      }
      console.log(`Finished rendering chat ${i + 1} for ${vodid}`);
    }
  );
  // .stdout.on('data', (data) => console.log(data));
}

function minTwoDigits(n) {
  return (n < 10 ? '0' : '') + n;
}

cron.schedule('0 1 * * *', async function () {
  main();
});
