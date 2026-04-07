.PHONY: deploy upgrade migrate status logs stop clean

# First-time deploy: build and start all services, run migrations
deploy:
	docker compose up --build -d --wait
	docker exec django-backend python manage.py migrate
	@echo "All services running."

# Upgrade: rebuild frontend/backend without touching the database
upgrade:
	docker compose stop frontend backend
	docker compose rm -f frontend backend
	docker compose up --build -d --wait
	docker exec django-backend python manage.py migrate
	@echo "Upgrade complete. Database preserved."

# Run Django migrations against the running backend container
migrate:
	docker exec django-backend python manage.py migrate

# Show running service status
status:
	docker compose ps

# Tail logs for all services
logs:
	docker compose logs -f

# Stop all services (database volume is preserved)
stop:
	docker compose down

# Remove all containers AND the database volume (destructive)
clean:
	docker compose down -v
	@echo "All containers and volumes removed."
