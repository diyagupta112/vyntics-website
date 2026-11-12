# Backend CI/CD plan

Goal: when code is pushed to `main`, the backend (`apps/api`) is checked very strictly. Only if every check passes, and a person approves, is it deployed to the AWS Lightsail server automatically. Nothing broken gets through.

Status key: [ ] not started, [x] done.

## Rules for the whole pipeline
- No fake checks. A check that is skipped, empty or ignored counts as a failure.
- If any step fails, the deploy does not happen.
- Nothing is deployed without a manual approval click.
- Secrets live only in GitHub Secrets and on the server, never in the repo.

## Stage 0: Prerequisites (you)
- [ ] Get the read-only deploy key for the server from the founder, so the server can pull code from GitHub.
- [ ] Confirm the server runs the app today: Nginx, systemd service, venv, `/health` answers.
- [ ] Confirm the repo is on GitHub and `main` is protected.

## Stage 1: Checks workflow (CI)
Runs on every pull request and every push to `main`. File: `.github/workflows/backend-ci.yml`.
- [ ] Set up Python 3.11 and install dependencies.
- [ ] Start a Postgres container and apply every file in `supabase/migrations`.
- [ ] Lint with ruff.
- [ ] Type-check with mypy.
- [ ] Run the full pytest suite with `RUN_DATABASE_INTEGRATION_TESTS=1`.
- [ ] Fail if any test is skipped.
- [ ] Fail if coverage is below the gate. The first run reports the real number, then the gate is set to 80%, or to the measured number if lower, and only ever raised after that.
- [ ] Boot the real app against the test database and call `/health`.
- [ ] Scan dependencies for known vulnerabilities (pip-audit).
- [ ] Scan the repo for leaked secrets.
- [ ] Check that all migrations apply cleanly on an empty database.

## Stage 2: Protect `main` (you, in GitHub settings)
- [ ] Require a pull request before merging.
- [ ] Require the Stage 1 checks to pass before merging.
- [ ] Require the branch to be up to date before merging.
- [ ] Block force pushes and deletion of `main`.

## Stage 3: Server and access setup
- [ ] Create a deploy SSH key pair for GitHub Actions to log in to the server.
- [ ] Create a limited AWS IAM user that can only open and close port 22 on the `vyntics-api` instance. Permissions are reviewed and approved before creation.
- [ ] Add GitHub Secrets: server host, SSH private key, AWS key pair, database URL for migrations.
- [ ] Create a GitHub Environment named `production` with you as required reviewer. This is the manual approval step.

## Stage 4: Deploy workflow (CD)
Runs only after Stage 1 passes on `main`. File: `.github/workflows/backend-deploy.yml`.
- [ ] Wait for your approval in the `production` environment.
- [ ] Open port 22 for the runner's IP only.
- [ ] Back up the database (pg_dump) and keep the file.
- [ ] Run the new migrations.
- [ ] Upload the tested code to the server with rsync over SSH (same method as `apps/api/deploy/update-server.sh`, which has to be adapted to run without a prompt) and switch to it.
- [ ] Restart the service.
- [ ] Check `/health` for about a minute.
- [ ] If the health check fails, roll back to the previous code and restart.
- [ ] Always close port 22 again, even if the job fails.

## Stage 5: Alerts
- [ ] GitHub emails failed workflow runs.
- [ ] The deploy job ends with a clear failed or rolled-back status.

## Stage 6: Dry run
- [ ] Open a test pull request with a deliberately broken test and confirm the checks block it.
- [ ] Deploy a harmless change and confirm approval, deploy and health check work.
- [ ] Break `/health` on purpose in a test and confirm the rollback works.

## Migration rule
Database changes cannot be rolled back automatically. Every migration must work with both the old and the new code, so a code rollback is always safe.

## Order of work
Stage 1 has been written (`.github/workflows/backend-ci.yml`) and waits for its first run. Stages 3 and 4 come next. Stage 2 is done after Stage 1 is green once.
