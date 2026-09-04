#!/bin/sh
set -e

# Garante que os diretórios necessários existem e têm as permissões corretas para o usuário nextjs
mkdir -p /tmp/colaolink-downloads /app/temp_downloads /home/nextjs/.cache
chown -R nextjs:nodejs /tmp/colaolink-downloads /app/temp_downloads /home/nextjs 2>/dev/null || true

# Se o script for executado como root, troca com segurança para o usuário nextjs via su-exec
if [ "$(id -u)" = '0' ]; then
    exec su-exec nextjs "$@"
fi

exec "$@"
