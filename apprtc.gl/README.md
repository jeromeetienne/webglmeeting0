## Note taken on apprtc:

* html containes numerous templates
  * they are changed by the server while delivering the file
  * not too clean
    * does it worth changing tho
  * {{ token }} == related to channel
* "channel" in the source is the websocket from google appengine

## initialisation
* this app is all about initialisation
  * once it is initialized, it is running on its own
  
  
# quick patch
* can i plug the webgl on top quickly ?
  * like i launch his init
  * i launch mine
  * then what is viewable on screen is only a matter of css
  * so the video element are hidden
  * the webgl canvas take fullscreen
  * seems possible
* how to handle the no-webrtc case
  * it can be a total nogo splash
  * here webrtc is the point.
  * you dont have it, it has no point
* so most of the original index.html remains the same
  * put the webgl in its own javascript