// Define types for code references
export interface CodeReference {
  id: string;
  title: string;
  authority: string;
  category: string;
  description: string;
  url?: string;
}

// Sample code references data
export const codeReferences: CodeReference[] = [
  {
    id: 'ictad-sca-3-1',
    title: 'SCA/3/1: Standard Specifications for Building Works',
    authority: 'ICTAD (CIDA)',
    category: 'building',
    description: 'Specifications for building construction including materials, workmanship, and testing requirements.',
    url: 'https://www.cida.gov.lk/publications.php'
  },
  {
    id: 'ictad-sca-4-i',
    title: 'SCA/4/I: Standard Specifications for Water Supply',
    authority: 'ICTAD (CIDA)',
    category: 'water',
    description: 'Specifications for water supply systems including pipes, fittings, and installation requirements.',
    url: 'https://www.cida.gov.lk/publications.php'
  },
  {
    id: 'ictad-sca-4-ii',
    title: 'SCA/4/II: Standard Specifications for Sewerage',
    authority: 'ICTAD (CIDA)',
    category: 'water',
    description: 'Specifications for sewerage systems including pipes, manholes, and treatment facilities.',
    url: 'https://www.cida.gov.lk/publications.php'
  },
  {
    id: 'ictad-sca-8',
    title: 'SCA/8: Standard Specifications for Electrical Works',
    authority: 'ICTAD (CIDA)',
    category: 'electrical',
    description: 'Specifications for electrical installations in buildings including wiring, lighting, and power systems.',
    url: 'https://www.cida.gov.lk/publications.php'
  },
  {
    id: 'nbro-landslide',
    title: 'Landslide Risk Assessment Guidelines',
    authority: 'NBRO',
    category: 'geotechnical',
    description: 'Guidelines for assessing landslide risk in hilly areas and mitigation measures.',
    url: 'https://www.nbro.gov.lk/index.php?option=com_content&view=article&id=48&Itemid=59&lang=en'
  },
  {
    id: 'nbro-hilly',
    title: 'Guidelines for Construction in Hilly Areas',
    authority: 'NBRO',
    category: 'geotechnical',
    description: 'Specifications and guidelines for construction on slopes and hilly terrain to prevent landslides.',
    url: 'https://www.nbro.gov.lk/index.php?option=com_content&view=article&id=48&Itemid=59&lang=en'
  },
  {
    id: 'nbro-soil',
    title: 'Soil Testing Requirements',
    authority: 'NBRO',
    category: 'geotechnical',
    description: 'Standards for soil testing and analysis for construction projects.',
    url: 'https://www.nbro.gov.lk/index.php?option=com_content&view=article&id=48&Itemid=59&lang=en'
  },
  {
    id: 'nbro-slope',
    title: 'Slope Stability Analysis Guidelines',
    authority: 'NBRO',
    category: 'geotechnical',
    description: 'Methods and requirements for analyzing slope stability for construction projects.',
    url: 'https://www.nbro.gov.lk/index.php?option=com_content&view=article&id=48&Itemid=59&lang=en'
  },
  {
    id: 'uda-planning',
    title: 'Planning and Building Regulations',
    authority: 'UDA',
    category: 'urban',
    description: 'Regulations for urban planning, zoning, and building construction in urban areas.',
    url: 'https://www.uda.gov.lk/planning-regulations.html'
  },
  {
    id: 'uda-zoning',
    title: 'Zoning Regulations',
    authority: 'UDA',
    category: 'urban',
    description: 'Regulations for land use zoning in urban areas including residential, commercial, and industrial zones.',
    url: 'https://www.uda.gov.lk/planning-regulations.html'
  },
  {
    id: 'uda-setback',
    title: 'Building Setback Requirements',
    authority: 'UDA',
    category: 'building',
    description: 'Requirements for building setbacks from property lines, roads, and other structures.',
    url: 'https://www.uda.gov.lk/planning-regulations.html'
  },
  {
    id: 'rda-highway',
    title: 'Highway Design Manual',
    authority: 'RDA',
    category: 'highway',
    description: 'Standards and specifications for highway design including geometric design, pavement design, and drainage.',
    url: 'https://www.rda.gov.lk/source/rda_roads.htm'
  },
  {
    id: 'sls-concrete',
    title: 'SLS 107: Specification for Ordinary Portland Cement',
    authority: 'SLS',
    category: 'structural',
    description: 'Standards for ordinary Portland cement used in construction.',
    url: 'https://www.slsi.lk/'
  },
  {
    id: 'sls-steel',
    title: 'SLS 375: Specification for Steel Bars for Reinforcement of Concrete',
    authority: 'SLS',
    category: 'structural',
    description: 'Standards for steel reinforcement bars used in concrete construction.',
    url: 'https://www.slsi.lk/'
  },
  {
    id: 'sls-timber',
    title: 'SLS 1170: Specification for Timber for Building Construction',
    authority: 'SLS',
    category: 'structural',
    description: 'Standards for timber used in building construction including grading and moisture content requirements.',
    url: 'https://www.slsi.lk/'
  },
  {
    id: 'ictad-fire',
    title: 'Fire Safety Guidelines for Buildings',
    authority: 'ICTAD (CIDA)',
    category: 'building',
    description: 'Guidelines for fire safety in buildings including fire resistance ratings, means of egress, and fire detection systems.',
    url: 'https://www.cida.gov.lk/publications.php'
  },
  {
    id: 'uda-parking',
    title: 'Parking Requirements',
    authority: 'UDA',
    category: 'urban',
    description: 'Requirements for parking spaces in different types of buildings and developments.',
    url: 'https://www.uda.gov.lk/planning-regulations.html'
  },
  {
    id: 'nbro-retaining',
    title: 'Retaining Wall Design Guidelines',
    authority: 'NBRO',
    category: 'geotechnical',
    description: 'Guidelines for the design and construction of retaining walls in hilly areas.',
    url: 'https://www.nbro.gov.lk/index.php?option=com_content&view=article&id=48&Itemid=59&lang=en'
  },
  {
    id: 'ictad-drainage',
    title: 'SCA/4/III: Standard Specifications for Drainage',
    authority: 'ICTAD (CIDA)',
    category: 'water',
    description: 'Specifications for drainage systems including stormwater drainage, culverts, and channels.',
    url: 'https://www.cida.gov.lk/publications.php'
  }
];
