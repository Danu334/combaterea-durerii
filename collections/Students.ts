import type { CollectionConfig } from 'payload'

const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['nume', 'prenume', 'email', 'telefon'],
    group: 'Congress Registrations',
  },
  fields: [
    { name: 'nume', type: 'text', required: true },
    { name: 'prenume', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'telefon', type: 'text', required: true },
    { name: 'adresa', type: 'text', required: true },
    { name: 'carnet_id', type: 'text', required: true, label: 'Carnet ID' },
  ],
}

export default Students
