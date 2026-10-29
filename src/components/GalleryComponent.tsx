import React, { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./GalleryComponent.scss";
import { getCustomPhotos, PHOTOS_UPDATE_EVENT } from "../utils/profileStorage";

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
  photographerId?: string;
}

const GalleryComponent: React.FC<GalleryProps> = ({ photos: initialPhotos, type, photographerId }) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orientation, setOrientation] = useState<string[]>([]);
  const [displayPhotos, setDisplayPhotos] = useState<Photo[]>(initialPhotos);

  useEffect(() => {
    const loadPhotos = () => {
      if (photographerId) {
        const custom = getCustomPhotos(photographerId);
        if (custom && custom.length > 0) {
          const customConverted: Photo[] = custom.map((cp) => ({
            data: {
              image: cp.image,
              title: cp.title,
              photographer: cp.photographer,
              category: cp.category,
              year: cp.year,
            },
          }));
          setDisplayPhotos([...customConverted, ...initialPhotos]);
          return;
        }
      }
      setDisplayPhotos(initialPhotos);
    };

    loadPhotos();

    const handleUpdate = () => {
      loadPhotos();
    };

    window.addEventListener(PHOTOS_UPDATE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(PHOTOS_UPDATE_EVENT, handleUpdate);
    };
  }, [photographerId, initialPhotos]);

  useEffect(() => {
    const ori = Array(displayPhotos.length)
      .fill("left")
      .map(() => (Math.random() > 0.5 ? "left" : "right"));
    setOrientation(ori);
  }, [displayPhotos]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  return (
    <div className="gallery">
      {displayPhotos.map((photo, index) => (
        <div
          className={`gallery__item ${orientation[index]}`}
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
              <p className="gallery__category">{photo.data.category}</p>
            </div>
          )}
        </div>
      ))}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={displayPhotos.map((photo) => ({ src: photo.data.image }))}
        index={currentIndex}
      />
    </div>
  );
};

export default GalleryComponent;
