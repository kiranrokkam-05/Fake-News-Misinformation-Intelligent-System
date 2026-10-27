# Contributing

Thanks for helping improve this project. Changes should keep the browser-facing API behavior, evidence provenance, and model limitations clear.

## Development setup

Use a Python version supported by the project dependencies; the provided Dockerfile uses Python 3.13. From the repository root, create an isolated environment and install the project dependencies:

```powershell
py -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Optional provider credentials belong in environment variables or a local `verification_module/.env` copied from `verification_module/.env.example`. Never commit real credentials, downloaded model weights, or local evaluation data.

## Run and validate

Start the local server with `start_flask_server.bat`, or run `python -m backend.app` from the repository root. Open `http://127.0.0.1:5000`.

Run the automated suite from the repository root:

```powershell
.venv\Scripts\python.exe -m pytest -q
```

Tests should use deterministic fixtures or mocked external providers. Do not make a test depend on live search services, API keys, model downloads, or mutable remote content unless the test is explicitly an opt-in integration test.

## Change guidelines

- Keep the active `/api/v1` evidence verification path distinct from the legacy article classifier and legacy routes.
- Preserve source URLs, provider status, model metadata, and limitations in API changes.
- Treat support/refute scores as uncalibrated signals, not probabilities of truth.
- Add or update documentation when changing routes, configuration, setup, data handling, or model behavior.
- Keep secrets and generated artifacts out of commits. Check `git status` and `git diff --check` before proposing changes.
- Prefer focused changes with clear commit messages. Include the reason and user-visible impact in pull requests.

## Pull requests

Describe the problem, the approach, and any behavior or API changes. Include the commands used to validate the change and note any limitations or provider-dependent behavior that was not exercised.
