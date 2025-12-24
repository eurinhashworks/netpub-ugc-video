import React from 'react';
import Masonry from 'react-masonry-css';
import InfluencerCard from './InfluencerCard';
import { PortfolioProject } from '../types';
import './MasonryGrid.css';

interface MasonryGridProps {
  projects: PortfolioProject[];
  onProjectClick: (project: PortfolioProject) => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ projects, onProjectClick }) => {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    767: 2
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {projects.map((project) => (
        <InfluencerCard key={project.id} project={project} />
      ))}
    </Masonry>
  );
};

export default MasonryGrid;
