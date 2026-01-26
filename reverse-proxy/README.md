# Caddy

## Mac

```sh
    brew install caddy

    caddy run # Caddyfile in . dir
```

## Linux (Ubuntu)

1. Install

```sh

    sudo apt update
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl

    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

    sudo apt update
    sudo apt install -y caddy

```

2. Start

```sh
    sudo systemctl enable --now caddy
    sudo systemctl status caddy
```

3. Copy over Caddyfile

```sh
    cd reverse-proxy

    cp Caddyfile /etc/caddy/Caddyfile
```

4. Reload and check status

```sh
    sudo caddy reload --config /etc/caddy/Caddyfile
    sudo systemctl status caddy

```
