export const expeditions = [
  {
    slug: 'runoff',
    title: 'Follow the runoff',
    label: 'Terrain exploration',
    text: 'Choose a place and see how its slopes and low points shape where rainwater can go.',
    href: '/earth',
    action: 'Open the terrain map',
    art: 'terrain',
    lead: 'Start with a place you know. Read its terrain before you run a storm.',
    steps: [
      ['Choose the place', 'Search by address or landmark, then center a study area on the map.'],
      [
        'Read the ground',
        'Load elevation and look for slopes, low points, and routes water could take across the surface.',
      ],
      [
        'Run a storm',
        'Send the terrain to the laboratory and change the rainfall to see how the modeled flow responds.',
      ],
    ],
  },
  {
    slug: 'harvey',
    title: 'Hurricane Harvey',
    label: 'Spring, Texas · 2017',
    text: 'Investigate the flooding that closed the Barbara Bush Branch Library.',
    href: '/case-study',
    action: 'Read the case study',
    art: 'harvey',
    lead: 'A neighborhood library closed after Harvey. What would it take to understand how it flooded?',
    steps: [
      [
        'What happened',
        'Read the record of the closure and reopening of the Barbara Bush Branch Library.',
      ],
      [
        'What the terrain shows',
        'Explore the modeled runoff around Cypresswood Drive using USGS elevation data.',
      ],
      [
        'What evidence is missing',
        'See which rainfall, drainage and flood observations would be needed to assess the site.',
      ],
    ],
  },
  {
    slug: 'detention',
    title: 'Where could water be held?',
    label: 'Detention screening',
    text: 'Screen potential detention sites near the Barbara Bush Branch Library on measured terrain.',
    href: '/study',
    action: 'Open watershed tools',
    art: 'mitigation',
    lead: 'Test whether temporarily storing runoff at different locations could lower the modeled peak downstream.',
    steps: [
      [
        'Start with measured terrain',
        'Load the USGS elevation grid around the Barbara Bush Branch Library, ready to use.',
      ],
      [
        'Set the constraints',
        'Adjust the maximum footprint, storage volume, and second storm intensity.',
      ],
      [
        'Compare the tradeoffs',
        'Review candidate sites across both storms. The output is a screening result for further investigation.',
      ],
    ],
  },
] as const;
