# sagyoip

A minimal screen sharing web service

## install

for linux amd64

```bash
wget https://github.com/Mushus/sagyoip/releases/download/v0.2.0/sagyoip -O sagyoip
chmod 755 sagyoip
# run
./sagyoip
```

## Contribution

creating development environment

```bash
git clone git@github.com:Mushus/sagyoip.git

cd frontend
# install dependency
yarn
# Build frontend just once
yarn build
cd -
```

developing frontend programs.

```bash
cd frontend
# run development server
yarn dev
```

developing server side programs.

```bash
cd backend
# Generate Assets
make gen
# Run backend dev server
make dev
```
