# 🌱 AI for Agriculture

A full-stack web application built to support **precision agriculture** in the Palouse region and beyond. This project helps farmers optimize their use of **biochar** by combining on-farm yield data with public datasets (soil, weather, elevation) to generate actionable **prescription maps** powered by AI.

---

## Table of Contents

- [🌱 AI for Agriculture](#-ai-for-agriculture)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [✨ Features](#-features)
  - [🛠️ Tech Stack (**proposed**)](#️-tech-stack-proposed)
  - [Getting Started](#getting-started)
    - [Frontend Setup](#frontend-setup)
    - [Backend](#backend)
    - [Proxy](#proxy)
    - [Cloudflare Tunnel](#cloudflare-tunnel)

## Project Overview

Traditional unirrigated hill farming in the Pacific Northwest faces challenges such as:

- Highly variable terrain
- Differences in water availability and snow accumulation
- Topsoil erosion on slopes

This USDA-funded project explores how **biochar** can improve long-term soil productivity and farmer ROI. Our web application provides a data-driven decision support tool to make biochar adoption practical and profitable.

---

## ✨ Features

- 🔐 **Secure farmer login** system
- 📂 **File uploads** for field boundaries and harvester yield data
- 🤖 **AI-powered models** trained on integrated datasets
- 🗺️ **Prescription map generation** to maximize benefits and ROI

---

## 🛠️ Tech Stack (**proposed**)

- **Frontend:** React (TypeScript), MUI
- **Backend:** Django or FastAPI (Python)
- **Database:** SQLite
- **Cloud Platform:** Microsoft Azure

---

## Getting Started

These are getting started instructions for running on ubuntu.

### Frontend Setup

```sh
  sudo apt update
  sudo apt install -y curl ca-certificates

  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

  sudo apt install -y nodejs

  node -v
  npm -v

  npm install

  npm run dev
```

### Backend

```sh
sudo apt update
sudo apt install -y python3 python3-venv python3-pip


```

### Proxy

```sh
  sudo apt update
  sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl


  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list


  sudo apt update
  sudo apt install -y caddy

  systemctl status caddy

  caddy version


  cp ./Caddyfile /etc/caddy/Caddyfile

  sudo systemctl reload caddy

```

sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

### Cloudflare Tunnel

CSRF cookie:

use the /auth/user/ endpoint to see the CSRF token in the cookies. Use that in the other requests by setting:

X-CSRFToken in the headers
