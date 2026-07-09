#!/usr/bin/env bash
set -Eeuo pipefail

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
BRANCH="${1:-$CURRENT_BRANCH}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ "$BRANCH" == "master" ]]; then
  LOCK_FILE="${TMPDIR:-/tmp}/dao-edu-production-web-deploy.lock"
  WEB_PORT="5006"
  APP_NAME="dao-edu-production-web"
else
  LOCK_FILE="${TMPDIR:-/tmp}/dao-edu-web-deploy.lock"
  WEB_PORT="5001"
  APP_NAME="dao-edu-web"
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  source "${NVM_DIR}/nvm.sh"
fi

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "Another frontend deployment is already running."
  exit 1
fi

for command in git npm pm2 curl grep; do
  command -v "${command}" >/dev/null 2>&1 || {
    echo "Missing required command: ${command}"
    exit 1
  }
done

[[ -d "${REPOSITORY_ROOT}/.git" ]] || {
  echo "Git repository not found: ${REPOSITORY_ROOT}"
  exit 1
}

if [[ -n "$(git -C "${REPOSITORY_ROOT}" status --porcelain --untracked-files=no)" ]]; then
  echo "Tracked files have local changes: ${REPOSITORY_ROOT}"
  exit 1
fi

echo "Updating frontend from origin/${BRANCH}..."
git -C "${REPOSITORY_ROOT}" fetch --prune origin "${BRANCH}"
git -C "${REPOSITORY_ROOT}" checkout "${BRANCH}"
git -C "${REPOSITORY_ROOT}" merge --ff-only "origin/${BRANCH}"

cd "${REPOSITORY_ROOT}"
[[ -f .env ]] || {
  echo "Missing frontend environment file: ${REPOSITORY_ROOT}/.env"
  exit 1
}

echo "Installing and building frontend..."
npm ci
npm run build

echo "Reloading frontend with PM2..."
pm2 delete "${APP_NAME}" >/dev/null 2>&1 || true
pm2 serve "${REPOSITORY_ROOT}/dist" "${WEB_PORT}" \
  --name "${APP_NAME}" \
  --spa
pm2 save

WEB_HEALTH_URL="${WEB_HEALTH_URL:-http://127.0.0.1:${WEB_PORT}}"

echo "Checking frontend health..."
curl --fail --silent --show-error \
  --retry 10 \
  --retry-delay 2 \
  "${WEB_HEALTH_URL}/index.html" |
  grep -q '<div id="root"></div>'

echo "Frontend deployment completed successfully."
pm2 status
