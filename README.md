# webos-stopwatch
A simple stopwatch for Palm/HP webOS

Includes modes for counting up, with lap support, and counting down from a set time, with a customizable alarm at the end.

Chronicling my trial-and-error through simple webOS development here:
https://forums.webosnation.com/webos-development/332259-fumbling-my-way-through-webos-development-scratch-2018-a.html

<img src="https://raw.githubusercontent.com/codepoet80/webos-stopwatch/master/screenshot.png" height="400" alt="Stopwatch Screenshot">

## change-log
- 0.0.7 - Initial experimental release
- 0.1.1 - Both modes mostly working
- 0.1.3 - Resolves an issue where timer wouldn't reset in certain launch situtations
- 1.0.0 - Stopwatch now survives the app being killed and re-launched, laps survive scene changes
- 1.0.1 - Support really long stopwatch times
- 1.0.2 - Selectable alarm sound in timer!
- 1.0.3 - Bug fixes for long timer value
- 1.0.4 - Add support for My Watch to notify a Pebble when a timer finishes.
- 1.1.0 - Release to AppMuseum, future release notes can be found there

## What is This?

This is an app for the defunct mobile webOS platform, made by Palm and later acquired by HP. It runs on devices like the Palm Pre or Pixi, or the HP
Pre3 or TouchPad. 

webOS technology was acquired by LG and repurposed for TVs and IoT devices, but they made significant changes and this app will not run on those platforms.

Releases of this app, and many other new and restored apps, can be found in the [webOS Archive App Museum](http://appcatalog.webosarchive.com).

## Why?

Aside from being a fan of the platform, the author thinks consumers have lost out now that the smart phone ecosystem has devolved into a duopoly.
Apple and Google take turns copying each other, and consumers line up to buy basically the same new phone every year. The era when webOS, Blackberry and 
Windows Phone were serious competitors was marked by creativity in form factor and software development, which has been lost. This app represents a (futile)
attempt to keep webOS mobile devices useful for as long as possible.

The website [http://www.webosarchive.com](http://www.webosarchive.com) recovers, archives and maintains material related to development, and hosts services
that restore functionality to webOS devices. A small but active [community](http://www.webosarchive.com/discord) of users take advantage of these services to keep their retro devices alive.

## How?

Mobile webOS was truly a web-derived platform. Based on Linux, and able to run properly compiled Linux binaries, developers could get raw resources access (including GPU) through a PDK (Plug-in Development Kit) but most apps were written in some flavor of Javascript, interacting with a WebKit-based browser. The toolkits were heavily optimized for the devices, and web-based apps usually felt pretty close to native. Services could be written using NodeJS and talk to each other through API calls structured to look like web service calls. App front-ends were usually written in either the Mojo (pre-tablet) or Enyo (tablet and newer phones) Javascript frameworks. Enyo apps can often be run with only minor modification in any WebKit based browser (eg: Safari or Chrome).

You can learn more about these frameworks at the restored [SDK](http://sdk.webosarchive.com).

webOS devices can be found cheaply on eBay, and while the phones will cease to be useful as phones when the 3G shutdown is through, both the phones and the Touchpad can be used around the home for a variety of [fun and useful things](http://www.webosarchive.com/docs/thingstotry/).

If you have a device, instructions for activating, getting online and getting apps installed can be found in the [webOS Archive Docs section](http://www.webosarchive.com/docs/activate/).
