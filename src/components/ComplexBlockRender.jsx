import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function ComplexBlockRender({ link, theme, onClick }) {
  const {
    type, title, subtitle, thumbnail_url, icon,
    price, discount_price, button_text, description,
    duration, event_date, stock
  } = link;

  const isDark = theme.bg_type === 'color' && ['#000000', '#1a1a1a', '#0f172a'].includes(theme.bg_value);
  const cardBg = theme.button_bg || (isDark ? 'rgba(255,255,255,0.08)' : '#ffffff');
  const cardText = theme.button_text || (isDark ? '#ffffff' : '#1e293b');
  const actionBg = theme.text_color || '#0b5cff';
  const actionText = theme.bg_type === 'color' ? theme.bg_value : '#ffffff';

  let badgeText = '';
  let subInfo = '';

  if (type === 'digital_product') {
    badgeText = 'Digital';
  } else if (type === 'appointment') {
    badgeText = 'Booking';
    subInfo = duration ? `${duration} Min` : 'Session';
  } else if (type === 'event') {
    badgeText = 'Event';
    subInfo = event_date ? new Date(event_date).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : 'Upcoming';
  } else if (type === 'physical_product') {
    badgeText = 'Physical';
    subInfo = stock ? `${stock} left` : 'In Stock';
  } else if (type === 'blog') {
    badgeText = 'Blog';
    const chapCount = link.chapters_count ?? (link.chapters ? link.chapters.length : 0);
    subInfo = chapCount > 0 ? `${chapCount} Chapters` : 'Reading';
  }

  const plainDescription = description ? description.replace(/<[^>]+>/g, '') : '';
  const isFree = !price || price == 0 || isNaN(price);

  const reviews = link.reviews || [];
  let avgRating = 0;
  if (reviews.length > 0) {
    avgRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
  }

  // Prevent pill-shapes on large complex cards
  let blockStyle = theme.button_style || '';
  if (blockStyle.includes('rounded-full')) {
    blockStyle = blockStyle.replace('rounded-full', 'rounded-[2rem]');
  }

  const layout = link.block_layout || 'default';

  let isReleased = true;
  if (link.set_release_time && link.release_time) {
    const releaseDate = new Date(link.release_time);
    if (new Date() < releaseDate) {
      isReleased = false;
    }
  }

  const handleAction = (e) => {
    e.preventDefault();
    if (!isReleased) return;
    if (onClick) onClick(link);
  };

  const renderThumbnail = (className) => (
    <div className={`relative flex flex-col justify-center bg-black/5 overflow-hidden ${className}`}>
      {thumbnail_url ? (
        <img src={thumbnail_url} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
          {icon && LucideIcons[icon] ? (
            React.createElement(LucideIcons[icon], { className: "w-8 h-8" })
          ) : (
            <LucideIcons.Image className="w-8 h-8" />
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 mix-blend-multiply"></div>
    </div>
  );

  const renderActionButton = (className) => (
    <div 
      className={`font-black rounded-lg shadow-sm transition-transform ${isReleased ? 'hover:scale-105' : 'opacity-70'} ${className}`} 
      style={{ backgroundColor: isReleased ? actionBg : '#94a3b8', color: isReleased ? actionText : '#ffffff' }}
    >
      {!isReleased ? 'Coming Soon' : (button_text || 'Beli Sekarang')}
    </div>
  );

  if (layout === 'compact') {
    return (
      <button
        onClick={handleAction}
        className={`block w-full text-left transition-all duration-300 ${theme.button_animation || 'hover:scale-[1.02]'} active:scale-[0.98] ${blockStyle} ${theme.button_border || 'border border-transparent'} ${theme.button_shadow || 'shadow-sm'} relative overflow-hidden flex flex-row items-center p-2 sm:p-3`}
        style={{ backgroundColor: cardBg, color: cardText }}
      >
        {renderThumbnail("w-14 h-14 sm:w-16 sm:h-16 rounded-md shrink-0")}
        <div className="px-3 flex flex-col flex-1 relative z-20">
          <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-1">{title || 'Untitled Product'}</h3>
          {type !== 'blog' && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-black text-xs sm:text-sm" style={{ color: isFree ? (theme.text_color || '#0b5cff') : cardText }}>
                {isFree ? 'FREE' : `Rp ${parseInt(price).toLocaleString('id-ID')}`}
              </span>
              {discount_price && <span className="text-[10px] line-through opacity-40">{discount_price}</span>}
            </div>
          )}
        </div>
        {type !== 'blog' && (
          <div className="shrink-0">
            {renderActionButton("text-[10px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2")}
          </div>
        )}
      </button>
    );
  }

  const isVertical = layout === 'large_image' || layout === 'grid';

  return (
    <button
      onClick={handleAction}
      className={`block w-full text-left transition-all duration-300 ${theme.button_animation || 'hover:scale-[1.02]'} active:scale-[0.98] ${blockStyle} ${theme.button_border || 'border border-transparent'} ${theme.button_shadow || 'shadow-sm'} relative overflow-hidden flex ${isVertical ? 'flex-col' : 'flex-row'} items-stretch`}
      style={{ backgroundColor: cardBg, color: cardText, padding: 0 }}
    >
      {/* Thumbnail */}
      {renderThumbnail(
        layout === 'large_image' ? "w-full h-48 sm:h-56" : 
        layout === 'grid' ? "w-full aspect-square" : 
        "w-28 sm:w-36 shrink-0"
      )}

      {/* Content */}
      <div className={`p-4 sm:p-5 flex flex-col justify-between flex-1 w-full relative z-20`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2">{title || 'Untitled Product'}</h3>
            {subInfo && (
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-50 mt-1">{subInfo}</p>
            )}
            {reviews.length > 0 && (
              <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs font-bold" style={{ color: isDark ? '#fbbf24' : '#eab308' }}>
                ⭐ {avgRating} <span style={{ color: cardText }} className="opacity-50 font-medium">({reviews.length})</span>
              </div>
            )}
          </div>
          <div className="shrink-0 px-2 py-1 bg-black/5 backdrop-blur-md rounded border border-black/5 text-[9px] font-black uppercase tracking-widest opacity-80">
            {badgeText}
          </div>
        </div>
        
        {plainDescription && (
          <p className="text-xs sm:text-sm leading-relaxed opacity-70 line-clamp-2 mb-4">
            {plainDescription}
          </p>
        )}

        {type !== 'blog' && (
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5">
            <div className="flex flex-col">
              {discount_price && (
                <span className="text-[10px] line-through opacity-40 mb-[-2px]">{discount_price}</span>
              )}
              <span className="font-black" style={{ color: isFree ? (theme.text_color || '#0b5cff') : cardText }}>
                {isFree ? 'FREE' : `Rp ${parseInt(price).toLocaleString('id-ID')}`}
              </span>
            </div>
            {renderActionButton("text-[10px] sm:text-xs px-4 py-2")}
          </div>
        )}
      </div>
    </button>
  );
}
