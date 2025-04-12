// Define types for map data
export interface MapPoint {
  id: string;
  name: string;
  type: 'project' | 'resource' | 'hazard' | 'infrastructure';
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
  status?: 'planned' | 'in-progress' | 'completed';
  riskLevel?: 'low' | 'moderate' | 'high' | 'extreme';
  properties?: Record<string, any>;
}

export interface MapLayer {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  points: MapPoint[];
}

// Sample map data for Sri Lanka
export const mapLayers: MapLayer[] = [
  {
    id: 'projects',
    name: 'Construction Projects',
    description: 'Ongoing and planned construction projects across Sri Lanka',
    visible: true,
    points: [
      {
        id: 'project-1',
        name: 'Central Expressway',
        type: 'project',
        coordinates: [80.6337, 7.2906], // Kandy
        description: 'Major highway project connecting Colombo to Kandy',
        status: 'in-progress',
        properties: {
          budget: '300M USD',
          startDate: '2019-05-15',
          completionDate: '2023-12-31',
          contractor: 'Highway Development Authority',
          length: '126 km'
        }
      },
      {
        id: 'project-2',
        name: 'Port City Colombo',
        type: 'project',
        coordinates: [79.8612, 6.9271], // Colombo
        description: 'Reclaimed land development project in Colombo',
        status: 'in-progress',
        properties: {
          budget: '1.4B USD',
          startDate: '2014-09-17',
          completionDate: '2041-12-31',
          contractor: 'China Harbour Engineering Company',
          area: '269 hectares'
        }
      },
      {
        id: 'project-3',
        name: 'Jaffna Water Supply Project',
        type: 'project',
        coordinates: [80.0074, 9.6615], // Jaffna
        description: 'Water supply infrastructure development for Jaffna peninsula',
        status: 'in-progress',
        properties: {
          budget: '164M USD',
          startDate: '2018-02-10',
          completionDate: '2024-06-30',
          contractor: 'National Water Supply and Drainage Board',
          capacity: '27,000 cubic meters per day'
        }
      },
      {
        id: 'project-4',
        name: 'Ruwanpura Expressway',
        type: 'project',
        coordinates: [80.2170, 6.0535], // Galle
        description: 'Expressway connecting Colombo to Southern Province',
        status: 'planned',
        properties: {
          budget: '800M USD',
          startDate: '2023-01-01',
          completionDate: '2026-12-31',
          contractor: 'Road Development Authority',
          length: '76 km'
        }
      },
      {
        id: 'project-5',
        name: 'Trincomalee Port Development',
        type: 'project',
        coordinates: [81.2335, 8.5874], // Trincomalee
        description: 'Development of Trincomalee port and industrial zone',
        status: 'planned',
        properties: {
          budget: '500M USD',
          startDate: '2023-06-01',
          completionDate: '2028-12-31',
          contractor: 'Sri Lanka Ports Authority',
          area: '1,630 hectares'
        }
      }
    ]
  },
  {
    id: 'resources',
    name: 'Natural Resources',
    description: 'Natural resources and materials for construction',
    visible: false,
    points: [
      {
        id: 'resource-1',
        name: 'Aruwakkalu Limestone Quarry',
        type: 'resource',
        coordinates: [79.7863, 8.0219],
        description: 'Major limestone quarry for cement production',
        properties: {
          material: 'Limestone',
          capacity: '1.2 million tons per year',
          owner: 'Siam City Cement Lanka Ltd',
          reserves: 'Estimated 50 years'
        }
      },
      {
        id: 'resource-2',
        name: 'Bogala Graphite Mine',
        type: 'resource',
        coordinates: [80.4023, 7.1209],
        description: 'One of the purest graphite mines in the world',
        properties: {
          material: 'Graphite',
          capacity: '5,000 tons per year',
          owner: 'Bogala Graphite Lanka PLC',
          reserves: 'Estimated 30 years'
        }
      },
      {
        id: 'resource-3',
        name: 'Deduru Oya Sand Mining',
        type: 'resource',
        coordinates: [79.9167, 7.5667],
        description: 'River sand mining location for construction',
        properties: {
          material: 'River Sand',
          capacity: 'Variable',
          owner: 'Multiple private operators',
          reserves: 'Limited due to environmental restrictions'
        }
      },
      {
        id: 'resource-4',
        name: 'Mahaweli Clay Deposits',
        type: 'resource',
        coordinates: [80.6337, 7.9271],
        description: 'Clay deposits used for brick and tile manufacturing',
        properties: {
          material: 'Clay',
          capacity: 'Approximately 500,000 tons per year',
          owner: 'Various local manufacturers',
          reserves: 'Abundant'
        }
      },
      {
        id: 'resource-5',
        name: 'Balangoda Timber Plantation',
        type: 'resource',
        coordinates: [80.6969, 6.6566],
        description: 'Sustainable timber plantation for construction',
        properties: {
          material: 'Timber (Teak, Mahogany)',
          capacity: '10,000 cubic meters per year',
          owner: 'State Timber Corporation',
          reserves: 'Renewable resource'
        }
      }
    ]
  },
  {
    id: 'hazards',
    name: 'Geological Hazards',
    description: 'Areas with geological hazards like landslides and floods',
    visible: false,
    points: [
      {
        id: 'hazard-1',
        name: 'Koslanda Landslide Zone',
        type: 'hazard',
        coordinates: [81.0167, 6.7333],
        description: 'Area prone to landslides during heavy rainfall',
        riskLevel: 'high',
        properties: {
          hazardType: 'Landslide',
          lastIncident: '2014-10-29',
          affectedArea: 'Approximately 8 sq km',
          monitoringStatus: 'NBRO monitoring stations installed'
        }
      },
      {
        id: 'hazard-2',
        name: 'Ratnapura Flood Plain',
        type: 'hazard',
        coordinates: [80.4000, 6.6833],
        description: 'Flood-prone area during monsoon season',
        riskLevel: 'high',
        properties: {
          hazardType: 'Flooding',
          lastIncident: '2017-05-26',
          affectedArea: 'Approximately 30 sq km',
          monitoringStatus: 'Early warning system in place'
        }
      },
      {
        id: 'hazard-3',
        name: 'Badulla Unstable Slope',
        type: 'hazard',
        coordinates: [81.0500, 6.9833],
        description: 'Unstable slope with risk of earth slips',
        riskLevel: 'moderate',
        properties: {
          hazardType: 'Slope Failure',
          lastIncident: '2016-12-17',
          affectedArea: 'Approximately 3 sq km',
          monitoringStatus: 'Periodic NBRO inspections'
        }
      },
      {
        id: 'hazard-4',
        name: 'Kegalle Landslide Risk Zone',
        type: 'hazard',
        coordinates: [80.3500, 7.2500],
        description: 'Area with history of landslides during heavy rainfall',
        riskLevel: 'extreme',
        properties: {
          hazardType: 'Landslide',
          lastIncident: '2016-05-17',
          affectedArea: 'Approximately 12 sq km',
          monitoringStatus: 'Continuous monitoring and early warning system'
        }
      },
      {
        id: 'hazard-5',
        name: 'Batticaloa Coastal Erosion',
        type: 'hazard',
        coordinates: [81.7000, 7.7167],
        description: 'Coastal area experiencing significant erosion',
        riskLevel: 'moderate',
        properties: {
          hazardType: 'Coastal Erosion',
          lastIncident: 'Ongoing',
          affectedArea: 'Approximately 15 km of coastline',
          monitoringStatus: 'Coast Conservation Department monitoring'
        }
      }
    ]
  },
  {
    id: 'infrastructure',
    name: 'Critical Infrastructure',
    description: 'Major infrastructure facilities across Sri Lanka',
    visible: false,
    points: [
      {
        id: 'infra-1',
        name: 'Victoria Dam',
        type: 'infrastructure',
        coordinates: [80.7833, 7.2333],
        description: 'Major hydroelectric dam on the Mahaweli River',
        properties: {
          type: 'Dam',
          capacity: '210 MW',
          yearCompleted: '1985',
          operator: 'Ceylon Electricity Board',
          height: '122 meters'
        }
      },
      {
        id: 'infra-2',
        name: 'Colombo Port',
        type: 'infrastructure',
        coordinates: [79.8500, 6.9400],
        description: 'Main seaport of Sri Lanka',
        properties: {
          type: 'Port',
          capacity: '7.2 million TEUs per year',
          yearCompleted: 'Multiple phases since 1912',
          operator: 'Sri Lanka Ports Authority',
          area: '600 hectares'
        }
      },
      {
        id: 'infra-3',
        name: 'Bandaranaike International Airport',
        type: 'infrastructure',
        coordinates: [79.8841, 7.1807],
        description: 'Main international airport of Sri Lanka',
        properties: {
          type: 'Airport',
          capacity: '15 million passengers per year',
          yearCompleted: '1967 (major expansions since)',
          operator: 'Airport and Aviation Services Ltd',
          runways: '1'
        }
      },
      {
        id: 'infra-4',
        name: 'Norochcholai Power Station',
        type: 'infrastructure',
        coordinates: [79.7333, 8.0333],
        description: 'Largest coal power plant in Sri Lanka',
        properties: {
          type: 'Power Plant',
          capacity: '900 MW',
          yearCompleted: '2011 (Phase 1), 2014 (Phase 2)',
          operator: 'Ceylon Electricity Board',
          fuelType: 'Coal'
        }
      },
      {
        id: 'infra-5',
        name: 'Southern Expressway',
        type: 'infrastructure',
        coordinates: [80.0000, 6.3000],
        description: 'Major expressway connecting Colombo to Southern Province',
        properties: {
          type: 'Highway',
          length: '126 km',
          yearCompleted: '2011 (initial), 2019 (extension)',
          operator: 'Road Development Authority',
          lanes: '4'
        }
      }
    ]
  }
];

