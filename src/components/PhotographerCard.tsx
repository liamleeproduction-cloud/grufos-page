import React from 'react';
import './PhotographerCard.scss';

interface Photographer {
  name: string;
  uniqueId: string;
  image: string;
  location: string;
}

interface Props {
  photographer: Photographer;
}

const PhotographerCard: React.FC<Props> = ({ photographer }) => {
  const { uniqueId, name, image, location } = photographer;
  return (
    <a href={`/grufos-page/fotografos/${uniqueId}`} className="photographer-card">
      <div className="photographer-card__image">
        <img src={image} alt={name} />
      </div>
      <h2 className="photographer-card__name">{name}</h2>
      {location ? <p>{location}</p> : null}
    </a>
  );
};

export default PhotographerCard;
