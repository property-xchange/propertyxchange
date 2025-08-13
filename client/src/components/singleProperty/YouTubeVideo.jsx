import React from 'react';

const YouTubeVideo = ({ youtubeLink }) => {
  // Function to extract video ID from YouTube link
  const getVideoId = (link) => {
    // Check if link exists and is a string
    if (!link || typeof link !== 'string') {
      return null;
    }

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  // Function to generate YouTube embed URL
  const generateEmbedUrl = (videoId) => {
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?controls=1&showinfo=0&rel=0`
      : null;
  };

  // Safely get video ID
  const videoId = getVideoId(youtubeLink);
  const embedUrl = generateEmbedUrl(videoId);

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-4xl aspect-video">
        {embedUrl ? (
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        ) : (
          <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              This property has no video
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideo;
