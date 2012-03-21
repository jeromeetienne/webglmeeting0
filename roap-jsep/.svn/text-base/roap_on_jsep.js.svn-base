// Copyright (C) 2012 Google. All rights reserved.
// An implementation of ROAP that builds on JSEP as a substrate.
// This is based on the following drafts:
// draft-uberti-rtcweb-jsep-02 (JSEP)
// draft-jennings-rtcweb-signaling-01 (ROAP)
//
// Liberties have been taken with the APIs, such as using strings
// rather than constants for all state variable values.

// Static variable for allocating new session IDs.
RoapConnection.sessionId = 103;

function RoapConnection(configuration, signalingCallback) {
  var that = this;
  this.peerconnection = new MockJsepPeerConnection(
      "nothing",
      function(candidate, more) {
        that.moreIceComing = more;
        that.markActionNeeded();
      });
  this.sessionId = ++RoapConnection.sessionId;
  this.sequenceNumber = 0;  // Number of last ROAP message sent. Starts at 1.
  this.state = 'new';
  this.actionNeeded = false;
  this.moreIceComing = true;
  this.peerconnection.startIce();
  this.onaddstream = null;
  this.onremovestream = null;
  this.onsignalingmessage = signalingCallback;
  this.peerconnection.onaddstream = function(stream) {
    if (that.onaddstream) {
      that.onaddstream(stream);
    }
  }
  this.peerconnection.onremovestream = function(stream) {
    if (that.onremovestream) {
      that.onremovestream(stream);
    }
  }
}

RoapConnection.prototype.connect = function() {
  this.markActionNeeded();
}

// Signalling messages from the other side.
RoapConnection.prototype.processSignalingMessage = function(msgstring) {
  // Offer: Check for glare and resolve.
  // Answer/OK: Remove retransmit for the msg this is an answer to.
  // Send back "OK" if this was an Answer.
  var msg = JSON.parse(msgstring);
  this.incomingMessage = msg;
  if (this.state === 'new') {
    if (msg.messageType === 'OFFER') {
      // Initial offer.
      this.peerconnection.setRemoteDescription('offer', msg.sdp);
      this.state = 'offer-received';
      // Allow other stuff to happen, then reply.
      this.markActionNeeded();
    } else {
      this.error("Illegal message for this state: "
                 + msg.messageType + " in state " + this.state);
    }
  } else if (this.state === 'offer-sent') {
    if (msg.messageType === 'ANSWER') {
      this.peerconnection.setRemoteDescription('answer', msg.sdp);
      this.sendOK();
      this.state = 'established';
    } else if (msg.messageType === 'pr-answer') {
      this.peerconnection.setRemoteDescription('pr-answer', msg.sdp);
      // No change to state, and no response.
    } else if (msg.messageType === 'offer') {
      // Glare processing.
      this.error("Not written yet");
    } else {
      this.error("Illegal message for this state: "
                 + msg.messageType + " in state " + this.state);
    }
  } else if (this.state === 'established') {
    if (msg.messageType === 'OFFER') {
      // Subsequent offer.
      this.peerconnection.setRemoteDescription('offer', msg.sdp);
      this.state = 'offer-received';
      // Allow other stuff to happen, then reply.
      this.markActionNeeded();
    } else {
      this.error("Illegal message for this state: "
                 + msg.messageType + " in state " + this.state);
    }
  }
}

// Adding streams - this causes signalling to happen, if needed.
RoapConnection.prototype.addStream = function(stream) {
  this.peerconnection.addStream(stream);
  this.markActionNeeded();
}

RoapConnection.prototype.removeStream = function(stream) {
  for (i = 0; i < this.localStreams.length; ++i) {
    if (localStreams[i] === stream) {
      localStreams[i] = null;
    }
  }
  this.markActionNeeded();
}

// Internal function: Mark that something happened.
RoapConnection.prototype.markActionNeeded = function() {
  this.actionNeeded = true;
  var that = this; // make this available in closure.
  // Post an event to myself so that I get called a while later.
  // (needs more JS/DOM info. Just call the processing function on a delay
  // for now.)
  window.setTimeout(function() {
      that.onstablestate();
    },
    1);
}

// Internal function for the RoapConnection: Called when a stable state
// is entered by the browser (to allow for multiple AddStream calls or
// other interesting actions).
// This function will generate an offer or answer, as needed, and send
// to the remote party using our onsignalingmessage function.
RoapConnection.prototype.onstablestate = function() {
  var mySDP;
  var roapMessage = {};
  // Don't do anything until we have the ICE candidates.
  if (this.moreIceComing) {
    return;
  }
  if (this.actionNeeded) {
    if (this.state === 'new' || this.state === 'established') {
      // Need to send an offer.
      mySDP = this.peerconnection.createOffer();
      if (mySDP === this.peerconnection.localDescription) {
        // No change needed. Ignore.
        return;
      }
      this.peerconnection.setLocalDescription('offer', mySDP);
      this.sendMessage("OFFER", mySDP.toSdp());
      // Not done: Retransmission on non-response.
      this.state = 'offer-sent';
    } else if (this.state === 'offer-received') {
      mySDP = this.peerconnection.createAnswer();
      this.peerconnection.setLocalDescription('answer', mySDP);
      // Fill in IDs and all that.
      this.sendMessage("ANSWER", mySDP.toSdp());
      this.state = 'established';
    } else {
      this.error("Dazed and confused in state " + this.state +
                 ", stopping here");
    }
    this.actionNeeded = false;
  }
}

RoapConnection.prototype.sendOK = function() {
  this.sendMessage("OK");
}

RoapConnection.prototype.sendMessage = function(operation, sdp) {
  var roapMessage = {};
  roapMessage.messageType = operation;
  roapMessage.sdp = sdp;  // may be null or undefined
  if (operation === "OFFER") {
    roapMessage.offererSessionId = this.sessionId;
    roapMessage.answererSessionId = this.otherSessionId;  // may be null
    roapMessage.seq = ++this.sequenceNumber;
    // The tiebreaker needs to be neither 0 nor 429496725.
    roapMessage.tiebreaker = Math.floor(Math.random() * 429496723 + 1);
  } else {
    roapMessage.offererSessionId = this.incomingMessage.offererSessionId;
    roapMessage.answererSessionId = this.sessionId;
    roapMessage.seq = this.incomingMessage.seq;
  }
  this.onsignalingmessage(JSON.stringify(roapMessage));
}

// Internal something-bad-happened function.
RoapConnection.prototype.error = function(text) {
  throw "Error in RoapOnJsep: " + text;
}
