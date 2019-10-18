package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/Mushus/sagyoip/backend/assets"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"golang.org/x/net/websocket"
)

type serveFS struct {
	http.FileSystem
}

func (s serveFS) Exists(prefix string, path string) bool {
	if path == "" {
		path = "index.html"
	}
	_, err := s.Open(prefix + path)
	return err != nil
}

func main() {
	roomHandler := roomHandler{
		rooms: newRoomRepo(),
	}

	r := gin.New()
	r.GET("/ws/:id", roomHandler.Get)
	r.Use(static.Serve("/", serveFS{FileSystem: assets.Root}))
	r.Run()
}

type roomHandler struct {
	rooms *roomRepo
}

// WSReq request
type WSReq struct {
	Typ     string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// WSResp response
type WSResp struct {
	Typ     string        `json:"type"`
	Payload responseEvent `json:"payload"`
}

func (r roomHandler) Get(c *gin.Context) {
	roomID := c.Param("id")
	userName := c.Query("userName")

	// TODO: validator

	websocket.Handler(func(ws *websocket.Conn) {
		event := make(chan responseEvent)
		user := newUser(userName, event)

		r.rooms.join(roomID, user)
		defer r.rooms.leave(roomID, user)

		decoder := json.NewDecoder(ws)
		req := WSReq{}

		exit := make(chan struct{})
		go func() {
			for eventData := range event {
				eventType := eventData.eventType()
				b, err := json.Marshal(WSResp{
					Typ:     eventType,
					Payload: eventData,
				})
				if err != nil {
					log.Println(err)
				}
				ws.Write(b)
			}
		}()

		go func() {
			for {
				select {
				case <-exit:
				default:
					ws.Write([]byte("{}"))
				}
				time.Sleep(300 * time.Second)
			}
		}()

		for {
			if err := decoder.Decode(&req); err != nil {
				if err != io.EOF {
					log.Println(err)
				}
				break
			}
			switch req.Typ {
			case "offer":
				var payload WSReqOfferPayload
				if err := json.Unmarshal(req.Payload, &payload); err != nil {
					log.Println(err)
					continue
				}
				r.rooms.offer(roomID, user, payload.To, payload.Description)
			case "answer":
				var payload WSReqAnswerPayload
				if err := json.Unmarshal(req.Payload, &payload); err != nil {
					log.Println(err)
					continue
				}
				r.rooms.answer(roomID, user, payload.To, payload.Description)
			case "iceCandidate":
				var payload WSReqICECandidatePayload
				if err := json.Unmarshal(req.Payload, &payload); err != nil {
					log.Println(err)
					continue
				}
				r.rooms.iceCandidate(roomID, user, payload.To, payload.ICECandidate)
			case "leave":
				break
			}
		}
		close(exit)
	}).ServeHTTP(c.Writer, c.Request)
}

type roomRepo struct {
	joinChan         chan opRoomParam
	leaveChan        chan opRoomParam
	offerChan        chan opOfferParam
	answerChan       chan opAnswerParam
	iceCandidateChan chan opICECandidateParam
}

type (
	opRoomParam struct {
		id   string
		user *user
	}

	opOfferParam struct {
		roomID      string
		from        *user
		to          int
		description Description
	}

	opAnswerParam struct {
		roomID      string
		from        *user
		to          int
		description Description
	}

	opICECandidateParam struct {
		roomID       string
		from         *user
		to           int
		iceCandidate ICECandidate
	}
)

func newRoomRepo() *roomRepo {
	rooms := map[string]*room{}
	joinChan := make(chan opRoomParam)
	leaveChan := make(chan opRoomParam)
	offerChan := make(chan opOfferParam)
	answerChan := make(chan opAnswerParam)
	iceCandidateChan := make(chan opICECandidateParam)
	r := &roomRepo{
		joinChan:         joinChan,
		leaveChan:        leaveChan,
		offerChan:        offerChan,
		answerChan:       answerChan,
		iceCandidateChan: iceCandidateChan,
	}

	go func() {
		for {
			select {
			case prm := <-joinChan:
				room, ok := rooms[prm.id]
				if !ok {
					room = newRoom()
					rooms[prm.id] = room
				}
				room.join(prm.user)
			case prm := <-leaveChan:
				room, ok := rooms[prm.id]
				if ok {
					room.leave(prm.user)
					if room.hasNoMembers() {
						delete(rooms, prm.id)
					}
				}
			case prm := <-offerChan:
				room, ok := rooms[prm.roomID]
				if !ok {
					continue
				}

				_, target, exists := room.findUser(prm.to)
				if !exists {
					continue
				}

				dist, exists := room.getUser(prm.from)
				if !exists {
					continue
				}

				target.offer(dist.id, prm.description)
			case prm := <-answerChan:
				room, ok := rooms[prm.roomID]
				if !ok {
					continue
				}

				_, target, exists := room.findUser(prm.to)
				if !exists {
					continue
				}

				dist, exists := room.getUser(prm.from)
				if !exists {
					continue
				}

				target.answer(dist.id, prm.description)

			case prm := <-iceCandidateChan:
				room, ok := rooms[prm.roomID]
				if !ok {
					continue
				}

				_, target, exists := room.findUser(prm.to)
				if !exists {
					continue
				}

				dist, exists := room.getUser(prm.from)
				if !exists {
					continue
				}

				target.iceCandidate(dist.id, prm.iceCandidate)
			}
		}
	}()

	return r
}

func (r roomRepo) join(roomID string, u *user) {
	r.joinChan <- opRoomParam{
		id:   roomID,
		user: u,
	}
}

func (r roomRepo) leave(roomID string, u *user) {
	r.leaveChan <- opRoomParam{
		id:   roomID,
		user: u,
	}
}

func (r roomRepo) offer(roomID string, from *user, to int, description Description) {
	r.offerChan <- opOfferParam{
		roomID:      roomID,
		from:        from,
		to:          to,
		description: description,
	}
}

func (r roomRepo) answer(roomID string, from *user, to int, description Description) {
	r.answerChan <- opAnswerParam{
		roomID:      roomID,
		from:        from,
		to:          to,
		description: description,
	}
}

func (r roomRepo) iceCandidate(roomID string, from *user, to int, iceCandidate ICECandidate) {
	r.iceCandidateChan <- opICECandidateParam{
		roomID:       roomID,
		from:         from,
		to:           to,
		iceCandidate: iceCandidate,
	}
}
