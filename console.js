var exec = require('child_process').exec;
function execute(command, callback) {
  exec(command, function (error, stdout, stderr) {
    callback(stdout);
  });
}

//TODO: add ffmpeg path variable
//TODO: add h265 as default
//TODO: add async so you can see the status
//TODO: add default settings from GUI (like width/height chat window)
module.exports.downloadVideoChat = function (vodid, title, callback) {
  execute(
    `TwitchDownloaderCLI -m VideoDownload --id ${vodid} --ffmpeg-path "ffmpeg.exe" -o "output/${vodid}_${title}.mp4"`,
    function (downloadVideoResult) {
      execute(
        `TwitchDownloaderCLI -m ChatDownload --id ${vodid} -o "output/${vodid}_chat.json"`,
        function (downloadChatResult) {
          execute(
            `TwitchDownloaderCLI -m ChatRender -i "output/${vodid}_chat.json" -h 600 -w 350 --framerate 60 --update-rate 1 -o "output/${title}_chat.mp4"`,
            function (renderChatResult) {
              callback({
                downloadVideoResult: downloadVideoResult.replace('\n', ''),
                downloadChatResult: downloadChatResult.replace('\n', ''),
                renderChatResult: renderChatResult.replace('\n', '')
              });
            }
          );
        }
      );
    }
  );
};
