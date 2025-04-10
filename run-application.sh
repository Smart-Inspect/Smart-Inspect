docker-compose down
docker-compose -f smart-inspect-server/docker-compose.dev.yml down
docker-compose -f smart-inspect-server/docker-compose.prod.yml down
docker-compose up --build -d
