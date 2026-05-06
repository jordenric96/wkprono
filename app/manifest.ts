import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WK Pronostiek 2026',
    short_name: 'WKPRONO',
    description: 'De ultieme WK 2026 Pronostiek App met vele klassementen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F3C98B', // Apricot Cream
    theme_color: '#F56960',      // Vibrant Coral
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}