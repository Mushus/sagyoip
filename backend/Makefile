.PHONY: dep, gen, dev

dep:
	GO111MODULE=off go get github.com/shogo82148/assets-life
	GO111MODULE=off go get github.com/pilu/fresh

gen:
	assets-life ../frontend/dist ./assets

dev:
	fresh

build:
	GOOS=linux   GOARCH=amd64  go build -o ../pkg/sagyoipe-linux-amd64 .
	GOOS=linux   GOARCH=arm    go build -o ../pkg/sagyoipe-linux-arm .
	GOOS=windows GOARCH=amd64  go build -o ../pkg/sagyoipe-win-amd64 .
	GOOS=darwin   GOARCH=amd64 go build -o ../pkg/sagyoipe-mac-amd64 .