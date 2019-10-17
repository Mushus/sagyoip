import { EventEmitter } from 'events';

export interface EventUser {
  id: number;
  name: string;
}

export interface Event<T extends string, P> {
  type: T;
  payload: P;
}

export type UpdateUsers = Event<'updateUsers', { users: ReadonlyArray<EventUser> }>;
export type MyUser = Event<'myUser', { myId: number }>;
export type Offer = Event<'offer', { from: number; description: RTCSessionDescription }>;
export type Answer = Event<'answer', { from: number; description: RTCSessionDescription }>;
export type IceCandidate = Event<'iceCandidate', { from: number; iceCandidate: RTCIceCandidate }>;

export type Events = UpdateUsers | MyUser | Offer | Answer | IceCandidate;
export type EventListener<T extends Events> = (payload: T['payload']) => any;

const WsUrl =
  process.env.WS_URL || `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.hostname}:${location.port}/ws`;

export default class Connector {
  private _connection: WebSocket;
  private _emitter = new EventEmitter();

  constructor(roomId: string, userName: string) {
    const params = new URLSearchParams({ userName });
    this._connection = new WebSocket(`${WsUrl}/${roomId}?${params}`);

    this._connection.onmessage = ev => {
      const event = JSON.parse(ev.data) as Events;
      this.emit(event.type, event.payload);
    };
  }

  private emit<T extends Events>(type: T['type'], payload: T['payload']) {
    this._emitter.emit(type, payload);
  }

  on<T extends Events>(type: T['type'], listener: EventListener<T>) {
    this._emitter.addListener(type, listener);
  }

  off<T extends Events>(type: T['type'], listener: EventListener<T>) {
    this._emitter.removeListener(type, listener);
  }

  sendOffer(id: number, description: RTCSessionDescriptionInit) {
    const json = JSON.stringify({ type: 'offer', payload: { to: id, description } });
    this._connection.send(json);
  }

  sendAnswer(id: number, description: RTCSessionDescriptionInit) {
    const json = JSON.stringify({ type: 'answer', payload: { to: id, description } });
    this._connection.send(json);
  }

  sendCandidate(id: number, iceCandidate: RTCIceCandidate) {
    const json = JSON.stringify({ type: 'iceCandidate', payload: { to: id, iceCandidate } });
    this._connection.send(json);
  }

  close() {
    const eventTypes = ['myUser', 'updateUsers'];
    eventTypes.forEach(type => this._emitter.removeAllListeners(type));
    this._connection.close();
  }
}
