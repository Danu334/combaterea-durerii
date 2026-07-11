import type { CollectionConfig } from 'payload'

const Nurses: CollectionConfig = {
  slug: 'nurses',
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
    { name: 'sectie', type: 'text', required: true },
  ],
}

export default Nurses
