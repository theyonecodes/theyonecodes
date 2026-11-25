# Agent Instructions - theyonecodes

## Repository Overview

**Name**: theyonecodes
**Type**: Personal/organizational GitHub profile repository
**Primary Language**: Markdown, HTML, CSS (profile page)
**Package Manager**: None (static content)

## Architecture Overview

```
theyonecodes/
├── README.md                 # Main profile README
├── profile/                  # Profile configuration
│   ├── profile.yml           # Profile configuration
│   ├── social.json           # Social links
│   └── stats.json            # GitHub stats config
├── assets/
│   ├── images/              # Profile images, banners
│   ├── badges/              # Dynamic badges
│   └── svg/                 # Custom SVG icons
├── .github/
│   ├── workflows/
│   │   ├── profile.yml      # Profile update workflow
│   │   └── stats.yml        # Stats update workflow
│   └── profile/             # Profile-specific workflows
├── scripts/
│   ├── generate-readme.py   # README generator
│   ├── generate-stats.py    # Stats generator
│   └── update-badges.py     # Badge updater
├── .github/workflows/
│   ├── profile.yml
│   └── stats.yml
└── README.md
```

## Key Components

| Component | Path | Description |
|-----------|------|-------------|
| Profile Config | profile/profile.yml | Main profile configuration |
| Social Links | profile/social.json | Social media links |
| Stats Config | profile/stats.json | GitHub stats configuration |
| README Generator | scripts/generate-readme.py | Dynamic README generator |
| Stats Generator | scripts/generate-stats.py | Stats generator |
| Badge Updater | scripts/update-badges.py | Badge updater |

## Development Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Generate README
python scripts/generate-readme.py

# Generate stats
python scripts/generate-stats.py

# Update badges
python scripts/update-badges.py

# Validate
python -m py_compile scripts/*.py
```

## Code Style & Conventions

- **Python**: Black, ruff, type hints
- **Markdown**: markdownlint, consistent formatting
- **YAML/JSON**: Consistent indentation, schema validation
- **Commit Messages**: Conventional Commits

## CI/CD Pipeline

- **Provider**: GitHub Actions (`.github/workflows/`)
- **Workflows**: 
  - `profile.yml`: Updates profile README on schedule/commit
  - `stats.yml`: Updates stats on schedule
- **Triggers**: Schedule (daily), push to main, manual dispatch
- **Permissions**: `contents: write` for README updates

## Architecture Invariants (Non-Negotiable)

1. **No Secrets**: All tokens in GitHub Secrets, never in code
2. **Rate Limits**: Respect GitHub API rate limits (cache, exponential backoff)
3. **Idempotency**: Scripts must be idempotent (safe to re-run)
4. **Error Handling**: Graceful degradation, never fail silently

## Common Tasks

### Updating Profile
```bash
# Manual profile update
python scripts/generate-readme.py
git add README.md && git commit -m "chore: update profile" && git push
```

### Updating Stats
```bash
# Manual stats update
python scripts/generate-stats.py
git add profile/stats.json && git commit -m "chore: update stats" && git push
```

### Updating Badges
```bash
# Manual badge update
python scripts/update-badges.py
git add README.md && git commit -m "chore: update badges" && git push
```

### Adding New Badge
```bash
# 1. Add badge config to profile/social.json
# 2. Run badge generator
python scripts/update-badges.py
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API rate limit | Add delay, use caching, check headers |
| Badge not updating | Check workflow logs, verify token permissions |
| README not updating | Check workflow permissions, `contents: write` |
| Stats stale | Check API token, rate limits |

## Useful Links

- **Repo**: `https://github.com/theyonecodes/theyonecodes`
- **Profile**: `https://github.com/theyonecodes`
- **CI**: `https://github.com/theyonecodes/theyonecodes/actions`
- **Security**: `https://github.com/theyonecodes/theyonecodes/security/advisories`