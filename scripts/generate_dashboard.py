#!/usr/bin/env python3
"""
Auto-Generated Dashboard for theyonecodes Integrated Projects
Shows status of all toolkit-integrated projects.
"""

import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List

# ─── Config ──────────────────────────────────────────────────
REPO_SIZE_THRESHOLD = 20
ACTIVITY_DAYS = 90
OUTPUT_DIR = Path("assets/generated")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INTEGRATED_PROJECTS = [
    "Windows-Super-Smooth",
    "electron-gpu-crash-fix",
    "universal-browser-backup",
    "pkgdrop",
    "CISO-Auditor",
    "oplire",
    "Dell-3521-Hackintosh",
    "hackintosh-desktop",
]

# ─── GitHub API Helper ───────────────────────────────────────
def gh_api(endpoint: str) -> str:
    r = subprocess.run(["gh", "api", endpoint], capture_output=True, text=True)
    return r.stdout.strip()


def fetch_repos() -> List[Dict]:
    out = gh_api("user/repos?per_page=100&sort=updated&direction=desc")
    return json.loads(out) if out else []


def is_integrated_repo(repo: Dict) -> bool:
    if repo.get("fork", False):
        return False
    if repo.get("size", 0) < 20:
        return False
    name = repo.get("name", "")
    return name in INTEGRATED_PROJECTS


# ─── SVG Generation ──────────────────────────────────────────
LANG_COLORS = {
    "PowerShell": "#012456", "Python": "#3572A5", "Rust": "#dea584",
    "Bash": "#89e051", "Shell": "#89e051", "ASL": "#8b949e",
    "Rust": "#dea584",
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


def _repo_status_badge(repo: Dict) -> Dict:
    """Determine integration status of a repo."""
    name = repo.get("name", "")
    pushed = datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))
    days_ago = (datetime.now().astimezone() - pushed).days
    
    # Check if toolkit submodule exists
    has_toolkit = False
    try:
        # Quick check via GitHub API for submodule
        content = gh_api(f"repos/theyonecodes/{repo['name']}/contents/vendor/toolkit")
        has_toolkit = len(content.strip()) > 0
    except:
        has_toolkit = False
    
    # Check for workflow files
    has_ci = False
    try:
        workflows = gh_api(f"repos/theyonecodes/{repo['name']}/contents/.github/workflows")
        has_ci = len(workflows.strip()) > 0
    except:
        has_ci = False
    
    return {
        "name": name,
        "description": repo.get("description", "") or "No description",
        "language": repo.get("language", "Unknown"),
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "open_issues": repo.get("open_issues_count", 0),
        "pushed_at": pushed.isoformat(),
        "days_ago": days_ago,
        "has_toolkit": has_toolkit,
        "has_ci": has_ci,
        "is_integrated": name in INTEGRATED_PROJECTS,
    }


# ─── SVG Generators ──────────────────────────────────────────
def generate_integration_overview(repos: List[Dict]) -> str:
    """Generate overview SVG showing integration status of all projects."""
    integrated = [r for r in repos if r.get("is_integrated", False)]
    with_toolkit = [r for r in integrated if r.get("has_toolkit", False)]
    with_ci = [r for r in integrated if r.get("has_ci", False)]
    
    total = len(integrated)
    toolkit_count = len(with_toolkit)
    ci_count = len(with_ci)
    
    body = f'''
  <style>.l {{font-family:system-ui;fill:#64748b;font-size:11px;letter-spacing:.5px}} .v {{font-family:system-ui;fill:#f8fafc;font-size:32px;font-weight:700}} .sub {{font-family:system-ui;fill:#94a3b8;font-size:13px}}</style>
  <text x="24" y="36" class="l">INTEGRATION OVERVIEW</text>
  <text x="24" y="68" class="v">{total}</text>
  <text x="24" y="88" class="sub">integrated projects</text>
  <text x="180" y="36" class="l">TOOLKIT</text>
  <text x="180" y="68" class="v">{toolkit_count}</text>
  <text x="180" y="88" class="sub">{total - toolkit_count} pending</text>
  <text x="300" y="36" class="l">CI</text>
  <text x="300" y="68" class="v">{ci_count}</text>
  <text x="300" y="88" class="sub">{total - ci_count} pending</text>
  <text x="24" y="110" class="l">SHARED ENGINES</text>
  <rect x="24" y="120" width="400" height="6" rx="3" fill="#1e293b"/>
  <rect x="24" y="120" width="400" height="6" rx="3" fill="url(#gold)" opacity="0.7"/>
  <text x="24" y="140" class="sub">BackupEngine, DarkTheme, AuditEngine, FixEngine, JevRouter</text>
  <text x="24" y="160" class="l">SHARED GUI</text>
  <rect x="24" y="170" width="400" height="6" rx="3" fill="#1e293b"/>
  <rect x="24" y="170" width="400" height="6" rx="3" fill="url(#gold)" opacity="0.7"/>
  <text x="24" y="190" class="sub">DarkTheme shared across all GUIs</text>
  <text x="24" y="210" class="l">JEV ROUTER</text>
  <rect x="24" y="220" width="400" height="6" rx="3" fill="#1e293b"/>
  <rect x="24" y="220" width="400" height="6" rx="3" fill="url(#gold)" opacity="0.7"/>
  <text x="24" y="240" class="sub">AI triage for all fix decisions</text>
'''
    return _svg_boiler(450, 250, body)


