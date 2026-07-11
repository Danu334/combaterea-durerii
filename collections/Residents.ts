import type { CollectionConfig } from 'payload'

const Residents: CollectionConfig = {
  slug: 'residents',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['nume', 'prenume', 'email', 'telefon', 'spital'],
    group: 'Congress Registrations',
  },
  fields: [
    { name: 'nume', type: 'text', required: true },
    { name: 'prenume', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'telefon', type: 'text', required: true },
    { name: 'adresa', type: 'text', required: true },
    { name: 'spital', type: 'text', required: true },
    { name: 'specialitate', type: 'text', required: true },
  ],
}

export default Residents
