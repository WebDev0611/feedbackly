FROM nginx
ARG configfile=production
COPY nginx.conf.${configfile} /etc/nginx/nginx.conf
COPY ssl /etc/ssl
EXPOSE 80
EXPOSE 443
EXPOSE 9090
