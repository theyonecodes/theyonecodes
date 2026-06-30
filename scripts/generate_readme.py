#!/usr/bin/env python3
"""Generate the final README with inline base64 SVGs."""
import base64, os
from pathlib import Path

def svg_data_uri(path: str) -> str:
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    return f"data:image/svg+xml;base64,{data}"

# SVG paths
HERO = svg_data_uri("assets/branding/hero-pro.svg")
FOOTER = svg_data_uri("assets/branding/footer.svg")
REPO_STATS = svg_data_uri("assets/generated/repo-stats.svg")
LANG_STATS = svg_data_uri("assets/generated/language-stats.svg")
ACTIVE = svg_data_uri("assets/generated/active-projects.svg")

README = f"""<!-- ════════════════════════════════════════════════
     THEYONE — Profile
     ════════════════════════════════════════════════ -->

<div align="center">

<!-- Hero Banner -->
<img src="{HERO}" width="100%" />

</div>

<div align="center" style="margin:20px 0;">
  <img src="https://img.shields.io/badge/repos-37-1e3c72?style=for-the-badge&color=1e3c72" />
  <img src="https://img.shields.io/badge/projects-4-f59e0b?style=for-the-badge&color=f59e0b" />
  <img src="https://img.shields.io/badge/languages-6-2a5298?style=for-the-badge&color=2a5298" />
  <img src="https://img.shields.io/badge/private-31-374151?style=for-the-badge&color=374151" />
</div>

---

## Projects

### 🛡️ CISO-Auditor · Windows Security Audit

Security tools are either **$10K/year** or too complex for solo consultants.

→ 100-point audit engine with **PDF bytecode exports** + **System Restore hooks**. One script, no install, runs anywhere.

`Python` · Zero deps · Portable · PDF export · [View →](https://github.com/theyonecodes/CISO-Auditor)

---

### ⚡ archperf-pro · System Optimization

Generic optimization scripts ignore how you actually use your machine.

→ Pro-grade Arch Linux tuning that **learns your behavior** via Hidden Markov Models + Q-Learning.

`JavaScript` · HMM · Q-Learning · PID control · [View →](https://github.com/theyonecodes/archperf-pro)

---

### 📦 pkgdrop · Universal Package Installer

Installing packages outside `apt`/`pacman` is a pain. None of the helpers talk to each other.

→ One command installs **deb, rpm, AppImage, tar.xz, pkg.tar.zst**. GPG verified, atomic installs, instant rollback.

`Bash` · 2,338 LOC · GPG · Atomic · [View →](https://github.com/theyonecodes/pkgdrop)

---

### 📋 theyonepm · Project Tracker

Every PM tool is either enterprise bloat or cloud-only. None work with AI agents.

→ Single HTML file, no backend, no signup. Built for humans and AI to both use.

`HTML` · 8K LOC · IndexedDB · AI-native · [View →](https://github.com/theyonecodes/theyonepm)

---

<div align="center" style="margin:20px 0;">
  <a href="https://github.com/theyonecodes?tab=repositories" style="color:#94a3b8; text-decoration:none; font-size:14px; border:1px solid #334155; padding:10px 24px; border-radius:8px; display:inline-block;">See all 37 repositories →</a>
</div>

---

## Stack

| Systems | Security | Automation | Web | Design |
|:--|:--|:--|:--|:--|
| Linux · Windows | Audit · FDE · FSB | Python · Rust · Bash | Flask · React · TS | OKLCH · CSS |

<div align="center" style="margin-top:16px;">
  <img src="https://skillicons.dev/icons?i=rust,python,cpp,go,bash,linux,react,git,docker,typescript,flask&theme=dark&perline=11" />
</div>

---

## Stats

<div align="center">
  <img src="{REPO_STATS}" width="370" />
  <img src="{LANG_STATS}" width="310" />
</div>

<div align="center" style="margin-top:16px;">
  <img src="{ACTIVE}" width="710" />
</div>

---

<div align="center" style="padding:20px 0 8px;">
  <img src="{FOOTER}" width="60%" />
</div>

<div align="center" style="padding-bottom:20px;">
  <sub style="color:#334155;">Backlog repos are ideas — not abandoned projects.</sub>
</div>
"""

Path("README.md").write_text(README)
print("README.md generated.")
print(f"Hero URI length: {len(HERO)}")
print(f"Footer URI length: {len(FOOTER)}")
print(f"Repo stats URI length: {len(REPO_STATS)}")
print(f"Lang stats URI length: {len(LANG_STATS)}")
print(f"Active projects URI length: {len(ACTIVE)}")