# WebsUpTV 

![](https://i.ibb.co/q5Hy7x4/foto-no-exif-1.jpg)
![](https://i.ibb.co/crkwTnF/foto-no-exif.jpg)

A Node.js application, written for Windows, that displays various web widgets over any Android TV OS application.

State of development - the application is in early development and is not yet suggested for daily use, currently working through PlexUp integration

## Requirements 
- Windows PC - Tested with Windows 10, should work on any Windows PC
  - Install [Node.js](https://nodejs.org/en/download/)
  - Install Node NPM
  - Download and configure WebsUpTV
- Android TV - Tested with NVIDIA Shield TV (v2015)
  - Mouse higly recommended to access all features
  - Install [PiPupTransparent](https://github.com/my-ugly-code/PiPupTransparent/releases)

## Features
- [PlexUp](https://github.com/my-ugly-code/WebsUpTV/blob/main/README.md#plexup) - shows actors/roles from your now-playing [Plex](https://play.google.com/store/apps/details?id=com.plexapp.android&hl=en_US&gl=US) media, either on-demand, or automatically when you pause.
- Coming Next - Song Id, Sports, Weather, News, Security Cameras...what else should we add?

## Feature Requirements
- PlexUp - PlexPass ($$), Plex Media Server

## Setup
I'll try to get a better guide here soon, but here's the quick setup guide
- Configure Plex
  - Plex Settings > Settings > Network - Check 'Enable Webhooks' (bottom of page), and set Secure connections to "Preferred" (top of page) - hoping we can find a way around this, but it's a must for now. You can add your TV (and any PCs you are dev'ing on) to the "List of IP addresses and networks that are allowed without auth" whitelist on the same page. I also disabled "Allow media deletion" when I set this, but those are optional.
  - Plex Settings > Webhooks - create a webhook in the format http://<WebsUpTV PC IP>:8400/plex. Eg. http://192.168.1.209:8400/plex
 
- Configure WebsUpTV
  - Pull this repo, or download and unzip. Open the config/config.json file in Notepad or another editor, complete the config file and save.
  - From the root directory of WebsUpTV, Open a PowerShell window (shift + right click), and run "npm install". If everything installs correctly, run "npm start" next. If this doesn't work, be sure you have NPM installed correctly.
  
  
 ### Misc Notes
  - When actors are visible, use your mouse to hover over a card, click the button on the card back to display movie/TV credits for that actor.
  - If the overlay is 'stuck' on your TV, move the cursor to the top-left corner of your screen and click the red triange that appears.
  - You can view the overlay data on any other local browser - the urls are displayed in PowerShell when the application starts or restarts.
  - You can manually trigger the overlay by sending a http request to PiPup directly - this can be done in apps like Button Mapper. You can set the duration to whatever you'd like, if you need to remove the overlay before the timer expires, use the red triangle (top-left corner) or send another request with duration set to 0. The first step of displaying the overlay is to clear any existing overlays.
  - The app uses no highly complex code - feel free to play around, make it look different, add more info. Show me what you've done and we can merge in anything cool that maintains existing functionality!!
  - Feel free to report any issues to are specific to WebsUpTV. If it's a general questions (ie. How do I install Node?), just Google or YouTube it and you'll get your answer much faster :)
  
