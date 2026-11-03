// Helper bersama untuk halaman publik NEXORA (tanpa akses jaringan di level modul).

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';
export const safeUrl = (u) => { try { const x = new URL(String(u)); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } };
// Baris hasil embed hanya dipakai jika published (atau kolomnya tidak ikut di-select).
export const visible = (r) => !!r && (r.publication_status === undefined || r.publication_status === 'published');

const GENDER_ID = { male: 'Laki-laki', female: 'Perempuan', m: 'Laki-laki', f: 'Perempuan', unknown: 'Tidak diketahui', other: 'Lainnya', 'non-binary': 'Non-biner', nonbinary: 'Non-biner' };
export const genderLabel = (g) => GENDER_ID[String(g).trim().toLowerCase()] || String(g).trim();

// Hanya format tanggal ISO (YYYY-MM-DD); teks bebas seperti "10 Oktober" ditampilkan apa adanya.
export function fmtDate(d) {
  if (!has(d)) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(d))) return String(d);
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function snippet(text, max = 140) {
  const t = String(text ?? '').replace(/[#*_`>\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

// Tabel "universe" yang punya halaman daftar + detail yang sama bentuknya.
export const ENTITY = {
  organizations: { label: 'Organisasi', icon: '⌘', junction: 'character_organizations', fk: 'organization_id' },
  clans: { label: 'Klan', icon: '◇', junction: 'character_clans', fk: 'clan_id' },
  teams: { label: 'Tim', icon: '♧', junction: 'character_teams', fk: 'team_id' },
  abilities: { label: 'Kemampuan', icon: '✦', junction: 'character_abilities', fk: 'ability_id' },
  locations: { label: 'Lokasi', icon: '⌖', junction: 'character_locations', fk: 'location_id' },
};

export const TYPE_LABEL = { anime: 'Anime', character: 'Karakter', article: 'Lore', ...Object.fromEntries(Object.entries(ENTITY).map(([k, v]) => [k, v.label])) };

export function makeUrls(base) {
  const b = String(base || '').replace(/\/+$/, '');
  const q = encodeURIComponent;
  return {
    base: b,
    anime: (s) => `${b}/anime/detail/?slug=${q(s)}`,
    character: (s) => `${b}/characters/detail/?slug=${q(s)}`,
    entity: (t, s) => `${b}/universe/detail/?type=${q(t)}&slug=${q(s)}`,
    article: (s) => `${b}/lore/detail/?slug=${q(s)}`,
    byType: (type, s) => (type === 'anime' ? `${b}/anime/detail/?slug=${q(s)}`
      : type === 'character' ? `${b}/characters/detail/?slug=${q(s)}`
      : type === 'article' ? `${b}/lore/detail/?slug=${q(s)}`
      : `${b}/universe/detail/?type=${q(type)}&slug=${q(s)}`),
  };
}

// Ambil semua baris published, per 1000 baris.
export async function fetchPublished(supabase, table, columns, orderCol) {
  const SIZE = 1000, rows = [];
  for (let from = 0; ; from += SIZE) {
    const { data, error } = await supabase.from(table).select(columns).eq('publication_status', 'published')
      .order(orderCol, { ascending: true }).order('id', { ascending: true }).range(from, from + SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < SIZE) break;
  }
  return rows;
}

// Query pelengkap: jika gagal (mis. nama kolom/relasi berbeda), halaman tetap tampil.
export async function soft(label, run) {
  try {
    const { data, error } = await run();
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn(`[NEXORA] ${label} dilewati:`, err?.message || err);
    return [];
  }
}

// ---------- Favorit (disimpan di browser) ----------
const FAV_KEY = 'nexora:favorites';
export function getFavs() {
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    return Array.isArray(v) ? v.filter((f) => f && f.type && f.slug) : [];
  } catch { return []; }
}
function saveFavs(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); return true; } catch { return false; } }
export const isFav = (type, slug) => getFavs().some((f) => f.type === type && f.slug === slug);
export function toggleFav(item) {
  const list = getFavs();
  const i = list.findIndex((f) => f.type === item.type && f.slug === item.slug);
  if (i >= 0) list.splice(i, 1);
  else list.unshift({ type: item.type, slug: item.slug, title: item.title || '', image: item.image || '', sub: item.sub || '', added: Date.now() });
  return saveFavs(list);
}
export function removeFav(type, slug) { saveFavs(getFavs().filter((f) => !(f.type === type && f.slug === slug))); }
export function clearFavs() { saveFavs([]); }
export function bindFav(btn, item) {
  const paint = () => {
    const on = isFav(item.type, item.slug);
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? '♥ Tersimpan di favorit' : '♡ Simpan ke favorit';
  };
  paint();
  btn.addEventListener('click', () => {
    if (!toggleFav(item)) { btn.textContent = 'Gagal menyimpan (penyimpanan browser dinonaktifkan)'; return; }
    paint();
  });
}
