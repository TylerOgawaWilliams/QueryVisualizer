## Running the backend

#### 1. Setup Docker for the Database

1.1
```
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=demo_db \
  -p 5432:5432 \
  -d postgres:15
```

1.2
```
docker cp dvdrental.tar postgres-dev:/tmp/backup.tar
```

1.3
```
docker exec -it postgres-dev pg_restore -U postgres -d dvdrental -v /tmp/backup.tar
```

1.4
```
docker exec -it postgres-dev psql -U postgres -d dvdrental
```

#### 2. 

## Running the frontend

#### 1. 