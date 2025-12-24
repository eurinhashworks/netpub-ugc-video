import React from 'react';
import { PortfolioProject } from '../types';
import './PortfolioCard.css';

interface PortfolioCardProps {
  project: PortfolioProject;
  onClick: (project: PortfolioProject) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ project, onClick }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const mediaItems = project.mediaItems || [{ url: project.mediaUrl, type: project.mediaType }];

  // Logic to show 3 circles: [prev, current, next]
  const getCarouselItems = () => {
    if (mediaItems.length === 0) return [];
    if (mediaItems.length === 1) return [{ item: mediaItems[0], index: 0 }];

    const prev = (activeIndex - 1 + mediaItems.length) % mediaItems.length;
    const next = (activeIndex + 1) % mediaItems.length;

    return [
      { item: mediaItems[prev], index: prev },
      { item: mediaItems[activeIndex], index: activeIndex },
      { item: mediaItems[next], index: next }
    ];
  };

  const carouselCircles = getCarouselItems();

  const handleMediaChange = (index: number) => {
    setActiveIndex(index);
  };

  const currentMedia = mediaItems[activeIndex];

  const renderMedia = () => {
    if (currentMedia.type === 'video') {
      return (
        <video
          src={currentMedia.url}
          className="influencer-main-photo"
          autoPlay
          loop
          muted
          playsInline
          key={currentMedia.url}
        />
      );
    } else {
      return (
        <img
          src={currentMedia.url}
          alt={project.title}
          className="influencer-main-photo"
          loading="lazy"
          key={currentMedia.url}
        />
      );
    }
  };

  return (
    <div className="influencer-card portfolio-item-card" onClick={() => onClick(project)}>
      {/* Corner Label - Category */}
      <div className="card-label top-right">{project.category}</div>

      {/* Main Media */}
      <div className="influencer-main-media">
        {renderMedia()}
      </div>

      {/* Fog Overlay */}
      <div className="influencer-fog-overlay"></div>

      {/* Content Overlay */}
      <div className="influencer-content-overlay">
        {/* Carousel circles */}
        {mediaItems.length > 1 && (
          <div className="influencer-carousel-nav">
            {carouselCircles.map((circle: any, idx: number) => (
              <div
                key={`${circle.index}-${idx}`}
                className={`carousel-circle ${circle.index === activeIndex ? 'active' : ''}`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleMediaChange(circle.index);
                }}
              >
                {circle.item.type === 'video' ? (
                  <video src={circle.item.url} muted playsInline preload="metadata" />
                ) : (
                  <img src={circle.item.url} alt="media preview" loading="lazy" />
                )}
                {circle.index === activeIndex && idx === 1 && (
                  <div className="circle-label">Projet #{circle.index + 1}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Carousel dots indicator */}
        {mediaItems.length > 1 && (
          <div className="carousel-dots">
            {mediaItems.map((_: any, index: number) => (
              <div
                key={index}
                className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Information */}
        <div className="influencer-bottom-info">
          <div className="influencer-name-age">
            {project.title}
          </div>

          <div className="influencer-badges-row">
            {project.tags?.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="glass-badge">{tag}</span>
            ))}
          </div>

          {project.description && (
            <div className="influencer-bio-row">
              {project.description}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="influencer-action-wrapper">
          <button className="influencer-continue-btn">
            Voir le projet <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;