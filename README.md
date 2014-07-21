# \[loveMachine\] 
\[loveMachine\] **likes** everything your friends do on Facebook  
http://lovemachine.cc

## Overview
Basically, it will log into your Facebook account and click on "every" possible like link on your home news stream. Yes, that means the 'like' under every comments also. (It is not 100% accurate. Experience has shown that it might miss some. But it does the trick.)

## Intention
Since most of my fb_friends feel flattered, empowered, loved,... when they receive a 'like' for their actions on facebook, I thought I might automate some love giving and distribute 'likes' to my friends in a more efficient way. Or have I just created the first like-spamming application?

## Usage
`casperjs lovemachine.js --email=<the-email-you-use-for-fb-login> --password=<your-facebook-password>`

(On Windows, if that doesn't work, you may want to change 'casperjs' to casperjs_directory\casperjs.)

## History
This project has started a couple years ago and was first done in Python using Selenium Webdriver with the intention of working as a standalone server application. But for some reason, it never reached that stage because having a chromeless firefox behaving like a desktop one with selenium on top of it, was something I could not achieve. 

So earlier 2013, the project was rewritten in javascript using phantomjs and casperjs and this somehow was much more easier.

### July 2014

 * A first [pull request](https://github.com/xuv/loveMachine/pull/2) by [Anne Li](https://github.com/lianna5), provides a .bat script for easier installation on Windows.
 * [Andrew Nakas](https://github.com/andrewnakas) came with the idea to use the mobile verison of Facebook as a fix for the problem of the "regular" Facebook removing "likes" on posts a minute after they been clicked by the [loveMachine]. 

## Requirements
casperjs, phantomjs and a facebook account

## Installation

### Windows
Running install.bat will download and install phantomjs and casperjs to current directory, if you don't already have them on your machine.

## Notes
All project notes are available there for now: <http://w.xuv.be/projects/love_machine>

## Feedback
If you are interested in this application or have been testing it, please contact the author by email: juego [at] requiem4tv [dot] com
