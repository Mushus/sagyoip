import User from '~/connector/User';
import Connector, { EventUser, MyUser, UpdateUsers, Offer, Answer, IceCandidate } from './Connector';

export default class Room {
  private _users: Array<User> = [];
  private _myId: number | undefined;
  private readonly _connector: Connector;
  private _localDisplayStream: MediaStream | null = null;
  private _localMicStream: MediaStream | null = null;

  onUpdateUsers: ((users: ReadonlyArray<User>) => any) | null | undefined;

  constructor(roomId: string, userName: string) {
    const connector = new Connector(roomId, userName);

    connector.on<UpdateUsers>('updateUsers', e => this.updateUsers(e));
    connector.on<MyUser>('myUser', ({ myId }) => this.setMyId(myId));
    connector.on<Offer>('offer', ({ from, description }) => this.routeOffer(from, description));
    connector.on<Answer>('answer', ({ from, description }) => this.routeAnswer(from, description));
    connector.on<IceCandidate>('iceCandidate', ({ from, iceCandidate }) => this.routeIceCandidate(from, iceCandidate));

    this._connector = connector;
  }

  get users(): ReadonlyArray<User> {
    return this._users;
  }

  close() {
    this.users.forEach(user => user.close());
  }

  setDisplayStream(stream: MediaStream | null) {
    this.users.forEach(user => user.attachDisplayStream(stream));
    this._localDisplayStream = stream;
  }

  setMicStream(stream: MediaStream | null) {
    this.users.forEach(user => user.attachMicStream(stream));
    this._localMicStream = stream;
  }

  private updateUsers({ users }: { users: ReadonlyArray<EventUser> }) {
    const added = users.filter(user => !this.users.find(found => found.id === user.id));

    const [exists, deleted] = this.users.reduce<[User[], User[]]>(
      ([exists, deleted], user) =>
        users.find(found => found.id === user.id) ? [[...exists, user], deleted] : [exists, [...deleted, user]],
      [[], []],
    );

    const newMembers = added.map(eventUser => {
      const isMe = eventUser.id === this._myId;
      const newMember = new User(this._connector, eventUser.id, eventUser.name, isMe);
      return newMember;
    });

    newMembers.forEach(async member => {
      member.onupdate = () => this.emitUpdateUser();
      this._localDisplayStream && (await member.attachDisplayStream(this._localDisplayStream));
      this._localMicStream && (await member.attachDisplayStream(this._localMicStream));
      this._myId && (await await member.startPeer(this._myId));
    });

    deleted.forEach(user => user.close());

    const newUsers = [...exists, ...newMembers];

    this._users = newUsers;
    this.emitUpdateUser();
  }

  private setMyId(id: number) {
    this._myId = id;
  }

  private routeOffer(from: number, description: RTCSessionDescription) {
    const user = this.users.find(user => user.id === from);
    if (!user) return;
    user.receiveOffer(description);
  }

  private routeAnswer(from: number, description: RTCSessionDescription) {
    const user = this.users.find(user => user.id === from);
    if (!user) return;
    user.receiveAnswer(description);
  }

  private routeIceCandidate(from: number, iceCandidate: RTCIceCandidate) {
    const user = this.users.find(user => user.id === from);
    if (!user) return;
    user.receiveIceCandidate(iceCandidate);
  }

  private emitUpdateUser() {
    this.onUpdateUsers && this.onUpdateUsers(this._users);
  }
}
