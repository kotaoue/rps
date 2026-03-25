FROM nginx:alpine

COPY javascript/index.html /usr/share/nginx/html/index.html
COPY style.css             /usr/share/nginx/html/style.css
COPY javascript/script.js  /usr/share/nginx/html/script.js
COPY javascript/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
