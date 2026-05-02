# Operator Secrets Staging

This folder is only for a safe template and operator instructions. Do not put real secrets here.

Recommended operator flow:

```bash
mkdir -p ~/.clearintent
cp operator-secrets/clearintent.secrets.env.example ~/.clearintent/clearintent.secrets.env
chmod 600 ~/.clearintent/clearintent.secrets.env
```

Then edit:

```bash
~/.clearintent/clearintent.secrets.env
```

The default destination is recorded in `clearintent.config.json`. To use a different location, set this in repo-local runtime config or your shell:

```bash
CLEARINTENT_SECRETS_FILE=/absolute/path/to/clearintent.secrets.env
```

Rules:

- Do not commit real secrets.
- Do not paste private keys, API tokens, seed phrases, or paid RPC keys into chat.
- Do not leave a filled `*.env` file in this folder.
- Agents should run `npm run clearintent -- credentials status`, not inspect secret files.
