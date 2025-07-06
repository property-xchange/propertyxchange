import React from 'react';
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaShare,
  FaCopy,
} from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ShareLinks = () => {
  const pageUrl = encodeURIComponent(window.location.href);

  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${pageUrl}`);
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`);
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${pageUrl}`);
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?url=${pageUrl}`);
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('URL Copied to Clipboard');
  };

  return (
    <div className="border dark:border-dark mt-3">
      <div className="flex justify-center items-center bg-secondary py-3 gap-3 text-white">
        <FaShare className="text-xl" />
        <h1 className="uppercas">Share this property</h1>
      </div>
      <Tooltip />
      <div className="flex justify-center items-center p-3 gap-2">
        <button
          data-tooltip-id="whatsapp"
          data-tooltip-content="Share on WhatsApp"
          onClick={shareOnWhatsApp}
          className="p-3 rounded-full bg-primary/20 hover:bg-primary transition-all duration-300 border"
        >
          <FaWhatsapp className="text-xl" />
        </button>
        <Tooltip id="whatsapp" />
        <button
          data-tooltip-id="facebook"
          data-tooltip-content="Share on Facebook"
          onClick={shareOnFacebook}
          className="p-3 rounded-full bg-primary/20 hover:bg-primary transition-all duration-300 border"
        >
          <FaFacebook className="text-xl" />
        </button>
        <Tooltip id="facebook" />
        <button
          data-tooltip-id="twitter"
          data-tooltip-content="Share on Twitter"
          onClick={shareOnTwitter}
          className="p-3 rounded-full bg-primary/20 hover:bg-primary transition-all duration-300 border"
        >
          <BsTwitterX className="text-xl" />
        </button>
        <Tooltip id="twitter" />
        <button
          data-tooltip-id="linkedin"
          data-tooltip-content="Share on LinkedIn"
          onClick={shareOnLinkedIn}
          className="p-3 rounded-full bg-primary/20 hover:bg-primary transition-all duration-300 border"
        >
          <FaLinkedin />
        </button>
        <Tooltip id="linkedin" />

        <button
          data-tooltip-id="copy"
          onClick={copyUrlToClipboard}
          data-tooltip-content="Copy URL"
          className="p-3 rounded-full bg-primary/20 hover:bg-primary transition-all duration-300 border"
        >
          <FaCopy />
        </button>
        <Tooltip id="copy" />
      </div>
    </div>
  );
};

export default ShareLinks;
