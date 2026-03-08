# Build angular app using the production config
FROM node:24-alpine AS build
# Set the working directory
WORKDIR /app
# Copy the package.json and package-lock.json files
COPY package*.json ./
# Run a clean install of the dependencies
RUN npm ci
# Install Angular CLI globally
RUN npm install -g @angular/cli
# Copy all files
COPY . .
# Build the application
RUN npm run build --configuration=production
# Nginx image to serve the application
FROM nginx:alpine
# Copy the build output to replace the default nginx contents
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
# Expose port 80
EXPOSE 80

# Build image: docker build -t <name> .
# Run container: docker run -d -p 8080:80 <name>