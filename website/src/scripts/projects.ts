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
      'https://api.github.com/users/theyonecodes/repos?per_page=30&sort=updated&type=public&_t=' + Date.now(),
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )
    if (!res.ok) throw new Error('API error ' + res.status)
    const data = await res.json()

    if (!Array.isArray(data)) throw new Error('Invalid response')

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
      PowerShell: '#012456',
      Batchfile: '#89e051',
    }

    grid.innerHTML = repos
      .map(function (r, i) {
        const color = langColors[r.language] || '#666'
        const topics = (r.topics || [])
          .slice(0, 3)
          .map(function (t) { return '<span class="tag">' + t + '</span>' })
          .join('')

        return (
          '<a href="' + r.html_url + '" target="_blank" rel="noopener" class="card p-8 md:p-10 block group project-card gsap-reveal" style="transition-delay:' + (i * 0.06) + 's">' +
          '<div class="flex items-start justify-between gap-4 mb-4">' +
          '<h3 class="text-lg font-display font-800 group-hover:text-[var(--color-accent)] transition-colors duration-300">' + r.name + '</h3>' +
          '<svg class="w-4 h-4 text-[var(--color-text-3)] shrink-0 group-hover:text-[var(--color-accent)] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>' +
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
          '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
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
      cards.forEach(function (el) {
        const observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('revealed')
                entry.target.classList.remove('gsap-reveal')
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
    console.error('GitHub API error:', err)
    grid.innerHTML =
      '<div class="col-span-full text-center py-20 text-xs text-[var(--color-text-3)]">Could not load repositories. <a href="https://github.com/theyonecodes" target="_blank" class="text-[var(--color-accent)] underline">View on GitHub</a></div>'
  }
}
