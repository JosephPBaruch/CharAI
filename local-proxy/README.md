# Local Proxy Notes

```sh

    # install
    brew install caddy
    sudo apt install caddy


    # create local caddyfile
    mkdir -p local-proxy
    cd local-proxy
    vi Caddyfile

    # run
    caddy run


```

```Caddyfile
    :8088 {
        # Anything under /api goes to the backend
        handle_path /api/* {
            reverse_proxy 127.0.0.1:8000
        }

        # Everything else goes to the frontend
        handle {
            reverse_proxy localhost:5173
        }
}
```
