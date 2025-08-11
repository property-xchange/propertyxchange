export const navLinks = [
  {
    id: 1,
    linkText: 'Agents',
    url: '/agents',
    subLinks: [
      {
        id: 1,
        linkText: 'Property Owner',
        url: '/agents?accountType=INDIVIDUAL',
      },
      {
        id: 2,
        linkText: 'Individual Agent',
        url: '/agents?accountType=INDIVIDUAL',
      },
      {
        id: 3,
        linkText: 'Developer',
        url: '/agents?accountType=DEVELOPER',
      },
      {
        id: 4,
        linkText: 'Law Firm',
        url: '/agents?accountType=LAW',
      },
      {
        id: 5,
        linkText: 'Estate Surveying Firm',
        url: '/agents?accountType=SURVEY',
      },
      {
        id: 6,
        linkText: 'Real Estate Organization',
        url: '/agents?accountType=ORGANIZATION',
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
        url: '/property?purpose=RENT',
      },
      {
        id: 2,
        linkText: 'Sale',
        url: '/property?purpose=SALE',
      },
      {
        id: 3,
        linkText: 'Shortlet',
        url: '/property?purpose=SHORT_LET',
      },
      {
        id: 4,
        linkText: 'Joint Venture',
        url: '/property?purpose=JOINT_VENTURE',
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
