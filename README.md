# Automatically download new Twitch VODs

This application allows you to automatically download all new VODs from a channel including the chat. This application relies on [lay295/TwitchDownloader](https://github.com/lay295/TwitchDownloader) to download & render the video and chat. In order to use this you need to add the CLI version of TwitchDownloader and the ffmpeg application into the root of the project.

The application runs everyday at 1:00 and starts by requesting a bearer token from Twitch and then requesting all videos from a channel. It then loops over all streams and downloads them if they don't exist in the output folder already.

### Plans

I plan to add a few things in the future:

- Save the Twitch bearer token somewhere so you only need to fetch a new one when it has expird
- Add maximum age for videos
- Path variables for ffmpeg & TwitchDownloader so you can use an already existing installation
- Default to H265 for video rendering (TwitchDownloader already supports this)
- Add a logging dashboard where you can view logs
- Frontend where you can use a GUI to set the interval and channels to look for
