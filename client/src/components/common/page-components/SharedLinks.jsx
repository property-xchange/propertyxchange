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
  // Safely get current page URL
  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const pageUrl = encodeURIComponent(getCurrentUrl());
  const currentUrl = getCurrentUrl();

  const shareOnWhatsApp = () => {
    if (pageUrl) {
      window.open(`https://api.whatsapp.com/send?text=${pageUrl}`, '_blank');
    }
  };

  const shareOnFacebook = () => {
    if (pageUrl) {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
        '_blank'
      );
    }
  };

  const shareOnTwitter = () => {
    if (pageUrl) {
      window.open(`https://twitter.com/intent/tweet?url=${pageUrl}`, '_blank');
    }
  };

  const shareOnLinkedIn = () => {
    if (pageUrl) {
      window.open(
        `https://www.linkedin.com/shareArticle?url=${pageUrl}`,
        '_blank'
      );
    }
  };

  const copyUrlToClipboard = async () => {
    if (!currentUrl) {
      toast.error('Unable to copy URL');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        toast.success('URL Copied to Clipboard');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('URL Copied to Clipboard');
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  // Don't render if no URL available
  if (!currentUrl) {
    return null;
  }

  return (
    <div className="border dark:border-dark mt-3">
      <div className="flex justify-center items-center bg-secondary py-3 gap-3 text-white">
        <FaShare className="text-xl" />
        <h1 className="uppercase">Share this property</h1>
      </div>
      <div className="flex justify-center items-center p-3 gap-2 flex-wrap">
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
