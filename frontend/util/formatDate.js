
const monthNames = [
  'ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
]

export default function formatDate(dt) {
  dt = new Date(dt)
  return `${dt.getDate()}. ${monthNames[dt.getMonth()]} ${dt.getFullYear()}`
}
