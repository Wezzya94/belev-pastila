export const MAX_COMPARE = 3;
export function searchText(value) { return String(value ?? '').normalize('NFKC').toLocaleLowerCase('ru').replaceAll('ё','е').trim(); }
export function filterProducts(products, {query='',category='',taste='',sugar='',weight=''}={}) {
  const q=searchText(query);
  return products.filter(p => (!q || searchText([p.name,p.categoryName,...(p.tasteTags||[])].join(' ')).includes(q))
    && (!category || String(p.categoryId)===category)
    && (!taste || (p.tasteTags||[]).some(t=>searchText(t)===searchText(taste)))
    && (!sugar || (sugar==='no' ? p.sugarAdded===false : p.sugarAdded===true))
    && (!weight || (weight==='small' ? p.weightGrams>0&&p.weightGrams<=100 : weight==='medium' ? p.weightGrams>100&&p.weightGrams<=250 : p.weightGrams>250)));
}
export function toggleComparison(ids, id, validIds) {
  const clean=[...new Set(ids)].filter(x=>validIds.has(x)).slice(0,MAX_COMPARE);
  if(clean.includes(id)) return {ids:clean.filter(x=>x!==id), added:false, limit:false};
  if(!validIds.has(id)) return {ids:clean, added:false, limit:false};
  if(clean.length>=MAX_COMPARE) return {ids:clean, added:false, limit:true};
  return {ids:[...clean,id], added:true, limit:false};
}
export function filterStores(stores,{city='',query=''}={}) {
 const q=searchText(query);
 return stores.filter(s=>(!city||searchText(s.city)===searchText(city))&&(!q||searchText([s.name,s.city,s.address].join(' ')).includes(q)));
}
export function compositionLabel(p) { return p.compositionStatus==='needs-confirmation' || !p.ingredients ? 'Уточняйте состав на актуальной упаковке' : p.ingredients; }
