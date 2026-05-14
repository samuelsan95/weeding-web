export const weddingDate = new Date('2027-06-26T18:00:00')

export const schedule = [
  { time: '18:00', event: 'Llegada' },
  { time: '19:00', event: 'Ceremonia' },
  { time: '20:30', event: 'Cocktail' },
  { time: '22:00', event: 'Cena' },
  { time: '00:00', event: 'Fiesta' }
]

const logoUrl = new URL('../assets/logo.png', import.meta.url).href
const fincaUrl = new URL('../assets/finca.png', import.meta.url).href

export const photos = [
  { id: 1, src: logoUrl, alt: 'Nuestra boda' },
  { id: 2, src: fincaUrl, alt: 'La finca' }
]

export const location = {
  name: 'Finca Los Rosales de Cubas',
  address: 'Calle Cam. de Madrid, s/n, 28978 Cubas de la Sagra, Madrid',
  mapsUrl: 'https://www.google.com/maps/search/Finca+Los+Rosales+de+Cubas+Madrid'
}