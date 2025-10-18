# Utiliser une image nginx légère comme base
FROM nginx:alpine

# Supprimer la configuration par défaut de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers du projet dans le répertoire de travail de nginx
COPY . /usr/share/nginx/html/

# Créer une configuration nginx personnalisée pour SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gestion des routes SPA (fallback vers index.html) \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache pour les assets statiques \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Sécurité \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
}' > /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]
