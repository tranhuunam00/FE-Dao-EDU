#!/usr/bin/env bash
set -Eeuo pipefail

BRANCH="${1:-main}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOCK_FILE="${TMPDIR:-/tmp}/dao-edu-web-deploy.lock"

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
[[ -f .env.production ]] || {
  echo "Missing frontend environment file: ${REPOSITORY_ROOT}/.env.production"
  exit 1
}

echo "Installing and building frontend..."
npm ci
npm run build

echo "Reloading frontend with PM2..."
pm2 delete dao-edu-web >/dev/null 2>&1 || true
pm2 serve "${REPOSITORY_ROOT}/dist" 5001 \
  --name dao-edu-web \
  --spa
pm2 save

WEB_HEALTH_URL="${WEB_HEALTH_URL:-http://127.0.0.1:5001}"

echo "Checking frontend health..."
curl --fail --silent --show-error \
  --retry 10 \
  --retry-delay 2 \
  "${WEB_HEALTH_URL}/index.html" |
  grep -q '<div id="root"></div>'

echo "Frontend deployment completed successfully."
pm2 status