def generate_integrated_projects(repos: List[Dict]) -> str:
    """Generate SVG showing all integrated projects with status."""
    integrated = [r for r in repos if r.get("is_integrated", False)]
    integrated.sort(key=lambda r: r.get("pushed_at", ""), reverse=True)
    
    if not integrated:
        return _svg_boiler(710, 80, '  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="#64748b">No integrated projects</text>')
    
    item_h, y0 = 54, 40
    h = y0 + len(integrated) * item_h + 20
    
    rows = []
    for i, repo in enumerate(integrated):
        y = y0 + i * item_h
        name = repo.get("name", "?")
        desc = (repo.get("description") or "")[:48]
        lang = repo.get("language", "")
        stars = repo.get("stars", 0)
        toolkit_badge = "✓ Toolkit" if repo.get("has_toolkit") else "✗ Toolkit"
        ci_badge = "✓ CI" if repo.get("has_ci") else "✗ CI"
        pushed = datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))
        days = (datetime.now().astimezone() - pushed).days
        ts = "today" if days == 0 else f"{days}d ago"
        
        toolkit_color = "#3FB950" if repo.get("has_toolkit") else "#F85149"
        ci_color = "#3FB950" if repo.get("has_ci") else "#F85149"
        
        rows.append(f'''
  <text x="24" y="{y+16}" font-family="system-ui" fill="#f8fafc" font-size="14" font-weight="600">{name}</text>
  <text x="24" y="{y+30}" font-family="system-ui" fill="#94a3b8" font-size="11">{desc}</text>
  <text x="24" y="{y+42}" font-family="system-ui" fill="#64748b" font-size="10">{lang} • ⭐ {stars} • {ts}</text>
  <rect x="500" y="{y+2}" width="80" height="18" rx="4" fill="{toolkit_color}" opacity="0.2"/>
  <text x="508" y="{y+14}" font-family="system-ui" fill="{toolkit_color}" font-size="9" font-weight="500" text-anchor="middle">{toolkit_badge}</text>
  <rect x="590" y="{y+2}" width="55" height="18" rx="4" fill="{ci_color}" opacity="0.2"/>
  <text x="595" y="{y+14}" font-family="system-ui" fill="{ci_color}" font-size="9" font-weight="500" text-anchor="middle">{ci_badge}</text>
  <text x="700" y="{y+16}" font-family="system-ui" fill="#64748b" font-size="10" text-anchor="end">{ts}</text>
''')
    
    header = f'  <text x="24" y="24" font-family="system-ui" fill="#64748b" font-size="11" letter-spacing="1px">INTEGRATED PROJECTS ({len(integrated)})</text>'
    return _svg_boiler(760, h, header + "\n" + "\n".join(rows))


