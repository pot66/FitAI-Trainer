# Deployment Guide

## Start

```bash
cp .env.example .env
# replace all secrets
docker compose up -d --build
docker compose ps
```

## Backend health

```bash
curl http://127.0.0.1/api/health
```

## Seed exercises

```bash
docker compose exec backend node prisma/seed.js
```

The seed uses `upsert`, so it is safe to run repeatedly.

## phpMyAdmin

```bash
docker compose --profile tools up -d phpmyadmin
```

Keep phpMyAdmin private or protect it with an additional access layer.

## HTTPS

Put TLS/HTTPS in front of the frontend container using your VPS reverse proxy or cloud load balancer. Set `FRONTEND_URL` to the public HTTPS origin.

## Backups

Back up the `mysql_data` volume regularly, especially before schema changes.

## Updates

```bash
git pull
docker compose up -d --build
```

The backend runs `prisma migrate deploy` before starting. Review production migrations before applying them.
