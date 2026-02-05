# Deployment Notes

## Frontend

## Backend

## Database

# Production Database Notes

`Azure Database for PostgreSQL flexible servers` is used to host the database server. This

## DATABASE_URL

```sh
  postgresql://<USER>:<PASSWORD>@charai-pg-db.postgres.database.azure.com:5432/<DB>?sslmode=require
```

The following sections need to be replaced with the apporpriate values set up in Azure.

<USER>
<PASSWORD>
<DB>

User and password i set but what is the database name?

Navigate to the database server > databases > and select one from the list or create a new one

## Making Migrations

Exec into the backend container and run

```sh
    python manage.py migrate
```

## Other Notes

DockerInLXC
apt-get update

apt-get docker.io

nano /etc/pve/lxc/<CTID>.conf
lxc.apparmor.profile: unconfined
lxc.mount.entry: /dev/null sys/module/apparmor/parameters/enabled none bind 0 0
pct restart <CTID>
