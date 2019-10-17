package main

type responseEvent interface {
	eventType() string
}

type (
	eventUpdateUser struct {
		Users []eventUser `json:"users"`
	}

	eventUser struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}

	eventMyUser struct {
		MyID int `json:"myId"`
	}

	eventOffer struct {
		From        int         `json:"from"`
		Description Description `json:"description"`
	}

	eventAnswer struct {
		From        int         `json:"from"`
		Description Description `json:"description"`
	}

	eventICECandidate struct {
		From         int          `json:"from"`
		ICECandidate ICECandidate `json:"iceCandidate"`
	}
)

func (e eventUpdateUser) eventType() string {
	return "updateUsers"
}

func (e eventMyUser) eventType() string {
	return "myUser"
}

func (e eventOffer) eventType() string {
	return "offer"
}

func (e eventAnswer) eventType() string {
	return "answer"
}

func (e eventICECandidate) eventType() string {
	return "iceCandidate"
}
