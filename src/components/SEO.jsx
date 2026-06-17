import { Helmet } from 'react-helmet-async'

export default function SEO({ 
  title = 'RYZ Shortlink', 
  description = 'A premium, lightning-fast URL shortener designed to boost your click-through rates. Track, manage, and optimize your links.',
  keywords = 'url shortener, shortlink, ryz, link management, custom domain, analytics',
  image = '/og-image.png',
  url = 'https://ryz.my.id'
}) {
  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph metadata */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
