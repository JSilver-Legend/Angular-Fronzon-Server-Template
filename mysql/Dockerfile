FROM mariadb:latest


COPY import.sh /docker-entrypoint-initdb.d/import.sh
COPY dumps /dumps

ENV MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=true

RUN chmod +x /docker-entrypoint-initdb.d/import.sh
