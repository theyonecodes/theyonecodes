#!/usr/bin/env python3
"""
GitHub Profile README Updater
Generates self-hosted stats SVGs daily via GitHub Actions.
No external image services. No third-party Python packages.
"""

import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List

REPO_SIZE_THRESHOLD = 20
ACTIVITY_DAYS = 90
OUTPUT_DIR = Path("assets/generated")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def gh_api(endpoint: str) -> str:
    r = subprocess.run(["gh", "api", endpoint], capture_output=True, text=True)
    return r.stdout.strip()


def fetch_repos() -> List[Dict]:
    out = gh_api("user/repos?per_page=100&sort=updated&direction=desc")
    return json.loads(out) if out else []


def is_real_repo(repo: Dict) -> bool:
    if repo.get("fork", False):
        return False
    if repo.get("size", 0) < REPO_SIZE_THRESHOLD:
        return False
    name = repo.get("name", "").lower()
    if any(t in name for t in ["template", "boilerplate", "starter", "example", "demo"]):
        pushed = datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))
        if datetime.now().astimezone() - pushed > timedelta(days=30):
            return False
    return True


LANG_COLORS = {
    "JavaScript": "#f1e05a", "TypeScript": "#2b7489", "Python": "#3572A5",
    "Rust": "#dea584", "Go": "#00ADD8", "C++": "#f34b7d", "C": "#555555",
    "C#": "#178600", "Java": "#b07219", "Shell": "#89e051", "Bash": "#89e051",
    "HTML": "#e34c26", "CSS": "#563d7c", "SCSS": "#c6538c",
    "Dockerfile": "#384d54", "Markdown": "#083fa1",
}


def _svg_boiler(width: int, height: int, body: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="14" fill="url(#bg)"/>
  <rect x="0" y="0" width="{width}" height="2" rx="14" fill="url(#gold)" opacity="0.6"/>
  <rect x="0" y="0" width="2" height="{height}" fill="url(#gold)" opacity="0.25"/>
{body}
</svg>'''


def generate_repo_stats(repos: List[Dict]) -> str:
    total = len(repos)
    public = sum(1 for r in repos if not r.get("private", True))
    private = total - public
    stars = sum(r.get("stargazers_count", 0) for r in repos)
    langs = len({r.get("language") for r in repos if r.get("language")})
    with_code = sum(1 for r in repos if r.get("size", 0) > 0)
    body = f'''
  <style>.l {{font-family:system-ui;fill:#64748b;font-size:11px;letter-spacing:.5px}} .v {{font-family:system-ui;fill:#f8fafc;font-size:32px;font-weight:700}} .sub {{font-family:system-ui;fill:#94a3b8;font-size:13px}}</style>
  <text x="24" y="36" class="l">REPOS</text>
  <text x="24" y="68" class="v">{total}</text>
  <text x="24" y="88" class="sub">{public} public / {private} private</text>
  <text x="140" y="36" class="l">STARS</text>
  <text x="140" y="68" class="v">{stars}</text>
  <text x="224" y="36" class="l">LANGUAGES</text>
  <text x="224" y="68" class="v">{langs}</text>
  <text x="24" y="120" class="l">ACTIVITY RATE</text>
  <rect x="24" y="130" width="320" height="6" rx="3" fill="#1e293b"/>
  <rect x="24" y="130" width="320" height="6" rx="3" fill="url(#gold)" opacity="0.7"/>
  <text x="24" y="156" class="sub" fill="#475569">{with_code} / {total} repos with code</text>'''
    return _svg_boiler(370, 168, body)


def generate_language_chart(repos: List[Dict]) -> str:
    counts: Dict[str, int] = {}
    for r in repos:
        lang = r.get("language")
        if lang and lang != "Other":
            counts[lang] = counts.get(lang, 0) + 1
    top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:6]
    if not top:
        return _svg_boiler(310, 80, '  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="#64748b">No data</text>')
    bar_h, gap, max_bar = 22, 12, 220
    h = 40 + len(top) * (bar_h + gap) + 16
    mx = max(c for _, c in top)
    rows = []
    for i, (lang, count) in enumerate(top):
        y = 40 + i * (bar_h + gap)
        bw = int(max_bar * count / mx) if mx else 0
        color = LANG_COLORS.get(lang, "#8b949e")
        rows.append(f'  <text x="20" y="{y+16}" font-family="system-ui" fill="#f8fafc" font-size="13" font-weight="500">{lang}</text>\n  <text x="290" y="{y+16}" font-family="system-ui" fill="#94a3b8" font-size="12" text-anchor="end">{count}</text>\n  <rect x="20" y="{y+20}" width="{max_bar}" height="{bar_h}" rx="3" fill="#1e293b"/>\n  <rect x="20" y="{y+20}" width="{bw}" height="{bar_h}" rx="3" fill="{color}"/>')
    header = f'  <text x="20" y="28" font-family="system-ui" fill="#64748b" font-size="11" letter-spacing=".5px">LANGUAGE DISTRIBUTION</text>'
    return _svg_boiler(310, h, header + "\n" + "\n".join(rows))


def generate_active_projects(repos: List[Dict]) -> str:
    cutoff = datetime.now().astimezone() - timedelta(days=ACTIVITY_DAYS)
    active = [r for r in repos if is_real_repo(r) and datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00")) > cutoff]
    active.sort(key=lambda r: r["pushed_at"], reverse=True)
    active = active[:6]
    if not active:
        return _svg_boiler(710, 80, '  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="#64748b">No recent activity</text>')
    item_h, y0 = 50, 50
    h = y0 + len(active) * item_h + 16
    rows = []
    for i, repo in enumerate(active):
        y = y0 + i * item_h
        name = repo.get("name", "?")
        desc = (repo.get("description") or "")[:52]
        lang = repo.get("language") or ""
        days = (datetime.now().astimezone() - datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))).days
        ts = "today" if days == 0 else f"{days}d ago"
        rows.append(f'''  <circle cx="60" cy="{y+15}" r="5" fill="#f59e0b"/>
  <circle cx="60" cy="{y+15}" r="8" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.3"/>
  <text x="88" y="{y+10}" font-family="system-ui" fill="#f8fafc" font-size="14" font-weight="600">{name}</text>
  <text x="88" y="{y+26}" font-family="system-ui" fill="#64748b" font-size="12">{desc}</text>
  <text x="620" y="{y+10}" font-family="system-ui" fill="#60a5fa" font-size="11" font-weight="500" text-anchor="end">{lang}</text>
  <text x="620" y="{y+26}" font-family="system-ui" fill="#475569" font-size="11" text-anchor="end">{ts}</text>''')
    header = f'  <text x="60" y="28" font-family="system-ui" fill="#64748b" font-size="11" letter-spacing="1px">RECENTLY ACTIVE</text>\n  <line x1="60" y1="55" x2="60" y2="{y0+(len(active)-1)*item_h+15}" stroke="#334155" stroke-width="1.5" stroke-dasharray="3 5"/>'
    return _svg_boiler(710, h, header + "\n" + "\n".join(rows))


def main():
    repos = fetch_repos()
    real = [r for r in repos if is_real_repo(r)]
    print(f"Found {len(real)} real repos")
    (OUTPUT_DIR / "repo-stats.svg").write_text(generate_repo_stats(real))
    (OUTPUT_DIR / "language-stats.svg").write_text(generate_language_chart(real))
    (OUTPUT_DIR / "active-projects.svg").write_text(generate_active_projects(real))
    print("Done")


if __name__ == "__main__":
    main()
