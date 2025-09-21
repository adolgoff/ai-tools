// Simple client-side renderer for tools.md with TOC, anchors and theme toggle
(function () {
  const mdUrl = 'tools.md';
  const contentEl = document.getElementById('content');
  const tocEl = document.getElementById('toc');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  // Theme
  const applyTheme = (t) => {
    if (t === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    themeIcon.className = t === 'light' ? 'ti ti-moon' : 'ti ti-sun';
    localStorage.setItem('theme', t);
  };
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
  themeToggle.addEventListener('click', () => applyTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light'));

  // Fetch and render markdown
  fetch(mdUrl, { cache: 'no-cache' })
    .then((r) => r.text())
    .then((md) => {
      const html = marked.parse(md, { mangle: false, headerIds: true });
      contentEl.innerHTML = html;
      enhanceHeadings();
      buildTOC();
      observeHeadings();
    })
    .catch((e) => {
      contentEl.innerHTML = '<p style="color:var(--muted)">Не удалось загрузить контент.</p>';
      console.error(e);
    });

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9а-яё\s\-\./]/gi, '')
      .replace(/[\s]+/g, '-')
      .replace(/\-+/g, '-');
  }

  function enhanceHeadings() {
    const headings = contentEl.querySelectorAll('h2, h3, h4');
    headings.forEach((h) => {
      if (!h.id) h.id = slugify(h.textContent.trim());
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = '#';
      a.className = 'anchor';
      a.setAttribute('aria-label', 'Ссылка на раздел');
      h.appendChild(a);
    });
  }

  function buildTOC() {
    const headings = contentEl.querySelectorAll('h2');
    const wrapper = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Оглавление';
    wrapper.appendChild(title);

    const list = document.createElement('nav');
    headings.forEach((h) => {
      const link = document.createElement('a');
      link.href = '#' + h.id;
      // Only heading text (exclude inline anchor symbol)
      const hClone = h.cloneNode(true);
      const anchor = hClone.querySelector('.anchor');
      if (anchor) anchor.remove();
      link.textContent = hClone.textContent.trim();
      list.appendChild(link);
    });

    tocEl.innerHTML = '';
    tocEl.appendChild(wrapper);
    tocEl.appendChild(list);
  }

  // descriptions now live in Markdown directly

  function observeHeadings() {
    const links = tocEl.querySelectorAll('a[href^="#"]');
    const map = new Map();
    links.forEach((l) => map.set(l.getAttribute('href').slice(1), l));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = map.get(id);
          if (link) link.classList.toggle('active', entry.isIntersecting);
        });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.01 }
    );

    contentEl.querySelectorAll('h2').forEach((h) => observer.observe(h));
  }
})();
