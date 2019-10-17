.PHONY: dep, gen, dev

dep:
	GO111MODULE=off go get github.com/shogo82148/assets-life
	GO111MODULE=off go get github.com/pilu/fresh

gen:
	assets-life ../frontend/dist ./assets

dev:
	fresh