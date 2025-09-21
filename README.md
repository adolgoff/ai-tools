# Каталог AI‑инструментов (статический сайт)

Статический справочник с последними AI‑инструментами: видео/изображения/текст, LLM‑провайдеры, помощники для кода, сборщики приложений, локальные рантаймы и модели.

## Содержимое
- `tools.md` — основной контент (Markdown)
- `index.html` — страница рендера
- `styles.css` — стиль (светлая/тёмная тема)
- `script.js` — рендеринг Markdown, оглавление, якоря

## Локальный просмотр
Откройте `index.html` в браузере (двойной клик или через локальный http‑сервер). Все ссылки в `tools.md` кликабельны.

## Публикация на GitHub Pages (ветка `main`, корень)
1) Создайте публичный репозиторий (например, `ai-tools-catalog`) и запушьте файлы:
```
# однажды
git init
git add .
git commit -m "feat: initial static catalog of AI tools"

# создайте репозиторий и запушьте (через GitHub CLI)
# замените USER на ваш логин, либо используйте `gh repo create`
# gh repo create ai-tools-catalog --public --source=. --remote=origin --push
```
2) Включите Pages: Settings → Pages → Branch: `main` / Folder: `/ (root)` → Save.
3) Откройте: `https://<USER>.github.io/ai-tools-catalog/`

Примечание: CI не используется (по требованию). Проект — чистая статика.
