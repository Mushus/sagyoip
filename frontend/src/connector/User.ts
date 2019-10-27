import Connector from '~/connector/Connector';

const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default class User {
  private _isMe: boolean;
  private _id: number;
  private _name: string;
  private _connector: Connector;
  private _peer: RTCPeerConnection | null;
  private _localVideoSender: RTCRtpSender | null = null;
  private _localAudioSender: RTCRtpSender | null = null;
  private _remoteDisplayStream: MediaStream | null = null;
  private _localMicSender: RTCRtpSender | null = null;
  private _remoteMicStream: MediaStream | null = null;

  onupdate: ((user: User) => any) | null = null;

  constructor(con: Connector, id: number, name: string, isMe: boolean) {
    this._id = id;
    this._name = name;
    this._isMe = isMe;
    this._connector = con;

    if (isMe) return;

    const peer = new RTCPeerConnection(config);

    peer.onicecandidate = e => {
      console.log('iceCandidate: %o', e);
      e.candidate && con.sendCandidate(id, e.candidate);
    };

    peer.ontrack = e => {
      console.log('track: %o', e);
      this.updateRemoteStream(e.streams);
    };

    this._peer = peer;
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get isMe() {
    return this._isMe;
  }
  get remoteDisplayStream() {
    return this._remoteDisplayStream;
  }
  get remoteMicStream() {
    return this._remoteMicStream;
  }

  async attachDisplayStream(stream: MediaStream | null) {
    if (!this._peer) return;

    console.log('attachDisplayStream: %o', stream);

    let videoTrack: MediaStreamTrack | undefined;
    let audioTrack: MediaStreamTrack | undefined;

    if (stream) {
      videoTrack = stream.getVideoTracks().find(() => true);
      audioTrack = stream.getAudioTracks().find(() => true);
    }

    if (this._localVideoSender) {
      // HACK: trackが一緒だからとstreamに属してるとは限らないがそういうものだと仮定する
      if (videoTrack) {
        await this._localVideoSender.replaceTrack(videoTrack);
      } else {
        this._peer.removeTrack(this._localVideoSender);
        this._localVideoSender = null;
      }
    } else {
      if (videoTrack && stream) {
        this._localVideoSender = this._peer.addTrack(videoTrack, stream);
      }
    }

    console.log('audio track add: %o', audioTrack);
    if (this._localAudioSender) {
      // HACK: trackが一緒だからとstreamに属してるとは限らないがそういうものだと仮定する
      if (audioTrack) {
        await this._localAudioSender.replaceTrack(audioTrack);
      } else {
        this._peer.removeTrack(this._localAudioSender);
        this._localAudioSender = null;
      }
    } else {
      if (audioTrack && stream) {
        this._localAudioSender = this._peer.addTrack(audioTrack, stream);
      }
    }
  }

  async attachMicStream(stream: MediaStream | null) {
    if (!this._peer) return;

    console.log('attachMicStream: %o', stream);

    let micTrack: MediaStreamTrack | undefined;

    if (stream) {
      micTrack = stream.getAudioTracks().find(() => true);
    }

    if (this._localMicSender) {
      // HACK: trackが一緒だからとstreamに属してるとは限らないがそういうものだと仮定する
      if (micTrack && stream) {
        await this._localMicSender.replaceTrack(micTrack);
      } else {
        this._peer.removeTrack(this._localMicSender);
        this._localMicSender = null;
      }
    } else {
      if (micTrack && stream) {
        this._localMicSender = this._peer.addTrack(micTrack, stream);
      }
    }
  }

  async startPeer(userId: number) {
    console.log('start peer %o, %o', userId, this.id);
    const peer = this._peer;
    if (!peer) return;

    try {
      // id によって Send するか Receive するか決める
      if (userId > this.id) return;

      console.log('start peer ok %o, %o', userId, this.id);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      this._connector.sendOffer(this.id, offer);
    } finally {
      peer.onnegotiationneeded = async e => {
        console.log('negotiationneeded: %o', e);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        this._connector.sendOffer(this.id, offer);
      };
    }
  }

  async receiveIceCandidate(iceCandidate: RTCIceCandidate) {
    const peer = this._peer;
    if (!peer) return;

    console.log('receiveIceCandidate %o', peer);
    await peer.addIceCandidate(iceCandidate);
  }

  async receiveOffer(offer: RTCSessionDescription) {
    const peer = this._peer;
    if (!peer) return;

    console.log('receiveOffer %o', peer);

    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    this._connector.sendAnswer(this.id, answer);
  }

  async receiveAnswer(answer: RTCSessionDescriptionInit) {
    const peer = this._peer;
    if (!peer) return;
    console.log(answer);
    await peer.setRemoteDescription(answer);
  }

  close() {
    this._peer && this._peer.close();
  }

  private updateRemoteStream(streams: readonly MediaStream[]) {
    const displayStream = streams.find(stream => stream.getVideoTracks().length > 0);
    const micStream = streams.find(stream => stream.getVideoTracks().length === 0);
    this._remoteDisplayStream = displayStream || null;
    this._remoteMicStream = micStream || null;

    this.onupdate && this.onupdate(this);
  }
}
