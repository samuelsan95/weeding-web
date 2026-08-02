export const weddingDate = new Date('2027-06-26T18:00:00')

export const schedule = [
  { time: '18:00', event: 'Llegada' },
  { time: '19:00', event: 'Ceremonia' },
  { time: '20:30', event: 'Cocktail' },
  { time: '22:00', event: 'Cena' },
  { time: '00:00', event: 'Fiesta' }
]

const logoUrl = new URL('../assets/logo.png', import.meta.url).href

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

const THUMB_WIDTHS = [600, 1200]
const LIGHTBOX_WIDTHS = [1600, 2400]

function buildVariantSet(publicId, widths, sizesAttr, transform) {
  return {
    srcset: widths
      .map((w) => `${CLOUDINARY_BASE}/${transform},w_${w}/${publicId} ${w}w`)
      .join(', '),
    sizes: sizesAttr,
    src: `${CLOUDINARY_BASE}/${transform},w_${widths[widths.length - 1]}/${publicId}`,
  }
}

function buildPhoto(id, publicId, alt) {
  return {
    id,
    alt,
    thumb: buildVariantSet(
      publicId,
      THUMB_WIDTHS,
      '(max-width: 768px) 100vw, 70vw',
      'c_fill,q_auto,f_auto'
    ),
    full: buildVariantSet(
      publicId,
      LIGHTBOX_WIDTHS,
      '100vw',
      'c_limit,q_auto,f_auto'
    ),
  }
}

export const photos = [
  buildPhoto(1, 'boda-1_rzspfg', 'La finca al atardecer'),
  buildPhoto(2, 'boda-2_uheifj', 'La finca al atardecer'),
  buildPhoto(3, 'boda-3_vjtict', 'La finca al atardecer'),
  buildPhoto(4, 'boda-4_ozgbef', 'La finca al atardecer'),
  buildPhoto(5, 'boda-5_didaeg', 'La finca al atardecer'),
  buildPhoto(6, 'boda-6_jzlslw', 'La finca al atardecer'),
  buildPhoto(7, 'boda-7_vszjw2', 'La finca al atardecer'),
  buildPhoto(8, 'boda-8_tcwo7p', 'La finca al atardecer'),
  buildPhoto(9, 'boda-9_unsl95', 'La finca al atardecer'),
  buildPhoto(10, 'boda-10_mgtwz5', 'La finca al atardecer'),
  buildPhoto(11, 'boda-11_gfn1a3', 'La finca al atardecer')
]

export const location = {
  name: 'Finca Los Rosales de Cubas',
  address: 'Calle Cam. de Madrid, s/n, 28978 \n Cubas de la Sagra, Madrid',
  mapsUrl: 'https://www.google.com/maps/search/Finca+Los+Rosales+de+Cubas+Madrid'
}
