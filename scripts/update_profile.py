"""
Profile README generator.

Scrapes all repos from the theyonecodes GitHub account and generates:
1. repo-stats.svg     — repo count, total stars, forks, active repos
2. language-stats.svg — language distribution bar chart
3. active-projects.svg — repos with recent commits
4. Updates README.md dynamic sections
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = REPO_ROOT / "assets" / "generated"
README_PATH = REPO_ROOT / "README.md"
USERNAME = "theyonecodes"

# ── helpers ──────────────────────────────────────────────────

def run(cmd: str) -> str:
    return subprocess.check_output(cmd, shell=True, text=True)


def fetch_repos() -> list[dict]:
    """Fetch all repos via gh CLI. Falls back to curl if gh not available."""
    try:
        result = run(f"gh api /user/repos --paginate --jq '.[] | {{name,description,language,private,pushed_at,stargazers_count,forks_count,topics,size,fork,archived}}'")
        return [json.loads(line) for line in result.strip().split("\n") if line.strip()]
    except Exception:
        try:
            result = run(f"curl -s 'https://api.github.com/users/{USERNAME}/repos?per_page=100'")
            return json.loads(result)
        except Exception:
            print("Failed to fetch repos", file=sys.stderr)
            return []


def is_real_repo(repo: dict) -> bool:
    """A repo with actual code, not just a template shell."""
    if repo.get("fork"):
        return repo.get("size", 0) > 100
    if repo.get("archived"):
        return False
    return repo.get("size", 0) > 20  # more than just README + template


def recent_activity(repo: dict) -> bool:
    """Has the repo been touched in the last 90 days?"""
    pushed = repo.get("pushed_at", "")
    if not pushed:
        return False
    dt = datetime.fromisoformat(pushed.replace("Z", "+00:00"))
    delta = datetime.now(timezone.utc) - dt
    return delta.days < 90


# ── SVG generators ───────────────────────────────────────────

def generate_repo_stats(repos: list[dict]) -> str:
    total = len(repos)
    real = sum(1 for r in repos if is_real_repo(r))
    active = sum(1 for r in repos if recent_activity(r))
    public = sum(1 for r in repos if not r.get("private", True))
    stars = sum(r.get("stargazers_count", 0) or 0 for r in repos)

    width, height = 400, 240
    items = [
        ("Repos", str(total), "#8b949e"),
        ("With Code", str(real), "#56d364"),
        ("Active (90d)", str(active), "#58a6ff"),
        ("Public", str(public), "#f0883e"),
        ("Stars", str(stars), "#d2a8ff"),
    ]

    rows = ""
    y = 50
    for label, value, color in items:
        rows += f'''
        <text x="30" y="{y}" fill="#8b949e" font-family="monospace" font-size="14">{label}</text>
        <text x="300" y="{y}" fill="{color}" font-family="monospace" font-size="14" font-weight="bold" text-anchor="end">{value}</text>
        <rect x="30" y="{y + 8}" width="270" height="3" rx="1.5" fill="#21262d" />
        <rect x="30" y="{y + 8}" width="{270 * int(value or 0) / max(max(int(value or 0) for _, v, _ in items), 1)}" height="3" rx="1.5" fill="{color}" opacity="0.5" />
        '''
        y += 35

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <style>
    text {{ font-family: 'Segoe UI', monospace; }}
  </style>
  <rect width="{width}" height="{height}" fill="#0d1117" rx="12" />
  <text x="30" y="30" fill="#c9d1d9" font-family="monospace" font-size="16" font-weight="bold">Overview</text>
  {rows}
</svg>'''


def generate_language_chart(repos: list[dict]) -> str:
    # Count languages from real repos
    lang_counts: dict[str, int] = {}
    for r in repos:
        if not is_real_repo(r):
            continue
        lang = r.get("language") or "Other"
        lang_counts[lang] = lang_counts.get(lang, 0) + 1

    sorted_langs = sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    if not sorted_langs:
        return ""

    colors = {
        "Python": "#3572A5", "JavaScript": "#f1e05a", "TypeScript": "#3178c6",
        "Rust": "#dea584", "Shell": "#89e051", "PowerShell": "#012456",
        "HTML": "#e34c26", "CSS": "#563d7c", "Batchfile": "#C1F12E",
        "C++": "#f34b7d", "C": "#555555", "Go": "#00ADD8",
    }

    width, height = 400, 240
    total = sum(c for _, c in sorted_langs)

    bars = ""
    y = 50
    bar_start = 130
    bar_width = 240

    for lang, count in sorted_langs:
        pct = count / total if total else 0
        color = colors.get(lang, "#8b949e")
        bar_w = int(bar_width * pct)
        bars += f'''
        <text x="20" y="{y}" fill="#8b949e" font-family="monospace" font-size="12">{lang}</text>
        <rect x="{bar_start}" y="{y - 10}" width="{bar_width}" height="12" rx="3" fill="#21262d" />
        <rect x="{bar_start}" y="{y - 10}" width="{bar_w}" height="12" rx="3" fill="{color}" />
        <text x="{bar_start + bar_width + 10}" y="{y}" fill="#8b949e" font-family="monospace" font-size="11">{count}</text>
        '''
        y += 22

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <rect width="{width}" height="{height}" fill="#0d1117" rx="12" />
  <text x="20" y="30" fill="#c9d1d9" font-family="monospace" font-size="16" font-weight="bold">Languages</text>
  {bars}
</svg>'''


def generate_active_projects(repos: list[dict]) -> str:
    active = [r for r in repos if is_real_repo(r) and recent_activity(r)]
    active.sort(key=lambda r: r.get("pushed_at", ""), reverse=True)
    active = active[:5]

    if not active:
        return ""

    height = 40 + len(active) * 50
    width = 600

    rows = ""
    y = 50
    for r in active:
        name = r["name"]
        desc = (r.get("description") or "")[:60]
        lang = r.get("language") or ""
        pushed = r.get("pushed_at", "")[:10]

        rows += f'''
        <text x="20" y="{y}" fill="#58a6ff" font-family="monospace" font-size="14" font-weight="bold">{name}</text>
        <text x="20" y="{y + 18}" fill="#8b949e" font-family="monospace" font-size="11">{desc}</text>
        <text x="500" y="{y}" fill="#8b949e" font-family="monospace" font-size="11" text-anchor="end">{lang} · {pushed}</text>
        '''
        y += 45

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <rect width="{width}" height="{height}" fill="#0d1117" rx="12" />
  <text x="20" y="30" fill="#c9d1d9" font-family="monospace" font-size="16" font-weight="bold">Recently Active</text>
  {rows}
</svg>'''


# ── README updater ───────────────────────────────────────────

def update_readme(repos: list[dict]):
    if not os.getenv("GITHUB_ACTIONS"):
        content = README_PATH.read_text()
        content = content.replace("repo-stats.svg", "assets/generated/repo-stats.svg")
        content = content.replace("language-stats.svg", "assets/generated/language-stats.svg")
        content = content.replace("active-projects.svg", "assets/generated/active-projects.svg")
        README_PATH.write_text(content)


# ── main ─────────────────────────────────────────────────────

def main():
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    repos = fetch_repos()
    if not repos:
        print("No repos fetched — aborting")
        return

    # Exclude the profile repo itself
    repos = [r for r in repos if r["name"] != "dargah-sharif-bakarpur-website"]

    print(f"Fetched {len(repos)} repos")

    # Generate SVGs
    stats_svg = generate_repo_stats(repos)
    if stats_svg:
        (ASSETS_DIR / "repo-stats.svg").write_text(stats_svg)
        print("Generated repo-stats.svg")

    lang_svg = generate_language_chart(repos)
    if lang_svg:
        (ASSETS_DIR / "language-stats.svg").write_text(lang_svg)
        print("Generated language-stats.svg")

    active_svg = generate_active_projects(repos)
    if active_svg:
        (ASSETS_DIR / "active-projects.svg").write_text(active_svg)
        print("Generated active-projects.svg")

    update_readme(repos)
    print("Done.")


if __name__ == "__main__":
    main()