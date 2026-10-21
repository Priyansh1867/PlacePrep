import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import instituteImage from '../assets/images/institute_hero.jpg';
import placementImage from '../assets/images/placement_hero.jpg';
import careerImage from '../assets/images/career-modules-hero.png';

const images = [careerImage, instituteImage, placementImage];

export default function PortalModuleCards({ items, activeId, onSelect, tone = 'indigo' }) {
  return (
    <div className="portal-module-grid">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`portal-module-card portal-module-card--${tone} ${isActive ? 'is-active' : ''}`}
          >
            <img src={images[index % images.length]} alt="" className="portal-module-card__image" />
            <span className="portal-module-card__overlay" />
            <span className="portal-module-card__content">
              <span className="portal-module-card__icon"><Icon className="h-4 w-4" /></span>
              <span className="portal-module-card__copy">
                <span className="portal-module-card__label">{item.label}</span>
                <span className="portal-module-card__meta">{item.badge || item.description || 'Open workspace'}</span>
              </span>
              <ArrowUpRight className="portal-module-card__arrow h-4 w-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
