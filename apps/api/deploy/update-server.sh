#!/usr/bin/env bash
# Copies apps/api to the Lightsail server and restarts the API.
# Asks for confirmation first. Never copies .env files.
set -euo pipefail

SERVER="ubuntu@54.89.194.158"
KEY="$HOME/.ssh/vyntics-api-key.pem"
API_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "This will copy $API_DIR to $SERVER and restart the live API."
read -r -p "Type yes to continue: " answer
[ "$answer" = "yes" ] || { echo "Cancelled."; exit 1; }

cd "$API_DIR"
rsync -rt --delete --exclude='__pycache__' --exclude='*.pyc' --exclude='.env*' \
  -e "ssh -i $KEY" --rsync-path="sudo -u vyntics rsync" \
  app pyproject.toml README.md "$SERVER:/home/vyntics/api/"

ssh -i "$KEY" "$SERVER" 'sudo -u vyntics bash -c "cd /home/vyntics/api && .venv/bin/pip install -q --no-cache-dir ." && sudo systemctl restart vyntics-api && sleep 5 && systemctl is-active vyntics-api && curl -s -o /dev/null -w "health: %{http_code}\n" http://127.0.0.1:8000/health'
