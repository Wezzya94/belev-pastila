import { readFile, readdir, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
const assetRoot = path.join(root, 'assets');
const issues = [];
const check = (condition, message) => { if (!condition) issues.push(message); };
const label = target => path.relative(root, target).split(path.sep).join('/');
const within = (parent, target) => {
  const relative = path.relative(parent, target);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const nullableString = value => value === null || nonempty(value);
const nullableNumber = value => value === null || (typeof value === 'number' && Number.isFinite(value) && value > 0);
const httpUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol); } catch { return false; } };
const officialUrl = value => { try { return httpUrl(value) && new URL(value).hostname === 'pastila1881.com'; } catch { return false; } };

async function load(relative) {
  try { return JSON.parse(await readFile(path.join(root, relative), 'utf8')); }
  catch (error) { issues.push(`${relative}: JSON не читается (${error.code || error.name})`); return null; }
}
function exactKeys(value, keys, context) {
  if (!object(value)) { issues.push(`${context}: ожидается объект`); return false; }
  const missing = keys.filter(key => !(key in value));
  const extra = Object.keys(value).filter(key => !keys.includes(key));
  check(!missing.length && !extra.length, `${context}: неизвестная схема, недостающие поля [${missing}], лишние [${extra}]`);
  return true;
}
function unique(values, context) {
  const seen = new Set();
  for (const value of values) { check(!seen.has(value), `${context}: повтор ${String(value)}`); seen.add(value); }
}
async function regularFile(target, boundary, context) {
  if (!within(boundary, target)) { issues.push(`${context}: путь выходит за разрешённую папку`); return false; }
  try {
    const info = await stat(target);
    check(info.isFile(), `${context}: ожидается обычный файл`);
    check(info.size > 0 || path.basename(target) === '.nojekyll', `${context}: пустой ресурс`);
    const [resolvedTarget, resolvedBoundary, resolvedProject] = await Promise.all([realpath(target), realpath(boundary), realpath(root)]);
    check(within(resolvedBoundary, resolvedTarget) && within(resolvedProject, resolvedTarget), `${context}: файловая ссылка выходит за разрешённую папку`);
    return info.isFile() && within(resolvedBoundary, resolvedTarget) && within(resolvedProject, resolvedTarget);
  } catch (error) { issues.push(`${context}: файл отсутствует или недоступен (${error.code || error.name})`); return false; }
}
async function localAsset(value, context) {
  if (!nonempty(value) || value.includes('\\') || !value.startsWith('assets/') || value.split('/').includes('..') || path.isAbsolute(value)) {
    issues.push(`${context}: нужен переносимый путь внутри assets/`); return;
  }
  await regularFile(path.resolve(root, value), assetRoot, context);
}
async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(target));
      else if (entry.isFile()) files.push(target);
      else if (entry.isSymbolicLink()) issues.push(`${label(target)}: файловая ссылка в сборке`);
    }
    return files;
  } catch (error) { issues.push(`${label(directory)}: папка отсутствует (${error.code || error.name})`); return []; }
}

