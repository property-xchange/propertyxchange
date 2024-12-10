import React from 'react';

const YouTubeVideo = ({ youtubeLink }) => {
  // Function to extract video ID from YouTube link
  const getVideoId = (link) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  // Function to generate YouTube embed URL
  const generateEmbedUrl = (videoId) => {
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?controls=0&showinfo=0`
      : null;
  };

  const videoId = getVideoId(youtubeLink);
  const embedUrl = generateEmbedUrl(videoId);

  return (
    <div className="flex justify-center items-center h-[210px] w-[370px]  md:h-[315px] md:w-[560px]">
      {embedUrl ? (
        <iframe
          width="560"
          height="100%"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      ) : (
        <p>This property has no video</p>
      )}
    </div>
  );
};

export default YouTubeVideo;
