#!/usr/bin/env python3
"""
GitHub Profile README Updater
Automatically generates statistics SVGs and updates README.md
"""

import json
import os
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

# Constants
REPO_SIZE_THRESHOLD = 20  # KB - minimum size to consider a repo "real"
ACTIVITY_DAYS = 90  # Days since last push to consider "active"
OUTPUT_DIR = Path("assets/generated")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def run_command(cmd: list) -> str:
    """Run a shell command and return stdout."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running {' '.join(cmd)}: {e.stderr}")
        return ""

def fetch_repos() -> List[Dict]:
    """Fetch all repositories (public and private) using GitHub CLI."""
    print("Fetching repositories from GitHub...")
    output = run_command(["gh", "api", "user/repos?per_page=100&sort=updated&direction=desc"])
    if not output:
        print("Failed to fetch repositories")
        return []
    
    try:
        return json.loads(output)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return []

def is_real_repo(repo: Dict) -> bool:
    """Determine if a repository is a real project (not a template/fork)."""
    # Skip forks
    if repo.get("fork", False):
        return False
    
    # Check size (in KB)
    size_kb = repo.get("size", 0)
    if size_kb < REPO_SIZE_THRESHOLD:
        return False
    
    # Skip obvious template/demo repositories unless recently active
    name = repo.get("name", "").lower()
    if any(template in name for template in ["template", "boilerplate", "starter", "example", "demo"]):
        pushed_at = datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))
        if datetime.now().astimezone() - pushed_at > timedelta(days=30):
            return False
    
    return True

def get_language_color(language: str) -> str:
    """Get a color for a programming language."""
    colors = {
        "JavaScript": "#f1e05a",
        "TypeScript": "#2b7489",
        "Python": "#3572A5",
        "Rust": "#dea584",
        "Go": "#00ADD8",
        "C++": "#f34b7d",
        "C": "#555555",
        "C#": "#178600",
        "Java": "#b07219",
        "PHP": "#4F5D95",
        "Ruby": "#701516",
        "Swift": "#FFAC45",
        "Kotlin": "#A97BFF",
        "Shell": "#89e051",
        "Bash": "#89e051",
        "Zsh": "#89e051",
        "HTML": "#e34c26",
        "CSS": "#563d7c",
        "SCSS": "#c6538c",
        "Less": "#1d365d",
        "JSON": "#292929",
        "YAML": "#cb171e",
        "TOML": "#9c4221",
        "Markdown": "#083fa1",
        "Dockerfile": "#384d54",
    }
    return colors.get(language, "#8b949e")  # GitHub's default gray

def generate_repo_stats(repos: List[Dict]) -> str:
    """Generate premium SVG repository statistics card."""
    total = len(repos)
    with_code = sum(1 for r in repos if r.get("size", 0) > 0)
    public = sum(1 for r in repos if not r.get("private", True))
    private = total - public
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    languages = set(r.get("language") for r in repos if r.get("language"))
    lang_count = len(languages)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="370" height="168">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <style>
      .l {{ font-family: system-ui, sans-serif; fill: #64748b; font-size: 11px; letter-spacing: 0.5px; }}
      .v {{ font-family: system-ui, sans-serif; fill: #f8fafc; font-size: 32px; font-weight: 700; }}
      .sub {{ font-family: system-ui, sans-serif; fill: #94a3b8; font-size: 13px; }}
    </style>
  </defs>
  <rect width="100%" height="100%" rx="14" fill="url(#bg)"/>
  <rect x="0" y="0" width="370" height="2" rx="14" fill="url(#gold)" opacity="0.6"/>
  <rect x="0" y="0" width="2" height="168" fill="url(#gold)" opacity="0.25"/>

  <text x="24" y="36" class="l">REPOS</text>
  <text x="24" y="68" class="v">{total}</text>
  <text x="24" y="88" class="sub">{public} public · {private} private</text>

  <text x="140" y="36" class="l">STARS</text>
  <text x="140" y="68" class="v">{total_stars}</text>

  <text x="224" y="36" class="l">LANGUAGES</text>
  <text x="224" y="68" class="v">{lang_count}</text>

  <text x="24" y="120" class="l">ACTIVITY RATE</text>
  <rect x="24" y="130" width="320" height="6" rx="3" fill="#1e293b"/>
  <rect x="24" y="130" width="320" height="6" rx="3" fill="url(#gold)" opacity="0.7"/>
  <text x="24" y="156" class="sub" fill="#475569">{with_code} / {total} repos with code</text>
</svg>'''

def generate_language_chart(repos: List[Dict]) -> str:
    """Generate premium SVG language distribution chart."""
    lang_counts: Dict[str, int] = {}
    for repo in repos:
        lang = repo.get("language")
        if lang and lang != "Other":
            lang_counts[lang] = lang_counts.get(lang, 0) + 1

    sorted_langs = sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:6]

    if not sorted_langs:
        return '''<svg xmlns="http://www.w3.org/2000/svg" width="310" height="120">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs>
  <rect width="100%" height="100%" rx="14" fill="url(#bg)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="system-ui" font-size="14" fill="#64748b">No language data</text>
</svg>'''

    max_count = max(c for _, c in sorted_langs)
    bar_h = 22
    gap = 12
    total_h = 40 + len(sorted_langs) * (bar_h + gap) + 16
    max_bar = 220

    rows = []
    for i, (lang, count) in enumerate(sorted_langs):
        y = 40 + i * (bar_h + gap)
        bar_w = int(max_bar * count / max_count) if max_count > 0 else 0
        color = get_language_color(lang)
        rows.append(f'''  <text x="20" y="{y + 16}" font-family="system-ui" fill="#f8fafc" font-size="13" font-weight="500">{lang}</text>
  <text x="290" y="{y + 16}" font-family="system-ui" fill="#94a3b8" font-size="12" text-anchor="end">{count}</text>
  <rect x="20" y="{y + 20}" width="{max_bar}" height="{bar_h}" rx="3" fill="#1e293b"/>
  <rect x="20" y="{y + 20}" width="{bar_w}" height="{bar_h}" rx="3" fill="{color}"/>''')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="310" height="{total_h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="14" fill="url(#bg)"/>
  <rect x="0" y="0" width="310" height="2" fill="url(#gold)" opacity="0.6"/>
  <rect x="0" y="0" width="2" height="{total_h}" fill="url(#gold)" opacity="0.25"/>
  <text x="20" y="28" font-family="system-ui" fill="#64748b" font-size="11" letter-spacing="0.5px">LANGUAGE DISTRIBUTION</text>
{chr(10).join(rows)}
</svg>'''

def generate_active_projects(repos: List[Dict]) -> str:
    """Generate premium SVG active projects timeline (pure SVG, GitHub compatible)."""
    cutoff_date = datetime.now().astimezone() - timedelta(days=ACTIVITY_DAYS)
    active_repos = [
        r for r in repos 
        if is_real_repo(r) and 
        datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00")) > cutoff_date
    ]
    active_repos.sort(key=lambda r: r["pushed_at"], reverse=True)
    active_repos = active_repos[:6]

    if not active_repos:
        return '''<svg xmlns="http://www.w3.org/2000/svg" width="710" height="100">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs>
  <rect width="100%" height="100%" rx="14" fill="url(#bg)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="system-ui" font-size="14" fill="#64748b">No recent activity</text>
</svg>'''

    item_h = 50
    y_start = 50
    total_h = y_start + len(active_repos) * item_h + 16

    rows = []
    for i, repo in enumerate(active_repos):
        y = y_start + i * item_h
        name = repo.get("name", "Unknown")
        desc = (repo.get("description") or "No description")[:52]
        lang = repo.get("language") or ""
        days = (datetime.now().astimezone() - datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))).days
        time_str = "today" if days == 0 else f"{days}d ago"
        rows.append(f'''  <circle cx="60" cy="{y + 15}" r="5" fill="#f59e0b"/>
  <circle cx="60" cy="{y + 15}" r="8" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.3"/>
  <text x="88" y="{y + 10}" font-family="system-ui" fill="#f8fafc" font-size="14" font-weight="600">{name}</text>
  <text x="88" y="{y + 26}" font-family="system-ui" fill="#64748b" font-size="12">{desc}</text>
  <text x="620" y="{y + 10}" font-family="system-ui" fill="#60a5fa" font-size="11" font-weight="500" text-anchor="end">{lang}</text>
  <text x="620" y="{y + 26}" font-family="system-ui" fill="#475569" font-size="11" text-anchor="end">{time_str}</text>''')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="710" height="{total_h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="14" fill="url(#bg)"/>
  <rect x="0" y="0" width="710" height="2" fill="url(#gold)" opacity="0.6"/>
  <rect x="0" y="0" width="2" height="{total_h}" fill="url(#gold)" opacity="0.25"/>
  <text x="60" y="28" font-family="system-ui" fill="#64748b" font-size="11" letter-spacing="1px">RECENTLY ACTIVE</text>
  <line x1="60" y1="55" x2="60" y2="{y_start + (len(active_repos) - 1) * item_h + 15}" stroke="#334155" stroke-width="1.5" stroke-dasharray="3 5"/>
{chr(10).join(rows)}
</svg>'''

def update_readme_with_svgs() -> bool:
    """Update README.md to reference generated SVGs instead of external services."""
    readme_path = Path("README.md")
    if not readme_path.exists():
        print("README.md not found")
        return False
    
    content = readme_path.read_text()
    
    # Replace external stats with local SVGs
    # Replace the stats section
    stats_start = '<!-- STATS_START -->'
    stats_end = '<!-- STATS_END -->'
    
    if stats_start in content and stats_end in content:
        new_stats = f'''{stats_start}
<div align="center">
  <img src="assets/generated/repo-stats.svg" width="340" />
  <img src="assets/generated/language-stats.svg" width="340" />
  <br/><br/>
  <img src="assets/generated/active-projects.svg" width="340" />
</div>
{stats_end}'''
        
        # Find the section between markers and replace it
        start_idx = content.find(stats_start)
        end_idx = content.find(stats_end) + len(stats_end)
        if start_idx != -1 and end_idx != -1:
            content = content[:start_idx] + new_stats + content[end_idx:]
            print("Updated stats section with local SVGs")
        else:
            print("Could not find stats markers")
            return False
    else:
        # If markers don't exist, just note that SVGs were generated
        print("SVGs generated in assets/generated/ - update README manually to use them")
        return True
    
    # Write back the updated content
    try:
        readme_path.write_text(content)
        print("README.md updated successfully")
        return True
    except Exception as e:
        print(f"Error writing README.md: {e}")
        return False

def main():
    """Main function to generate SVGs and update README."""
    print("Starting GitHub profile README update...")
    
    # Fetch repositories
    repos = fetch_repos()
    
    if not repos:
        print("No repositories found or unable to fetch. Using empty data.")
        repos = []
    
    print(f"Found {len(repos)} repositories")
    
    # Filter real repos
    real_repos = [r for r in repos if is_real_repo(r)]
    print(f"Found {len(real_repos)} real repositories (filtered out templates/forks)")
    
    # Generate SVGs
    print("Generating repository stats SVG...")
    (OUTPUT_DIR / "repo-stats.svg").write_text(generate_repo_stats(real_repos))
    
    print("Generating language chart SVG...")
    (OUTPUT_DIR / "language-stats.svg").write_text(generate_language_chart(real_repos))
    
    print("Generating active projects SVG...")
    (OUTPUT_DIR / "active-projects.svg").write_text(generate_active_projects(real_repos))
    
    # Update README
    print("Updating README...")
    updated = update_readme_with_svgs()
    
    if updated:
        print("✅ Update complete!")
    else:
        print("⚠️  SVGs generated but README update incomplete")

if __name__ == "__main__":
    main()