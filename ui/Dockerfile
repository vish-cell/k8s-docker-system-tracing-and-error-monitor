FROM node:20-alpine as build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_MODEL_SERVICE_URL=http://model-service:5001
ENV REACT_APP_MODEL_SERVICE_URL=$REACT_APP_MODEL_SERVICE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
