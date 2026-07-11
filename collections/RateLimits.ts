import type { CollectionConfig } from 'payload'

const RateLimits: CollectionConfig = {
  slug: 'rate_limits',
  admin: {
    useAsTitle: 'ip',
    defaultColumns: ['ip', 'createdAt'],
    group: 'System',
  },
  fields: [
    { name: 'ip', type: 'text', required: true },
  ],
}

export default RateLimits
