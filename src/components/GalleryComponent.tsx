import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./GalleryComponent.scss";

interface Photo {
  data: {
    image: string;
    title: string;
    photographer: string;
    category: string;
    year: number;
  };
}

interface GalleryProps {
  photos: Photo[];
  type: "personal" | "intro";
}

const GalleryComponent: React.FC<GalleryProps> = ({ photos, type }) => {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  return (
    <div className="gallery">
      {photos.map((photo, index) => (
        <div
          className="gallery__item"
          key={index}
          onClick={() => handleImageClick(index)}
        >
          <img
            src={photo.data.image}
            alt={photo.data.title}
            loading="lazy"
            className="gallery__image"
          />
          {type === "personal" && (
            <div className="gallery__info">
              <h3 className="gallery__title">
                {photo.data.title} {photo.data.year}
              </h3>
              <p className="gallery__photographer">
                By {photo.data.photographer}
              </p>
              <p className="gallery__category">{photo.data.category}</p>
            </div>
          )}
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

export default GalleryComponent;
