import React, { Suspense, lazy } from 'react';
import AnimatedHero from '../components/AnimatedHero'; // Re-added
import ClientMarquee from '../components/ClientMarquee';
import ObliqueMasonryScroller from '../components/ObliqueMasonryScroller';
import { portfolioProjects, featuredProjectIds } from '../constants';
import { PortfolioProject } from '../types';
import StatsSection from '../components/StatsSection';
import { Link } from 'react-router-dom';
import useScreenWidth from '../hooks/useScreenWidth';
import MasonryGrid from '../components/MasonryGrid';

import SEO from '../components/SEO';

// Lazy load components that are below the fold
const PricingPlans = lazy(() => import('../components/PricingPlans'));
const TestimonialCarousel = lazy(() => import('../components/TestimonialCarousel'));
const CallToAction = lazy(() => import('../components/CallToAction'));

const Home: React.FC = () => {
  const screenWidth = useScreenWidth();
  const isMobile = screenWidth < 768;

  const handleProjectClick = (project: PortfolioProject) => {
    // Future implementation: handle project click, e.g., open a modal or navigate to a project page
  };

  // Group projects by category (same logic as Portfolio)
  const groupedProjects = React.useMemo(() => {
    const influencers = portfolioProjects.filter(p => p.category === 'Influenceuses');
    const otherCategories = ['Photo UGC', 'Photo Mode', 'Photo Spot Publicitaire', 'Vidéo UGC', 'Vidéo Mode', 'Spot Publicitaire 4K'];

    const categoryGroups = otherCategories.map((cat, index) => {
      const projectsInCat = portfolioProjects.filter(p => p.category === cat);
      if (projectsInCat.length === 0) return null;

      const allMedia: Array<{ url: string; type: 'image' | 'video' }> = [];
      projectsInCat.forEach(p => {
        if (p.mediaItems) {
          allMedia.push(...p.mediaItems);
        } else {
          allMedia.push({ url: p.mediaUrl, type: p.mediaType });
        }
      });

      return {
        id: -(index + 1),
        title: cat,
        category: cat,
        mediaUrl: allMedia[0]?.url || '',
        mediaType: allMedia[0]?.type || 'image',
        mediaItems: allMedia,
        tags: [cat],
        description: `Découvrez nos réalisations en ${cat}.`
      } as PortfolioProject;
    }).filter(p => p !== null) as PortfolioProject[];

    // Return 6 category cards + 2 influencer cards = 8 total
    return [...categoryGroups, ...influencers.slice(0, 2)].filter(Boolean);
  }, []);

  return (
    <div className="page-container home-page">
      <SEO
        title="Agence Vidéo UGC & Création de Contenu Publicitaire"
        description="NetPub est une agence spécialisée dans la création de vidéos UGC (User Generated Content) et de spots publicitaires percutants pour les marques. Boostez votre engagement et vos conversions."
        keywords="agence UGC, vidéo UGC, création de contenu, spot publicitaire, marketing vidéo, créateurs de contenu, netpub"
      />
      <AnimatedHero /> {/* Re-added */}
      <ClientMarquee />
      <div className="oblique-masonry-header">
        <h2>Un aperçu de notre travail</h2>
        <p>Plongez dans un univers de créativité et découvrez comment nous donnons vie aux marques.</p>
        <Link to="/portfolio" className="cta-button-secondary">Voir tout le portfolio</Link>
      </div>
      <MasonryGrid projects={groupedProjects} onProjectClick={handleProjectClick} />
      <StatsSection />
      <Suspense fallback={<div>Chargement...</div>}>
        <PricingPlans />
        <TestimonialCarousel />
        <CallToAction />
      </Suspense>
    </div>
  );
};

export default Home;
