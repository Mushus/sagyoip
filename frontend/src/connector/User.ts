import Connector, { Answer } from '~/connector/Connector';
import Peer from '~/connector/Peer';

export default class User {
  private _isMe: boolean;
  private _id: number;
  private _name: string;
  private _connector: Connector;
  private _sender: Peer | null = null;
  private _receiver: Peer | null = null;
  private _stream: MediaStream | null = null;

  onupdate: ((user: User) => any) | null = null;

  constructor(con: Connector, id: number, name: string, isMe: boolean) {
    this._id = id;
    this._name = name;
    this._isMe = isMe;
    this._connector = con;
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

  async openBroadcast(stream: MediaStream) {
    if (this.isMe) return;

    this.closeBroadcast();

    const sender = new Peer(candidate => this.sendIceCandidate(candidate));
    this._sender = sender;
    sender.startSendConnection(stream, description => this.sendOffer(description));
  }

  closeBroadcast() {
    if (this.isMe) return;
    if (!this._sender) return;

    this._sender.close();
    this._sender = null;
  }

  offer(description: RTCSessionDescription) {
    const receiver = new Peer(iceCandidate => this.sendIceCandidate(iceCandidate));
    this._receiver = receiver;
    receiver.startReceiveConnection(
      description,
      description => this.sendAnswer(description),
      stream => this.updateStream(stream),
    );
    receiver.onClose = status => {
      if (status === 'failed' || status === 'closed') {
        this.closeReceiver();
      }
    };
  }

  iceCandidate(iceCandidate: RTCIceCandidate) {
    this._sender && this._sender.addCandidate(iceCandidate);
    this._receiver && this._receiver.addCandidate(iceCandidate);
  }

  closeReceiver() {
    if (!this._receiver) return;
    this._receiver.close();
    this._receiver = null;
  }

  close() {
    this.closeReceiver();
    this.closeBroadcast();
  }

  private async sendOffer(description: RTCSessionDescriptionInit): Promise<RTCSessionDescription> {
    await this._connector.sendOffer(this.id, description);

    const answer = await new Promise<RTCSessionDescription>(resolve => {
      this._connector.on<Answer>('answer', ({ from, description }) => {
        if (from !== this.id) return;
        resolve(description);
      });
    });

    return answer;
  }

  private async sendAnswer(description: RTCSessionDescriptionInit) {
    await this._connector.sendAnswer(this.id, description);
  }

  private async sendIceCandidate(iceCandidate: RTCIceCandidate) {
    await this._connector.sendCandidate(this.id, iceCandidate);
  }

  private updateStream(stream: MediaStream | null) {
    this._stream = stream;
    this.onupdate && this.onupdate(this);
  }

  get stream() {
    return this._stream;
  }
}
