import React from 'react';
import WordCloud from 'react-wordcloud';

const WordCloudComponent = ({ words }) => {
  const options = {
    rotations: 2,
    rotationAngles: [-90, 0],
    scale: 'sqrt',
    fontSizes: [20, 60],
  };

  return (
    <div style={{ width: '600px', height: '400px' }}>
      <WordCloud words={words} options={options} />
    </div>
  );
};

export default WordCloudComponent;
