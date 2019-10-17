package main

type (
	// WSReqOfferPayload offer
	WSReqOfferPayload struct {
		To          int         `json:"to"`
		Description Description `json:"description"`
	}

	// WSReqAnswerPayload answer
	WSReqAnswerPayload struct {
		To          int         `json:"to"`
		Description Description `json:"description"`
	}

	// Description description
	Description struct {
		Typ string `json:"type"`
		SDP string `json:"sdp"`
	}

	// WSReqICECandidatePayload ice
	WSReqICECandidatePayload struct {
		To           int          `json:"to"`
		ICECandidate ICECandidate `json:"iceCandidate"`
	}

	// ICECandidate ice candidate
	ICECandidate struct {
		Candidate     string `json:"candidate"`
		SDPMLineIndex int    `json:"sdpMLineIndex"`
		SDPMid        string `json:"sdpMid"`
	}
)
