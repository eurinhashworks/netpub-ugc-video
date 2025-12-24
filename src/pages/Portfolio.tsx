import React, { useState, useMemo } from 'react';
import { portfolioProjects, featuredProjectIds } from '../constants';
import { PortfolioCategory, PortfolioProject } from '../types';
import MasonryGrid from '../components/MasonryGrid';
import ProjectFeed from '../components/ProjectFeed';
import TestimonialCarousel from '../components/TestimonialCarousel';
import CallToAction from '../components/CallToAction';
import SEO from '../components/SEO';



const Portfolio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [initialProjectIndex, setInitialProjectIndex] = useState(0);

  const categories = ['All', ...Object.values(PortfolioCategory)];

  const groupedProjects = useMemo(() => {
    // 1. Filter influencers and keep them individual
    const influencers = portfolioProjects.filter(p => p.category === PortfolioCategory.INFLUENCEUSES);

    // 2. Group other projects by category
    const otherCategories = Object.values(PortfolioCategory).filter(cat => cat !== PortfolioCategory.INFLUENCEUSES);

    const categoryGroups = otherCategories.map((cat, index) => {
      const projectsInCat = portfolioProjects.filter(p => p.category === cat);
      if (projectsInCat.length === 0) return null;

      // Group all media into one "super-project"
      const allMedia: Array<{ url: string; type: 'image' | 'video' }> = [];
      projectsInCat.forEach(p => {
        if (p.mediaItems) {
          allMedia.push(...p.mediaItems);
        } else {
          allMedia.push({ url: p.mediaUrl, type: p.mediaType });
        }
      });

      return {
        id: -(index + 1), // Negative IDs for category groups to avoid collision
        title: cat,
        category: cat,
        mediaUrl: allMedia[0]?.url || '',
        mediaType: allMedia[0]?.type || 'image',
        mediaItems: allMedia,
        tags: [cat],
        description: `Découvrez nos réalisations en ${cat}.`
      } as PortfolioProject;
    }).filter(p => (p !== null)) as PortfolioProject[];

    // 3. Combine based on selected category
    if (selectedCategory === 'All') {
      return [...categoryGroups, ...influencers];
    }

    if (selectedCategory === PortfolioCategory.INFLUENCEUSES) {
      return influencers;
    }

    return categoryGroups.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const handleCardClick = (project: PortfolioProject) => {
    const projectIndex = groupedProjects.findIndex(p => p.id === project.id);
    setInitialProjectIndex(projectIndex);
    setViewMode('feed');
  };

  const handleCloseFeed = () => {
    setViewMode('grid');
  };

  if (viewMode === 'feed') {
    return (
      <ProjectFeed
        projects={groupedProjects}
        initialProjectIndex={initialProjectIndex}
        onClose={handleCloseFeed}
      />
    );
  }

  return (
    <div className="page-container portfolio-page">
      <SEO
        title="Portfolio - Nos Réalisations de Vidéos UGC & Publicitaires"
        description="Explorez les réalisations de NetPub. Découvrez notre portfolio de vidéos UGC, de spots publicitaires créatifs et de contenu de marque qui captivent et convertissent."
        keywords="portfolio, réalisations, vidéos UGC, spots publicitaires, contenu de marque, études de cas, netpub"
      />
      <header className="article-header text-center">
        <p className="article-meta">Notre travail</p>
        <h1>Découvrez nos réalisations</h1>
      </header>

      <div className="portfolio-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category as PortfolioCategory | 'All')}
          >
            {category === 'All' ? 'Tous les projets' : category}
          </button>
        ))}
      </div>

      <MasonryGrid projects={groupedProjects} onProjectClick={handleCardClick} />

      <TestimonialCarousel />
      <CallToAction />
    </div>
  );
};

export default Portfolio;