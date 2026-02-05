# Production Database Notes

## Form

```sh
postgresql://<USER
  >:<PASSWORD
    >@charai-pg-db.postgres.database.azure.com:5432/<DB
      >?sslmode=require</DB
    ></PASSWORD
  ></USER
>
```

User and password i set but what is the database name?

Navigate to the database server > databases > and select one from the list or create a new one

## Making Migrations

Exec into the backend container and run

```sh
    python manage.py migrate
```
