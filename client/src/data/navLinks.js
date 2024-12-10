export const navLinks = [
  {
    id: 1,
    linkText: 'Agents',
    url: '/agents',
    subLinks: [
      {
        id: 1,
        linkText: 'Property Owner',
        url: '/services',
      },
      {
        id: 2,
        linkText: 'Individual Agent',
        url: '/services',
      },
      {
        id: 3,
        linkText: 'Developer',
        url: '/developer',
      },
      {
        id: 4,
        linkText: 'Law Firm',
        url: '/law-firm',
      },
      {
        id: 5,
        linkText: 'Estate Surveying Firm',
        url: '/surveying',
      },
      {
        id: 6,
        linkText: 'Real Estate Organization',
        url: '/real-estate-organization',
      },
    ],
  },
  {
    id: 2,
    linkText: 'Property',
    url: '/property',
    subLinks: [
      {
        id: 1,
        linkText: 'Rent',
        url: '/property?purpose=rent',
      },
      {
        id: 2,
        linkText: 'Sale',
        url: '/property?purpose=sale',
      },
      {
        id: 3,
        linkText: 'Shortlet',
        url: '/property?purpose=short-let',
      },
      {
        id: 4,
        linkText: 'Joint Venture',
        url: '/property?purpose=joint-venture',
      },
    ],
  },
  {
    id: 3,
    linkText: 'Request',
    url: '/request',
    subLinks: [
      {
        id: 1,
        linkText: 'Post a Request',
        url: '/post-property',
      },
      {
        id: 2,
        linkText: 'View Property Request',
        url: '/property-request',
      },
    ],
  },
  {
    id: 4,
    linkText: 'Blog',
    url: '/blog',
  },
];
