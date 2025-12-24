import React, { useState } from 'react';
import { PortfolioProject } from '../types';
import { useChatbot } from '../contexts/ChatbotContext';
import './InfluencerCard.css';

interface InfluencerCardProps {
    project: PortfolioProject;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({ project }) => {
    const { openChatbot } = useChatbot();
    const [activeIndex, setActiveIndex] = useState(0);
    const mediaItems = project.mediaItems || [{ url: project.mediaUrl, type: project.mediaType }];

    // Get up to 3 items for the carousel circles
    // If we have less than 3, we repeat or center them
    const getCarouselItems = () => {
        if (mediaItems.length === 0) return [];
        if (mediaItems.length === 1) return [{ item: mediaItems[0], index: 0 }];

        // Logic to show 3 circles: [prev, current, next]
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

    return (
        <div className="influencer-card">
            {/* Corner Labels */}
            <div className="card-label top-right">{project.category}</div>

            {/* Main Media Background */}
            <div className="influencer-main-media">
                {currentMedia.type === 'video' ? (
                    <video
                        src={currentMedia.url}
                        className="influencer-main-photo"
                        autoPlay
                        loop
                        muted
                        playsInline
                        key={currentMedia.url}
                    />
                ) : (
                    <img
                        src={currentMedia.url}
                        alt={project.title}
                        className="influencer-main-photo"
                        loading="lazy"
                        key={currentMedia.url}
                    />
                )}
            </div>

            {/* Fog/Blur Overlay at bottom */}
            <div className="influencer-fog-overlay"></div>

            {/* Content Overlay */}
            <div className="influencer-content-overlay">
                {/* Carousel circles */}
                <div className="influencer-carousel-nav">
                    {carouselCircles.map((circle, idx) => (
                        <div
                            key={`${circle.index}-${idx}`}
                            className={`carousel-circle ${circle.index === activeIndex ? 'active' : ''}`}
                            onClick={(e) => {
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

                {/* Carousel dots indicator */}
                <div className="carousel-dots">
                    {mediaItems.map((_, index) => (
                        <div
                            key={index}
                            className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>

                {/* Bottom Information Container */}
                <div className="influencer-bottom-info">
                    <div className="influencer-name-age">
                        {project.category === 'Influenceuses'
                            ? `${project.title}, ${project.age || 25}`
                            : project.title
                        }
                    </div>

                    <div className="influencer-badges-row">
                        {(project.hashtags || project.tags)?.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="glass-badge">{tag}</span>
                        ))}
                    </div>

                    <div className="influencer-bio-row">
                        {project.description || project.bio || "Découvrez nos réalisations."}
                    </div>
                </div>

                {/* Continue/Call to Action Button */}
                <div className="influencer-action-wrapper">
                    <button
                        className="influencer-continue-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            openChatbot();
                        }}
                    >
                        Collaborer <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfluencerCard;