const [products, stores, brand, assets] = await Promise.all([
  load('content/products.json'), load('content/stores.json'), load('content/brand.json'), load('content/assets.json'),
]);
const productKeys = ['id', 'slug', 'name', 'categoryId', 'categoryName', 'tasteTags', 'weightGrams', 'ingredients', 'compositionStatus', 'sugarAdded', 'energyKcal', 'storage', 'sourceUrl', 'images', 'featured'];
const storeKeys = ['id', 'name', 'city', 'address', 'url', 'phone', 'sourceUrl', 'productIds', 'availabilityKnown'];
check(Array.isArray(products) && products.length > 0, 'content/products.json: каталог не должен быть пустым');
check(Array.isArray(stores) && stores.length > 0, 'content/stores.json: список адресов обязателен');
check(object(brand) && Array.isArray(brand.categories), 'content/brand.json: бренд и категории обязательны');
check(object(assets) && object(assets.byUrl), 'content/assets.json: карта byUrl обязательна');
const productIds = new Set(Array.isArray(products) ? products.map(product => product?.id) : []);
const categories = new Map(Array.isArray(brand?.categories) ? brand.categories.filter(object).map(category => [category.id, category.name]) : []);
const allImageUrls = new Set();
if (Array.isArray(products)) {
  unique(products.map(product => product?.id), 'ID товаров');
  unique(products.map(product => product?.slug), 'URL-имена товаров');
  for (const product of products) {
    const context = `Товар ${product?.id ?? '?'}`;
    if (!exactKeys(product, productKeys, context)) continue;
    check(typeof product.id === 'string' && /^\d+$/.test(product.id), `${context}: некорректный ID`);
    check(nonempty(product.slug) && /^[a-z0-9-]+$/.test(product.slug), `${context}: некорректное URL-имя`);
    check(nonempty(product.name) && nonempty(product.categoryName), `${context}: пустое название`);
    check(typeof product.categoryId === 'string' && categories.get(product.categoryId) === product.categoryName, `${context}: неизвестная категория`);
    check(Array.isArray(product.tasteTags) && product.tasteTags.every(nonempty), `${context}: некорректные вкусы`);
    check(nullableNumber(product.weightGrams), `${context}: некорректная масса`);
    check(nullableNumber(product.energyKcal), `${context}: некорректная энергетическая ценность`);
    check(nullableString(product.storage), `${context}: некорректные условия хранения`);
    check(nullableString(product.ingredients), `${context}: некорректный состав`);
    check(['published', 'needs-confirmation'].includes(product.compositionStatus), `${context}: неизвестный статус состава`);
    check(product.sugarAdded === null || typeof product.sugarAdded === 'boolean', `${context}: сахар должен быть true, false или null`);
    if (product.compositionStatus === 'needs-confirmation') {
      check(product.ingredients === null && product.sugarAdded === null, `${context}: неподтверждённый состав должен оставаться неизвестным`);
    } else check(nonempty(product.ingredients), `${context}: опубликованный состав пуст`);
    check(typeof product.featured === 'boolean', `${context}: некорректный признак избранного`);
    check(officialUrl(product.sourceUrl) && new URL(product.sourceUrl).pathname === `/good/${product.id}`, `${context}: некорректный источник`);
    check(Array.isArray(product.images) && product.images.length > 0, `${context}: изображения обязательны`);
    for (const image of Array.isArray(product.images) ? product.images : []) {
      if (!exactKeys(image, ['url', 'kind', 'alt'], `${context}, фотография`)) continue;
      check(officialUrl(image.url), `${context}: неизвестный источник фотографии`);
      check(['packaging', 'cut', 'product', 'unknown'].includes(image.kind), `${context}: неизвестный тип фотографии`);
      check(nonempty(image.alt), `${context}: отсутствует описание фотографии`);
      allImageUrls.add(image.url);
    }
  }
}
if (Array.isArray(stores)) {
  unique(stores.map(store => store?.id), 'ID магазинов');
  for (const store of stores) {
    const context = `Магазин ${store?.id ?? '?'}`;
    if (!exactKeys(store, storeKeys, context)) continue;
    for (const field of ['id', 'name', 'city', 'address']) check(nonempty(store[field]), `${context}: пустое поле ${field}`);
    check(store.url === null || httpUrl(store.url), `${context}: некорректный сайт магазина`);
    check(nullableString(store.phone), `${context}: некорректный телефон`);
    check(officialUrl(store.sourceUrl), `${context}: неизвестный источник адреса`);
    check(typeof store.availabilityKnown === 'boolean', `${context}: некорректный статус наличия`);
    check(Array.isArray(store.productIds) && store.productIds.every(id => productIds.has(id)), `${context}: неизвестные товары`);
    if (!store.availabilityKnown && Array.isArray(store.productIds)) check(store.productIds.length === 0, `${context}: наличие неизвестно, привязка товаров не подтверждена`);
  }
}
if (object(brand)) {
  for (const field of ['brandName', 'officialName', 'telephone', 'email', 'address']) check(nonempty(brand[field]), `Бренд: поле ${field} обязательно`);
  check(Array.isArray(brand.publishedStory), 'Бренд: опубликованный рассказ должен быть массивом');
  for (const category of Array.isArray(brand.categories) ? brand.categories : []) {
    check(nonempty(category.id) && nonempty(category.name) && officialUrl(category.sourceUrl), 'Бренд: некорректная категория');
  }
  unique(Array.isArray(brand.categories) ? brand.categories.map(category => category?.id) : [], 'ID категорий');
  for (const showcase of Array.isArray(brand.stmShowcase) ? brand.stmShowcase : []) {
    check(officialUrl(showcase.sourceUrl), 'СТМ: некорректный источник');
    for (const image of Array.isArray(showcase.images) ? showcase.images : []) allImageUrls.add(image.url);
  }
}
if (object(assets) && object(assets.byUrl)) {
  for (const url of allImageUrls) check(url in assets.byUrl, `Изображение не локализовано: ${url}`);
  for (const [url, asset] of Object.entries(assets.byUrl)) {
    check(httpUrl(url), 'assets.byUrl: некорректный исходный URL');
    await localAsset(typeof asset === 'string' ? asset : asset?.path, `assets.byUrl: ${url}`);
  }
  const declared = new Set();
  function assetPaths(value, context = 'assets') {
    if (typeof value === 'string') {
      check(!/^[a-z]:[\\/]/i.test(value) && !/^file:/i.test(value), `${context}: абсолютный локальный путь`);
      if (value.startsWith('assets/') && !context.startsWith('assets.inspectedFiles') && !context.startsWith('assets.recycledSourceFiles')) declared.add(value);
      else if (context.endsWith('.path')) issues.push(`${context}: путь должен находиться внутри assets/`);
    } else if (Array.isArray(value)) value.forEach((item, index) => assetPaths(item, `${context}[${index}]`));
    else if (object(value)) for (const [key, item] of Object.entries(value)) assetPaths(item, `${context}.${key}`);
  }
  assetPaths(assets);
  for (const resource of declared) await localAsset(resource, resource);
  for (const pair of Array.isArray(assets.pairs) ? assets.pairs : []) {
    check(productIds.has(String(pair.productId)), 'Фотопара: неизвестный товар');
    check(['sku', 'type'].includes(pair.scope), 'Фотопара: нужно указать область применения');
  }
}

