import type { CollectionConfig } from 'payload'

const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'maib_session_id',
    defaultColumns: ['ticket_type', 'status', 'price_mdl', 'handzone', 'satellite_workshop'],
    group: 'Congress Registrations',
  },
  fields: [
    {
      name: 'ticket_type',
      type: 'select',
      required: true,
      label: 'Ticket Type',
      options: ['Student', 'Resident', 'Nurse'],
    },
    { name: 'price_mdl', type: 'number', required: true, label: 'Price (MDL)' },
    {
      name: 'handzone',
      type: 'select',
      required: true,
      defaultValue: 'none',
      options: ['none', 'botulinum', 'locoregional', 'locoregional-periop'],
    },
    {
      name: 'satellite_workshop',
      type: 'select',
      required: true,
      defaultValue: 'none',
      label: 'Satellite Workshop',
      options: ['none', 'y2y', 'imagistica'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: ['pending', 'paid', 'cancelled'],
    },
    { name: 'maib_session_id', type: 'text', label: 'MAIB Session ID' },
    { name: 'image_url', type: 'text', label: 'Image URL' },
    { name: 'student', type: 'relationship', relationTo: 'students' },
    { name: 'resident', type: 'relationship', relationTo: 'residents' },
    { name: 'nurse', type: 'relationship', relationTo: 'nurses' },
  ],
}

export default Tickets
