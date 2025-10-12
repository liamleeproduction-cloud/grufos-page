import React from 'react';
import './PhotographerCard.scss';
import type { CollectionEntry } from 'astro:content';

interface Props {
  photographer: CollectionEntry<'photographers'>;
}

const PhotographerCard: React.FC<Props> = ({ photographer }) => {
  const { slug } = photographer;
  return (
    <a href={`/fotografos/${slug}`} className="photographer-card">
      <div className="photographer-card__image">
        <img src={photographer.data.image} alt={photographer.data.name} />
      </div>
      <h2 className="photographer-card__name">{photographer.data.name}</h2>
    </a>
  );
};

export default PhotographerCard;
