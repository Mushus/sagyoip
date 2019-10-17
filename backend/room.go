package main

type room struct {
	latestID int
	users    map[*user]member
}

func newRoom() *room {
	return &room{
		latestID: 0,
		users:    make(map[*user]member),
	}
}

func (r *room) join(u *user) {
	id := r.latestID + 1
	r.latestID = id
	r.users[u] = member{id: id}
	u.eventChan <- eventMyUser{MyID: id}
	r.pushUpdateUsersEvent()
}

func (r *room) leave(u *user) {
	delete(r.users, u)
	u.close()
	r.pushUpdateUsersEvent()
}

func (r *room) getUser(user *user) (member, bool) {
	member, exists := r.users[user]
	return member, exists
}

func (r *room) findUser(id int) (member, *user, bool) {
	for user, member := range r.users {
		if member.id == id {
			return member, user, true
		}
	}
	return member{}, nil, false
}

func (r *room) hasNoMembers() bool {
	return len(r.users) == 0
}

func (r *room) pushUpdateUsersEvent() {
	eu := r.createEventUsers()
	event := eventUpdateUser{Users: eu}
	for u := range r.users {
		u.eventChan <- event
	}
}

func (r *room) createEventUsers() []eventUser {
	eu := make([]eventUser, len(r.users))
	i := 0

	for u, m := range r.users {
		eu[i] = eventUser{ID: m.id, Name: u.name}
		i++
	}
	return eu
}

type member struct {
	id int
}
