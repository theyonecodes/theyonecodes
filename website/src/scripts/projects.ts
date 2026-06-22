import { prefersReducedMotion } from './utils'

function timeAgo(d) {
  const n = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (n === 0) return 'today'
  if (n < 7) return n + 'd'
  if (n < 30) return Math.floor(n / 7) + 'w'
  if (n < 365) return Math.floor(n / 30) + 'mo'
  return Math.floor(n / 365) + 'y'
}

export async function initProjects() {
  const grid = document.getElementById('projects-grid')
  if (!grid) return

  try {
    const res = await fetch(
      'https://api.github.com/users/theyonecodes/repos?per_page=12&sort=updated',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          UserAgent: 'theyonecodes',
        },
      }
    )
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const repos = data
      .filter(function (x) { return !x.fork && x.name !== 'theyonecodes' })
      .sort(function (a, b) { return b.stargazers_count - a.stargazers_count })
      .slice(0, 12)

    if (!repos.length) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-20 text-xs text-[var(--color-text-3)]">No public repositories.</div>'
      return
    }

    const langColors = {
      Python: '#3572A5',
      JavaScript: '#F1E05A',
      TypeScript: '#3178C6',
      Rust: '#DEA584',
      Bash: '#89e051',
      Shell: '#89e051',
      Go: '#00ADD8',
      C: '#555',
      HTML: '#e34c26',
      CSS: '#563d7c',
    }

    grid.innerHTML = repos
      .map(function (r) {
        const color = langColors[r.language] || '#666'
        const topics = (r.topics || [])
          .slice(0, 3)
          .map(function (t) { return '<span class="tag">' + t + '</span>' })
          .join('')

        return (
          '<a href="' + r.html_url + '" target="_blank" rel="noopener" class="card p-8 md:p-10 block group project-card reveal">' +
          '<div class="flex items-start justify-between gap-4 mb-4">' +
          '<h3 class="text-lg font-semibold text-display group-hover:text-[var(--color-accent)] transition-colors duration-300">' + r.name + '</h3>' +
          '<svg class="w-4 h-4 text-[var(--color-text-3)] shrink-0 group-hover:text-[var(--color-accent)] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>' +
          '</div>' +
          '<p class="text-body text-sm mb-6 leading-relaxed">' +
          (r.description || '<em class="text-[var(--color-text-3)]">No description</em>') +
          '</p>' +
          '<div class="flex items-center justify-between">' +
          '<div class="flex items-center gap-5 text-xs text-[var(--color-text-3)] text-mono">' +
          '<span class="flex items-center gap-1.5">' +
          '<span class="w-2 h-2 rounded-full" style="background-color:' + color + '"></span>' +
          (r.language || 'N/A') +
          '</span>' +
          '<span class="flex items-center gap-1">' +
          '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>' +
          r.stargazers_count +
          '</span>' +
          '<span>' + timeAgo(r.updated_at) + '</span>' +
          '</div>' +
          '<div class="flex gap-1.5">' + topics + '</div>' +
          '</div>' +
          '</a>'
        )
      })
      .join('')

    if (!prefersReducedMotion()) {
      const cards = document.querySelectorAll('.project-card')
      cards.forEach(function (el, i) {
        el.setAttribute('style', 'transition-delay: ' + (i * 0.06) + 's')
        const observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('revealed')
                observer.unobserve(entry.target)
              }
            })
          },
          { threshold: 0.1 }
        )
        observer.observe(el)
      })
    }
  } catch (err) {
    grid.innerHTML =
      '<div class="col-span-full text-center py-20 text-xs text-[var(--color-text-3)]">Could not load repositories.</div>'
  }
}
