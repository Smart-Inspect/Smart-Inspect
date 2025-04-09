docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
npm run build

# Build the React files
npm run build --prefix ../smart-inspect-web/
# Copy the static files to the dist directory
cp -r ../smart-inspect-web/build ./dist
# Rename the build directory to web
mv ./dist/build ./dist/web

# Start the production server
npm run prod
