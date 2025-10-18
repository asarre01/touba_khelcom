# Utiliser une image nginx légère comme base
FROM nginx:alpine

# Copier les fichiers du projet dans le répertoire de travail de nginx
COPY . /usr/share/nginx/html/

# Créer une configuration nginx pour le port 5000
RUN echo 'server { \
    listen 5000; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exposer le port 5000
EXPOSE 5000

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]