// Sample GeoJSON data for Sri Lanka districts
export const sriLankaDistricts = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Colombo",
        "province": "Western",
        "population": 2309809,
        "area": 699,
        "density": 3304
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.8612, 6.9271]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Gampaha",
        "province": "Western",
        "population": 2294641,
        "area": 1387,
        "density": 1655
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.9947, 7.0840]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Kalutara",
        "province": "Western",
        "population": 1217260,
        "area": 1598,
        "density": 762
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.9597, 6.5854]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Kandy",
        "province": "Central",
        "population": 1369899,
        "area": 1940,
        "density": 706
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.6337, 7.2906]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Matale",
        "province": "Central",
        "population": 482229,
        "area": 1993,
        "density": 242
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.6241, 7.4675]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Nuwara Eliya",
        "province": "Central",
        "population": 706588,
        "area": 1741,
        "density": 406
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.7891, 6.9497]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Galle",
        "province": "Southern",
        "population": 1058771,
        "area": 1652,
        "density": 641
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.2170, 6.0535]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Matara",
        "province": "Southern",
        "population": 809344,
        "area": 1283,
        "density": 631
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.5353, 5.9485]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Hambantota",
        "province": "Southern",
        "population": 596617,
        "area": 2609,
        "density": 229
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.1185, 6.1429]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Jaffna",
        "province": "Northern",
        "population": 583882,
        "area": 1025,
        "density": 570
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.0074, 9.6615]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Kilinochchi",
        "province": "Northern",
        "population": 112875,
        "area": 1279,
        "density": 88
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.3982, 9.3803]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Mannar",
        "province": "Northern",
        "population": 99051,
        "area": 1996,
        "density": 50
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.9000, 8.9833]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Vavuniya",
        "province": "Northern",
        "population": 171511,
        "area": 1967,
        "density": 87
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.4971, 8.7514]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Mullaitivu",
        "province": "Northern",
        "population": 91947,
        "area": 2617,
        "density": 35
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.8141, 9.2667]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Batticaloa",
        "province": "Eastern",
        "population": 525142,
        "area": 2854,
        "density": 184
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.7000, 7.7167]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Ampara",
        "province": "Eastern",
        "population": 648057,
        "area": 4415,
        "density": 147
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.6697, 7.2833]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Trincomalee",
        "province": "Eastern",
        "population": 378182,
        "area": 2727,
        "density": 139
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.2335, 8.5874]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Kurunegala",
        "province": "North Western",
        "population": 1610299,
        "area": 4816,
        "density": 334
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.3667, 7.4833]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Puttalam",
        "province": "North Western",
        "population": 759776,
        "area": 3072,
        "density": 247
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.8283, 8.0408]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Anuradhapura",
        "province": "North Central",
        "population": 856232,
        "area": 7179,
        "density": 119
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.4000, 8.3500]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Polonnaruwa",
        "province": "North Central",
        "population": 403335,
        "area": 3293,
        "density": 122
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.0000, 7.9333]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Badulla",
        "province": "Uva",
        "population": 811758,
        "area": 2861,
        "density": 284
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.0500, 6.9833]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Monaragala",
        "province": "Uva",
        "population": 448142,
        "area": 5639,
        "density": 79
      },
      "geometry": {
        "type": "Point",
        "coordinates": [81.3500, 6.8667]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Ratnapura",
        "province": "Sabaragamuwa",
        "population": 1088007,
        "area": 3275,
        "density": 332
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.4000, 6.6833]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Kegalle",
        "province": "Sabaragamuwa",
        "population": 840648,
        "area": 1693,
        "density": 497
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.3500, 7.2500]
      }
    }
  ]
};
