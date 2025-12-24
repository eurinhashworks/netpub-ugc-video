import React, { useEffect, useRef } from 'react';
import './ProjectFeedItem.css';
import { PortfolioProject } from '../types';

interface ProjectFeedItemProps {
  project: PortfolioProject;
  isActive: boolean;
}

const ProjectFeedItem: React.FC<ProjectFeedItemProps> = ({ project, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(error => {
          // Autoplay prevented
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  return (
    <div className={`project-feed-item ${isActive ? 'is-active' : ''}`}>
      <div className="media-container">
        {project.mediaType === 'video' ? (
          <video
            ref={videoRef}
            key={project.id}
            src={project.mediaUrl}
            loop
            playsInline
          />
        ) : (
          <img key={project.id} src={project.mediaUrl} alt={project.title} loading="lazy" />
        )}
      </div>

      <div className="item-footer">
        <div className="hashtags-container">
          {project.hashtags?.map((tag: string) => (
            <span key={tag} className="hashtag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectFeedItem;