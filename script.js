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
      injectSectionDescriptions();
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

  // Insert short per-section descriptions as blockquotes under H2,
  // using the summary list from the final "Чем отличаются категории" section.
  function injectSectionDescriptions() {
    // Collect summary bullets from the final section if present
    const summaryHeader = Array.from(contentEl.querySelectorAll('h2'))
      .find((h) => h.textContent.trim().toLowerCase().startsWith('чем отличаются категории'));
    const summaryList = summaryHeader ? summaryHeader.nextElementSibling : null;
    const lines = [];
    if (summaryList && summaryList.tagName === 'UL') {
      summaryList.querySelectorAll('li').forEach((li) => lines.push(li.textContent.trim()));
    }

    // Fallback hardcoded summaries if the section is absent
    const defaults = {
      video: 'Генераторы видео: создают клипы по описанию. Подходят для креатива, маркетинга и прототипов.',
      images: 'Генераторы изображений: создают/редактируют картинки по тексту. Уместны для дизайна, идей и быстрых макетов.',
      text: 'Помогаторы текста: улучшают стиль, структуру и тон, экономят время на редактуру.',
      llms: 'LLM‑провайдеры: отличаются качеством, ценой и безопасностью; это «двигатели» интеллекта (API/приложения).',
      code: 'Помощники для кода/IDE: ускоряют набор кода и понимание проекта (Copilot — плагин; Cursor/Zed — IDE с AI).',
      builders: 'Сборщики приложений: генерируют веб‑приложения из описания; отличаются глубиной автогенерации и интеграциями.',
      runtimes: 'Локальные рантаймы/модели: всё работает на вашем ПК (контроль и приватность), но зависит от железа.'
    };

    // Try to parse dynamic summaries into a map
    const map = new Map();
    lines.forEach((l) => {
      const lower = l.toLowerCase();
      if (lower.startsWith('генераторы видео/изображений')) {
        map.set('video', l);
        map.set('images', l);
      } else if (lower.startsWith('помогаторы текста')) map.set('text', l);
      else if (lower.startsWith('llm‑провайдеры') || lower.startsWith('llm-провайдеры')) map.set('llms', l);
      else if (lower.startsWith('помощники для кода')) map.set('code', l);
      else if (lower.startsWith('сборщики приложений')) map.set('builders', l);
      else if (lower.startsWith('локальные рантаймы/модели')) {
        map.set('runtimes', l);
      }
    });

    const get = (key) => map.get(key) || defaults[key];

    // Find H2 sections and inject blockquotes beneath
    const sections = Array.from(contentEl.querySelectorAll('h2'));
    sections.forEach((h2) => {
      const title = h2.textContent.trim().toLowerCase();
      let text = null;
      if (title.startsWith('генерация видео')) text = get('video');
      else if (title.startsWith('изображения')) text = get('images');
      else if (title.startsWith('помогаторы для текста')) text = get('text');
      else if (title.startsWith('llm')) text = get('llms');
      else if (title.startsWith('помощники для кода')) text = get('code');
      else if (title.startsWith('сборщики приложений')) text = get('builders');
      else if (title.startsWith('локальные рантаймы')) text = get('runtimes');
      else if (title.startsWith('локальные модели')) text = get('runtimes');

      if (text) {
        const bq = document.createElement('blockquote');
        bq.className = 'section-desc';
        bq.textContent = text;
        // Insert after the h2 and before any other content
        if (h2.nextSibling) h2.parentNode.insertBefore(bq, h2.nextSibling);
        else h2.parentNode.appendChild(bq);
      }
    });

    // Hide the summary section at the end (we inlined its info)
    if (summaryHeader) {
      // Remove header and its following list
      if (summaryList) summaryList.remove();
      summaryHeader.remove();
    }
  }

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
