import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_COMPARE, searchText, filterProducts, toggleComparison, filterStores, compositionLabel } from '../src/domain.mjs';

const product = (id, properties = {}) => ({ id, name: 'Яблочная пастила', categoryId: '1', categoryName: 'Белёвская пастила', tasteTags: ['Яблоко'], weightGrams: 100, sugarAdded: null, ingredients: null, compositionStatus: 'needs-confirmation', ...properties });
const ids = values => values.map(value => value.id);

test('поиск объединяет е и ё, регистр и Unicode, сохраняя смысл запроса', () => {
  assert.equal(searchText('  БЕЛЁВСКАЯ  '), 'белевская');
  assert.equal(searchText('е\u0308'), 'е');
  const products = [product('apple'), product('cherry', { name: 'Пастила с вишней', categoryName: 'Фруктовые сладости', tasteTags: ['Вишня'] })];
  assert.deepEqual(ids(filterProducts(products, { query: 'белевская' })), ['apple']);
  assert.deepEqual(ids(filterProducts(products, { query: 'ВИШНЯ' })), ['cherry']);
  assert.deepEqual(ids(filterProducts(products, { query: 'несуществующий вкус' })), []);
});

test('маркировка без добавления сахара исключает неизвестный состав', () => {
  const products = [product('no', { sugarAdded: false }), product('yes', { sugarAdded: true }), product('unknown')];
  assert.deepEqual(ids(filterProducts(products, { sugar: 'no' })), ['no']);
  assert.deepEqual(ids(filterProducts(products, { sugar: 'yes' })), ['yes']);
  assert.deepEqual(ids(filterProducts(products)), ['no', 'yes', 'unknown']);
});

test('границы массы не пересекаются и неизвестная масса не попадает в размерный фильтр', () => {
  const products = [0, 1, 100, 101, 250, 251, null, undefined, -5].map((weightGrams, index) => product(String(index), { weightGrams }));
  assert.deepEqual(ids(filterProducts(products, { weight: 'small' })), ['1', '2']);
  assert.deepEqual(ids(filterProducts(products, { weight: 'medium' })), ['3', '4']);
  assert.deepEqual(ids(filterProducts(products, { weight: 'large' })), ['5']);
});

test('сочетание фильтров сохраняет категорию и точный вкус', () => {
  const products = [product('small', { tasteTags: ['Клюква'], sugarAdded: false }), product('large', { tasteTags: ['Клюква'], weightGrams: 200, sugarAdded: false }), product('other-category', { categoryId: '5', tasteTags: ['Клюква'], sugarAdded: false })];
  assert.deepEqual(ids(filterProducts(products, { category: '1', taste: 'клюква', sugar: 'no', weight: 'small' })), ['small']);
  assert.deepEqual(ids(filterProducts(products, { taste: 'клю' })), []);
});

const valid = new Set(['a', 'b', 'c', 'd']);
test('сравнение допускает ровно три товара и сообщает о пределе', () => {
  assert.equal(MAX_COMPARE, 3);
  assert.deepEqual(toggleComparison(['a', 'b'], 'c', valid), { ids: ['a', 'b', 'c'], added: true, limit: false });
  assert.deepEqual(toggleComparison(['a', 'b', 'c'], 'd', valid), { ids: ['a', 'b', 'c'], added: false, limit: true });
});

test('товар удаляется из заполненного сравнения и освобождает место', () => {
  const removed = toggleComparison(['a', 'b', 'c'], 'b', valid);
  assert.deepEqual(removed, { ids: ['a', 'c'], added: false, limit: false });
  assert.deepEqual(toggleComparison(removed.ids, 'd', valid), { ids: ['a', 'c', 'd'], added: true, limit: false });
});

test('восстановленный список сравнения очищается от повторов, чужих ID и лишних позиций', () => {
  assert.deepEqual(toggleComparison(['missing', 'a', 'a', 'b'], 'c', valid), { ids: ['a', 'b', 'c'], added: true, limit: false });
  assert.deepEqual(toggleComparison(['a', 'a', 'b', 'c', 'd'], 'missing', valid), { ids: ['a', 'b', 'c'], added: false, limit: false });
});

test('неизвестный товар не добавляется в сравнение', () => {
  assert.deepEqual(toggleComparison(['a'], 'missing', valid), { ids: ['a'], added: false, limit: false });
});

const stores = [
  { id: 'moscow', name: 'Перекрёсток', city: 'Москва', address: 'Новый Арбат, 15' },
  { id: 'region', name: 'Глобус', city: 'Московская область', address: 'Новорижское шоссе, 22-й км' },
  { id: 'belev', name: 'Фирменный магазин', city: 'Белёв', address: 'Улица Советская, 21' },
];
test('выбор города точный: Москва не включает область, Белёв находится через е', () => {
  assert.deepEqual(ids(filterStores(stores, { city: '  МОСКВА ' })), ['moscow']);
  assert.deepEqual(ids(filterStores(stores, { city: 'белев' })), ['belev']);
  assert.deepEqual(ids(filterStores(stores, { city: 'Мос' })), []);
});

test('поиск магазинов проходит по названию и адресу вместе с городом', () => {
  assert.deepEqual(ids(filterStores(stores, { query: 'перекресток' })), ['moscow']);
  assert.deepEqual(ids(filterStores(stores, { query: 'советская' })), ['belev']);
  assert.deepEqual(ids(filterStores(stores, { city: 'Москва', query: 'шоссе' })), []);
  assert.deepEqual(ids(filterStores(stores, { city: 'Москва', query: 'арбат' })), ['moscow']);
});

test('противоречивый или пустой состав не выдаётся за подтверждённый', () => {
  const message = 'Уточняйте состав на актуальной упаковке';
  assert.equal(compositionLabel(product('unknown')), message);
  assert.equal(compositionLabel(product('stale', { ingredients: 'Яблоки, сахар', compositionStatus: 'needs-confirmation' })), message);
  assert.equal(compositionLabel(product('empty', { ingredients: null, compositionStatus: 'published' })), message);
});

test('подтверждённый состав показывается без изменения рецептуры', () => {
  assert.equal(compositionLabel(product('known', { ingredients: 'Яблоки, яичный белок', compositionStatus: 'published' })), 'Яблоки, яичный белок');
});
