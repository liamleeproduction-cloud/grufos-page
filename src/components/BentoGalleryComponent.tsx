import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./BentoGallery.scss";

interface Photo {
  data: {
    image: string;
    title: string;
    photographer: string;
    category: string;
    year: number;
    photographerId: string;
  };
}

interface GalleryProps {
  photos: Photo[];
}

const BentoGalleryComponent: React.FC<GalleryProps> = ({ photos }) => {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [shuffledClassNames, setShuffledClassNames] = React.useState<string[]>(
    [],
  );
  const [templateBentoSelected, setTemplateBento] = React.useState<string>("default");

  React.useEffect(() => {
    const classNames = [
      "bento-gallery__item--1",
      "bento-gallery__item--2",
      "bento-gallery__item--3",
      "bento-gallery__item--4",
      "bento-gallery__item--5",
      "bento-gallery__item--6",
      "bento-gallery__item--7",
      "bento-gallery__item--8",
      "bento-gallery__item--9",
      "bento-gallery__item--10",
    ];
    setShuffledClassNames(classNames);

    const templateBento = ["default", "hello", "hey", "happy"];

    const selected = templateBento[Math.floor(Math.random() * (3 - 0) + 0)]

    setTemplateBento(selected)

  }, []);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  return (
    <div className={`bento-gallery ${templateBentoSelected}`}>
      {photos.map((photo, index) => (
        <div
          className={`bento-gallery__item ${shuffledClassNames[index]}`}
          key={index}
          onClick={() => handleImageClick(index)}
        >
          <img
            src={photo.data.image}
            alt={photo.data.title}
            loading="lazy"
            className="bento-gallery__image"
          />
          <div className="bento-gallery__info">
            <h3 className="bento-gallery__title">
              {photo.data.title} {photo.data.year}
            </h3>
            <p className="bento-gallery__photographer">
              By <a href={`/fotografos/${photo.data.photographerId}`}>{photo.data.photographer}</a>
            </p>
            <p className="bento-gallery__category">{photo.data.category}</p>
          </div>
        </div>
      ))}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={photos.map((photo) => ({ src: photo.data.image }))}
        index={currentIndex}
      />
    </div>
  );
};

export default BentoGalleryComponent;
