FROM php:8-fpm-alpine

RUN apk add --no-cache nginx

COPY index.php /var/www/html/index.php
COPY style.css /var/www/html/style.css
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD sh -c "php-fpm -D && nginx -g 'daemon off;'"
