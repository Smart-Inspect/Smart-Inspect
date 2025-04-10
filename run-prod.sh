docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
npm run build

# Build the React files
npm run build --prefix ../smart-inspect-web/
# Move the static files to the dist directory
mv ../smart-inspect-web/build ./dist/web

# Start the production server
npm run prod
