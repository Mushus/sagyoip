const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

type SendIceCandidate = (candidate: RTCIceCandidate) => Promise<void>;
type OfferFunc = (description: RTCSessionDescriptionInit) => Promise<RTCSessionDescription>;
type AnswerFunc = (description: RTCSessionDescriptionInit) => Promise<void>;
type UpdateStreamFunc = (stream: MediaStream) => any;

export default class Peer {
  private readonly _peer: RTCPeerConnection;
  private _onClose: ((state: RTCPeerConnectionState) => any) | null | undefined;

  constructor(sendCandidate: SendIceCandidate) {
    const peer = new RTCPeerConnection(config);
    peer.onicecandidate = e => {
      e.candidate && sendCandidate(e.candidate);
    };

    this._peer = peer;
  }

  addCandidate(candidate: RTCIceCandidate) {
    this._peer.addIceCandidate(candidate);
  }

  async startReceiveConnection(
    offer: RTCSessionDescription,
    requestAnswer: AnswerFunc,
    updateStream: UpdateStreamFunc,
  ) {
    const peer = this._peer;

    peer.ontrack = e => {
      const stream = e.streams.find(() => true);
      stream && updateStream(stream);
    };

    peer.onconnectionstatechange = () => {
      const connectionState = this._peer.connectionState;
      this._onClose && this._onClose(connectionState);
    };

    try {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await requestAnswer(answer);
    } catch (e) {
      console.error(e);
    }
    console.log('receiver connection ok');
  }

  async startSendConnection(stream: MediaStream, requestOffer: OfferFunc) {
    const peer = this._peer;

    const tracks = stream.getVideoTracks();
    tracks.forEach(track => peer.addTrack(track, stream));
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const answer = await requestOffer(offer);
      await peer.setRemoteDescription(answer);
    } catch (e) {
      console.error(e);
    }
    console.log('send connection ok');
  }

  close() {
    this._peer.close();
    this._peer.onconnectionstatechange = null;
  }

  set onClose(value: ((state: RTCPeerConnectionState) => any) | null) {
    this._onClose = value;
  }
}