const decodeEntities = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)));
const checkedReferences = new Set();
async function resourceReference(from, value) {
  const reference = decodeEntities(value).trim();
  if (!reference || /^(?:https?:|\/\/|#|mailto:|tel:|data:)/i.test(reference)) return;
  const context = `${label(from)} → ${reference}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(reference) || reference.startsWith('/') || reference.includes('\\')) {
    issues.push(`${context}: непереносимая локальная ссылка`); return;
  }
  let pathname;
  try { pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]); }
  catch { issues.push(`${context}: некорректное кодирование ссылки`); return; }
  let target = path.resolve(path.dirname(from), pathname || '.');
  if (!within(docs, target)) { issues.push(`${context}: ссылка выходит за docs/`); return; }
  try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); }
  catch { /* regularFile reports a missing target with the useful source context. */ }
  const key = `${from}\0${target}`;
  if (checkedReferences.has(key)) return;
  checkedReferences.add(key);
  await regularFile(target, docs, context);
}
const generated = await walk(docs);
const htmlFiles = generated.filter(file => path.extname(file) === '.html');
check(htmlFiles.length >= (products?.length || 0) + 8, 'docs/: неполная сборка, нужны все карточки и основные разделы');
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  check(/<html\b[^>]*\blang=["']ru["']/i.test(html), `${label(file)}: язык страницы не указан`);
  for (const tag of html.matchAll(/<[a-z][^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\s(?:href|src|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      await resourceReference(file, attribute[1] ?? attribute[2] ?? attribute[3]);
    }
    for (const attribute of tag[0].matchAll(/\ssrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      const value = attribute[1] ?? attribute[2];
      if (!/^data:/i.test(value)) for (const candidate of value.split(',')) await resourceReference(file, candidate.trim().split(/\s+/)[0]);
    }
  }
}
for (const file of generated.filter(file => path.extname(file) === '.css')) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi)) await resourceReference(file, match[1] ?? match[2] ?? match[3]);
}
for (const file of generated.filter(file => ['.js', '.mjs'].includes(path.extname(file)))) {
  const js = await readFile(file, 'utf8');
  for (const match of js.matchAll(/\b(?:from\s*|import\s*)["'](\.[^"']+)["']/g)) await resourceReference(file, match[1]);
}
for (const [name, originals] of [['products', products], ['stores', stores]]) {
  try {
    const published = JSON.parse(await readFile(path.join(docs, 'data', `${name}.json`), 'utf8'));
    check(Array.isArray(published) && Array.isArray(originals) && published.length === originals.length, `docs/data/${name}.json: потеря записей при сборке`);
    check(Array.isArray(published) && published.every(item => originals.some(original => original.id === item.id)), `docs/data/${name}.json: неизвестные записи`);
  } catch (error) { issues.push(`docs/data/${name}.json: отсутствует или не читается (${error.code || error.name})`); }
}
for (const relative of ['src/app.js', 'src/domain.mjs', 'src/header.js', 'src/experience.js', 'src/ornaments.mjs', 'src/illustrations.mjs', 'src/heritage.mjs','src/borders.mjs', 'scripts/build.mjs', 'scripts/serve.mjs']) {
  const target = path.join(root, relative);
  if (!await regularFile(target, root, relative)) continue;
  const result = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8', windowsHide: true });
  check(result.status === 0 && !result.error, `${relative}: синтаксис JavaScript не прошёл проверку`);
}
if (issues.length) {
  console.error(`Проверка не пройдена: ${issues.length} проблем.`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: 'ok', products: products.length, stores: stores.length, localImages: allImageUrls.size, htmlPages: htmlFiles.length, localReferences: checkedReferences.size, syntaxFiles: 10 }));
}
