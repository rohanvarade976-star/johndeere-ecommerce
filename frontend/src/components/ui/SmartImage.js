
import React, { useState } from 'react';

// Official John Deere CDN images per model code
const EQ_IMAGES = {
  'JD-5075E': 'https://www.deere.com/assets/images/region/northAmerica/products/tractors/5e-series-utility-tractors/5075e/r4d095674_775x436.jpg',
  'JD-5050D': 'https://www.deere.com/assets/images/region/northAmerica/products/tractors/5d-series-utility-tractors/5050d/r4d095671_775x436.jpg',
  'JD-6120B': 'https://www.deere.com/assets/images/region/northAmerica/products/tractors/6b-series-tractors/6120b/pe61688_775x436.jpg',
  'JD-W70':   'https://www.deere.com/assets/images/region/northAmerica/products/combines/w-series-combines/w70/r4g006254_775x436.jpg',
  'JD-S660':  'https://www.deere.com/assets/images/region/northAmerica/products/combines/s-series-combines/s660/r4g016819_775x436.jpg',
  'JD-R4038': 'https://www.deere.com/assets/images/region/northAmerica/products/sprayers/r4-series-sprayers/r4038/r4g030463_775x436.jpg',
  'JD-8R230': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/800px-John_Deere_5075E_tractor_2014.jpg',
  'JD-8R410': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/800px-John_Deere_5075E_tractor_2014.jpg',
};

// Wikipedia public-domain fallbacks by category
const CAT_FALLBACKS = {
  Tractor:   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/800px-John_Deere_5075E_tractor_2014.jpg',
  Harvester: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/John_Deere_combine.jpg/800px-John_Deere_combine.jpg',
  Combine:   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/JohnDeere_S680_combine.jpg/800px-JohnDeere_S680_combine.jpg',
  Sprayer:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/John_Deere_R4030_sprayer.jpg/800px-John_Deere_R4030_sprayer.jpg',
  Planter:   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/800px-John_Deere_5075E_tractor_2014.jpg',
};

// Real machinery part photos from Unsplash by category
const PART_IMAGES = {
  ENGINE:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=375&fit=crop&q=80',
  HYDRAULIC:    'https://images.unsplash.com/photo-1581093057305-25f28cf63f09?w=500&h=375&fit=crop&q=80',
  ELECTRICAL:   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=375&fit=crop&q=80',
  STRUCTURAL:   'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&h=375&fit=crop&q=80',
  TRANSMISSION: 'https://images.unsplash.com/photo-1562953842-188bb7ce6588?w=500&h=375&fit=crop&q=80',
};

export const EquipmentImage = ({ equipment, height = 220, style = {}, className = '' }) => {
  const getInitialSrc = () => {
    if (equipment?.image_url && !equipment.image_url.startsWith('/uploads'))
      return equipment.image_url;
    return EQ_IMAGES[equipment?.model_code] || CAT_FALLBACKS[equipment?.category] || CAT_FALLBACKS['Tractor'];
  };
  const [src, setSrc]     = useState(getInitialSrc);
  const [attempt, setAttempt] = useState(0);

  const handleError = () => {
    if (attempt === 0) {
      setSrc(CAT_FALLBACKS[equipment?.category] || CAT_FALLBACKS['Tractor']);
      setAttempt(1);
    } else if (attempt === 1) {
      setSrc('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/800px-John_Deere_5075E_tractor_2014.jpg');
      setAttempt(2);
    }
  };

  return (
    <img
      src={src}
      alt={equipment?.model_name || 'John Deere Equipment'}
      style={{ width: '100%', height, objectFit: 'cover', display: 'block', ...style }}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export const PartImage = ({ part, height = '100%', style = {}, className = '' }) => {
  const getInitialSrc = () => {
    // Try DB url first, then Amazon (real part photo), then Unsplash by category
    if (part?.image_url && !part.image_url.startsWith('/uploads'))
      return part.image_url;
    return PART_IMAGES[part?.category] || PART_IMAGES['ENGINE'];
  };
  const [src, setSrc]     = useState(getInitialSrc);
  const [attempt, setAttempt] = useState(0);

  const handleError = () => {
    if (attempt === 0) {
      setSrc(PART_IMAGES[part?.category] || PART_IMAGES['ENGINE']);
      setAttempt(1);
    } else if (attempt === 1) {
      setSrc('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=375&fit=crop&q=80');
      setAttempt(2);
    }
  };

  return (
    <img
      src={src}
      alt={part?.part_name || 'Part'}
      style={{ width: '100%', height, objectFit: 'cover', display: 'block', ...style }}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};
