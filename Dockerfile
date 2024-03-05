FROM inhandao.azurecr.io/nginx-base:1.17.1-alpine

WORKDIR /usr/share/nginx/html


RUN rm -rf /usr/share/nginx/html/*
COPY ./build/ ./
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