def generate_toolkit_engines() -> str:
    """Generate SVG showing shared toolkit engines."""
    engines = [
        ("BackupEngine", "Auto backup + rollback", "PowerShell, Python", "✓ Ready", "#3FB950"),
        ("DarkTheme", "GitHub Dark tkinter", "Python", "✓ Ready", "#3FB950"),
        ("AuditEngine", "Rule DSL + scoring", "Python", "✓ Ready", "#3FB950"),
        ("FixEngine", "Idempotent + rollback", "Python", "✓ Ready", "#3FB950"),
        ("JevRouter", "Choice/Score/Noul", "Python", "✓ Ready", "#3FB950"),
        ("ElectronShim", "IFEO debugger shim", "Rust", "✓ Ready", "#3FB950"),
    ]
    
    item_h, y0 = 36, 30
    h = y0 + len(engines) * item_h + 20
    
    rows = []
    for i, (name, desc, lang, status, color) in enumerate(engines):
        y = y0 + i * item_h
        rows.append(f'''
  <text x="20" y="{y+20}" font-family="system-ui" fill="#f8fafc" font-size="13" font-weight="600">{name}</text>
  <text x="160" y="{y+20}" font-family="system-ui" fill="#94a3b8" font-size="11">{desc}</text>
  <text x="320" y="{y+20}" font-family="system-ui" fill="#64748b" font-size="10">{lang}</text>
  <rect x="420" y="{y+2}" width="80" height="18" rx="4" fill="{color}" opacity="0.2"/>
  <text x="430" y="{y+13}" font-family="system-ui" fill="{color}" font-size="9" font-weight="500" text-anchor="middle">{status}</text>
  <text x="520" y="{y+20}" font-family="system-ui" fill="#64748b" font-size="10">{i+1}/6 engines</text>
''')
    
    header = '  <text x="20" y="20" font-family="system-ui" fill="#64748b" font-size="11" letter-spacing="1px">SHARED ENGINES</text>'
    return _svg_boiler(600, h, header + "\n" + "\n".join(rows))


def generate_jev_primer() -> str:
    """Generate SVG explaining Jev Router primitives."""
    body = '''
  <style>.l {font-family:system-ui;fill:#64748b;font-size:11px;letter-spacing:.5px} .v {font-family:system-ui;fill:#f8fafc;font-size:32px;font-weight:700} .sub {font-family:system-ui;fill:#94a3b8;font-size:13px}</style>
  <text x="24" y="36" class="l">JEV SYSTEM ONE</text>
  <text x="24" y="56" class="l">AI Triaging for all theyonecodes tools</text>
  <text x="180" y="36" class="l">CHOICE</text>
  <text x="180" y="68" class="v">Model Select</text>
  <text x="180" y="88" class="sub">Local vs Cloud</text>
  <text x="300" y="36" class="l">SCORE</text>
  <text x="300" y="68" class="v">0-100%</text>
  <text x="300" y="88" class="sub">Confidence</text>
  <text x="24" y="110" class="l">NOUL (Guardrails)</text>
  <text x="24" y="130" class="sub">Confidence < 70% → Human Review</text>
  <text x="24" y="146" class="sub">Sensitive ops → Human Review</text>
  <text x="24" y="162" class="sub">No free models → Human Review</text>
  <text x="24" y="190" class="l">INTEGRATIONS</text>
  <rect x="24" y="200" width="380" height="6" rx="3" fill="#1e293b"/>
  <rect x="24" y="200" width="380" height="6" rx="3" fill="url(#gold)" opacity="0.7"/>
  <text x="24" y="220" class="sub">CISO-Auditor: Fix triage</text>
  <text x="24" y="236" class="sub">pkgdrop: AUR vs Official</text>
  <text x="24" y="252" class="sub">Super-Smooth: Aggressive vs Safe</text>
  <text x="24" y="268" class="sub">electron-fix: Crash classification</text>
'''
    return _svg_boiler(450, 280, body)


# ─── Main ────────────────────────────────────────────────────
def main():
    print("Fetching repos...")
    repos = fetch_repos()
    
    # Enrich with integration status
    enriched = []
    for repo in repos:
        if is_integrated_repo(repo):
            enriched.append(_repo_status_badge(repo))
    
    print(f"Found {len(enriched)} integrated repos")
    
    # Generate SVGs
    (OUTPUT_DIR / "integration-overview.svg").write_text(generate_integration_overview(enriched))
    (OUTPUT_DIR / "integrated-projects.svg").write_text(generate_integrated_projects(enriched))
    (OUTPUT_DIR / "toolkit-engines.svg").write_text(generate_toolkit_engines())
    (OUTPUT_DIR / "jev-primer.svg").write_text(generate_jev_primer())
    
    print("Done!")


if __name__ == "__main__":
    main()