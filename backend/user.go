package main

type user struct {
	name      string
	eventChan chan responseEvent
}

func newUser(name string, event chan responseEvent) *user {
	return &user{
		name:      name,
		eventChan: event,
	}
}

func (u user) offer(from int, description Description) {
	u.eventChan <- eventOffer{
		From:        from,
		Description: description,
	}
}

func (u user) answer(from int, description Description) {
	u.eventChan <- eventAnswer{
		From:        from,
		Description: description,
	}
}

func (u user) iceCandidate(from int, iceCandidate ICECandidate) {
	u.eventChan <- eventICECandidate{
		From:         from,
		ICECandidate: iceCandidate,
	}
}

func (u user) close() {
	close(u.eventChan)
}
