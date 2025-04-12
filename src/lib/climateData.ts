// Define types for climate data
export interface MonthlyData {
  month: string;
  rainfall: number;
  temperature: number;
  humidity: number;
}

export interface ExtremeWeatherEvent {
  date: string;
  type: 'flood' | 'drought' | 'landslide' | 'cyclone';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
  affectedAreas: string[];
}

export interface ClimateData {
  id: string;
  name: string;
  province: string;
  coordinates: [number, number]; // [longitude, latitude]
  elevation: number;
  annualRainfall: number;
  averageTemperature: number;
  monthlyData: MonthlyData[];
  extremeEvents: ExtremeWeatherEvent[];
  rainfallTrend: {
    year: number;
    value: number;
  }[];
  temperatureTrend: {
    year: number;
    value: number;
  }[];
}

// Sample climate data for different regions in Sri Lanka
export const climateDataset: ClimateData[] = [
  {
    id: 'colombo',
    name: 'Colombo',
    province: 'Western',
    coordinates: [79.8612, 6.9271],
    elevation: 5,
    annualRainfall: 2400,
    averageTemperature: 28.5,
    monthlyData: [
      { month: 'Jan', rainfall: 62, temperature: 27.5, humidity: 75 },
      { month: 'Feb', rainfall: 69, temperature: 27.8, humidity: 73 },
      { month: 'Mar', rainfall: 130, temperature: 28.6, humidity: 74 },
      { month: 'Apr', rainfall: 250, temperature: 29.1, humidity: 77 },
      { month: 'May', rainfall: 382, temperature: 29.3, humidity: 80 },
      { month: 'Jun', rainfall: 186, temperature: 28.7, humidity: 80 },
      { month: 'Jul', rainfall: 124, temperature: 28.3, humidity: 79 },
      { month: 'Aug', rainfall: 116, temperature: 28.2, humidity: 78 },
      { month: 'Sep', rainfall: 236, temperature: 28.2, humidity: 79 },
      { month: 'Oct', rainfall: 371, temperature: 27.9, humidity: 80 },
      { month: 'Nov', rainfall: 310, temperature: 27.6, humidity: 79 },
      { month: 'Dec', rainfall: 168, temperature: 27.2, humidity: 77 }
    ],
    extremeEvents: [
      {
        date: '2016-05-15',
        type: 'flood',
        severity: 'high',
        description: 'Heavy rainfall caused widespread flooding in Colombo and surrounding areas',
        affectedAreas: ['Colombo', 'Gampaha', 'Kalutara']
      },
      {
        date: '2019-04-22',
        type: 'flood',
        severity: 'moderate',
        description: 'Urban flooding due to intense rainfall',
        affectedAreas: ['Colombo', 'Dehiwala']
      }
    ],
    rainfallTrend: [
      { year: 2013, value: 2350 },
      { year: 2014, value: 2410 },
      { year: 2015, value: 2380 },
      { year: 2016, value: 2520 },
      { year: 2017, value: 2450 },
      { year: 2018, value: 2390 },
      { year: 2019, value: 2480 },
      { year: 2020, value: 2510 },
      { year: 2021, value: 2470 },
      { year: 2022, value: 2530 }
    ],
    temperatureTrend: [
      { year: 2013, value: 28.1 },
      { year: 2014, value: 28.2 },
      { year: 2015, value: 28.3 },
      { year: 2016, value: 28.5 },
      { year: 2017, value: 28.4 },
      { year: 2018, value: 28.6 },
      { year: 2019, value: 28.7 },
      { year: 2020, value: 28.8 },
      { year: 2021, value: 28.7 },
      { year: 2022, value: 28.9 }
    ]
  },
  {
    id: 'kandy',
    name: 'Kandy',
    province: 'Central',
    coordinates: [80.6337, 7.2906],
    elevation: 500,
    annualRainfall: 1800,
    averageTemperature: 24.5,
    monthlyData: [
      { month: 'Jan', rainfall: 80, temperature: 23.2, humidity: 79 },
      { month: 'Feb', rainfall: 70, temperature: 23.8, humidity: 75 },
      { month: 'Mar', rainfall: 100, temperature: 25.1, humidity: 74 },
      { month: 'Apr', rainfall: 180, temperature: 25.6, humidity: 77 },
      { month: 'May', rainfall: 160, temperature: 25.3, humidity: 80 },
      { month: 'Jun', rainfall: 120, temperature: 24.8, humidity: 82 },
      { month: 'Jul', rainfall: 150, temperature: 24.3, humidity: 81 },
      { month: 'Aug', rainfall: 140, temperature: 24.2, humidity: 80 },
      { month: 'Sep', rainfall: 170, temperature: 24.4, humidity: 80 },
      { month: 'Oct', rainfall: 230, temperature: 24.1, humidity: 82 },
      { month: 'Nov', rainfall: 220, temperature: 23.8, humidity: 83 },
      { month: 'Dec', rainfall: 180, temperature: 23.4, humidity: 81 }
    ],
    extremeEvents: [
      {
        date: '2017-05-25',
        type: 'landslide',
        severity: 'high',
        description: 'Heavy rainfall triggered landslides in hilly areas',
        affectedAreas: ['Kandy', 'Peradeniya']
      }
    ],
    rainfallTrend: [
      { year: 2013, value: 1750 },
      { year: 2014, value: 1780 },
      { year: 2015, value: 1820 },
      { year: 2016, value: 1790 },
      { year: 2017, value: 1850 },
      { year: 2018, value: 1810 },
      { year: 2019, value: 1830 },
      { year: 2020, value: 1860 },
      { year: 2021, value: 1840 },
      { year: 2022, value: 1880 }
    ],
    temperatureTrend: [
      { year: 2013, value: 24.1 },
      { year: 2014, value: 24.2 },
      { year: 2015, value: 24.3 },
      { year: 2016, value: 24.4 },
      { year: 2017, value: 24.5 },
      { year: 2018, value: 24.6 },
      { year: 2019, value: 24.7 },
      { year: 2020, value: 24.8 },
      { year: 2021, value: 24.7 },
      { year: 2022, value: 24.9 }
    ]
  },
  {
    id: 'jaffna',
    name: 'Jaffna',
    province: 'Northern',
    coordinates: [80.0074, 9.6615],
    elevation: 10,
    annualRainfall: 1300,
    averageTemperature: 27.8,
    monthlyData: [
      { month: 'Jan', rainfall: 70, temperature: 26.2, humidity: 75 },
      { month: 'Feb', rainfall: 40, temperature: 26.8, humidity: 73 },
      { month: 'Mar', rainfall: 30, temperature: 28.1, humidity: 72 },
      { month: 'Apr', rainfall: 60, temperature: 29.3, humidity: 74 },
      { month: 'May', rainfall: 50, temperature: 29.8, humidity: 75 },
      { month: 'Jun', rainfall: 10, temperature: 29.5, humidity: 73 },
      { month: 'Jul', rainfall: 15, temperature: 29.1, humidity: 72 },
      { month: 'Aug', rainfall: 20, temperature: 28.9, humidity: 73 },
      { month: 'Sep', rainfall: 80, temperature: 28.7, humidity: 75 },
      { month: 'Oct', rainfall: 220, temperature: 27.9, humidity: 79 },
      { month: 'Nov', rainfall: 320, temperature: 26.8, humidity: 80 },
      { month: 'Dec', rainfall: 250, temperature: 26.1, humidity: 78 }
    ],
    extremeEvents: [
      {
        date: '2018-12-22',
        type: 'cyclone',
        severity: 'moderate',
        description: 'Cyclonic storm brought heavy winds and rainfall',
        affectedAreas: ['Jaffna', 'Kilinochchi']
      },
      {
        date: '2016-08-10',
        type: 'drought',
        severity: 'high',
        description: 'Severe drought affected agricultural activities',
        affectedAreas: ['Jaffna', 'Mullaitivu', 'Vavuniya']
      }
    ],
    rainfallTrend: [
      { year: 2013, value: 1250 },
      { year: 2014, value: 1280 },
      { year: 2015, value: 1220 },
      { year: 2016, value: 1150 },
      { year: 2017, value: 1310 },
      { year: 2018, value: 1340 },
      { year: 2019, value: 1290 },
      { year: 2020, value: 1320 },
      { year: 2021, value: 1350 },
      { year: 2022, value: 1330 }
    ],
    temperatureTrend: [
      { year: 2013, value: 27.3 },
      { year: 2014, value: 27.4 },
      { year: 2015, value: 27.6 },
      { year: 2016, value: 27.8 },
      { year: 2017, value: 27.7 },
      { year: 2018, value: 27.9 },
      { year: 2019, value: 28.0 },
      { year: 2020, value: 28.1 },
      { year: 2021, value: 28.0 },
      { year: 2022, value: 28.2 }
    ]
  },
  {
    id: 'galle',
    name: 'Galle',
    province: 'Southern',
    coordinates: [80.2170, 6.0535],
    elevation: 15,
    annualRainfall: 2200,
    averageTemperature: 27.2,
    monthlyData: [
      { month: 'Jan', rainfall: 90, temperature: 26.8, humidity: 78 },
      { month: 'Feb', rainfall: 100, temperature: 27.1, humidity: 77 },
      { month: 'Mar', rainfall: 130, temperature: 27.8, humidity: 78 },
      { month: 'Apr', rainfall: 210, temperature: 28.2, humidity: 80 },
      { month: 'May', rainfall: 320, temperature: 28.0, humidity: 82 },
      { month: 'Jun', rainfall: 250, temperature: 27.5, humidity: 83 },
      { month: 'Jul', rainfall: 190, temperature: 27.2, humidity: 82 },
      { month: 'Aug', rainfall: 180, temperature: 27.1, humidity: 81 },
      { month: 'Sep', rainfall: 240, temperature: 27.3, humidity: 82 },
      { month: 'Oct', rainfall: 280, temperature: 27.0, humidity: 83 },
      { month: 'Nov', rainfall: 230, temperature: 26.7, humidity: 82 },
      { month: 'Dec', rainfall: 130, temperature: 26.5, humidity: 80 }
    ],
    extremeEvents: [
      {
        date: '2017-05-27',
        type: 'flood',
        severity: 'extreme',
        description: 'Severe flooding due to monsoon rains',
        affectedAreas: ['Galle', 'Matara', 'Kalutara']
      }
    ],
    rainfallTrend: [
      { year: 2013, value: 2150 },
      { year: 2014, value: 2180 },
      { year: 2015, value: 2220 },
      { year: 2016, value: 2190 },
      { year: 2017, value: 2350 },
      { year: 2018, value: 2210 },
      { year: 2019, value: 2230 },
      { year: 2020, value: 2260 },
      { year: 2021, value: 2240 },
      { year: 2022, value: 2280 }
    ],
    temperatureTrend: [
      { year: 2013, value: 26.8 },
      { year: 2014, value: 26.9 },
      { year: 2015, value: 27.0 },
      { year: 2016, value: 27.1 },
      { year: 2017, value: 27.2 },
      { year: 2018, value: 27.3 },
      { year: 2019, value: 27.4 },
      { year: 2020, value: 27.5 },
      { year: 2021, value: 27.4 },
      { year: 2022, value: 27.6 }
    ]
  },
  {
    id: 'trincomalee',
    name: 'Trincomalee',
    province: 'Eastern',
    coordinates: [81.2335, 8.5874],
    elevation: 5,
    annualRainfall: 1650,
    averageTemperature: 28.1,
    monthlyData: [
      { month: 'Jan', rainfall: 200, temperature: 26.5, humidity: 80 },
      { month: 'Feb', rainfall: 100, temperature: 26.9, humidity: 78 },
      { month: 'Mar', rainfall: 60, temperature: 28.0, humidity: 76 },
      { month: 'Apr', rainfall: 80, temperature: 29.2, humidity: 75 },
      { month: 'May', rainfall: 120, temperature: 30.1, humidity: 76 },
      { month: 'Jun', rainfall: 50, temperature: 30.3, humidity: 74 },
      { month: 'Jul', rainfall: 60, temperature: 29.8, humidity: 73 },
      { month: 'Aug', rainfall: 90, temperature: 29.5, humidity: 74 },
      { month: 'Sep', rainfall: 110, temperature: 29.2, humidity: 76 },
      { month: 'Oct', rainfall: 220, temperature: 28.3, humidity: 80 },
      { month: 'Nov', rainfall: 320, temperature: 27.1, humidity: 83 },
      { month: 'Dec', rainfall: 240, temperature: 26.4, humidity: 82 }
    ],
    extremeEvents: [
      {
        date: '2020-12-02',
        type: 'cyclone',
        severity: 'high',
        description: 'Cyclone Burevi brought heavy rainfall and strong winds',
        affectedAreas: ['Trincomalee', 'Batticaloa', 'Ampara']
      }
    ],
    rainfallTrend: [
      { year: 2013, value: 1600 },
      { year: 2014, value: 1620 },
      { year: 2015, value: 1590 },
      { year: 2016, value: 1630 },
      { year: 2017, value: 1650 },
      { year: 2018, value: 1670 },
      { year: 2019, value: 1640 },
      { year: 2020, value: 1720 },
      { year: 2021, value: 1680 },
      { year: 2022, value: 1660 }
    ],
    temperatureTrend: [
      { year: 2013, value: 27.6 },
      { year: 2014, value: 27.7 },
      { year: 2015, value: 27.8 },
      { year: 2016, value: 28.0 },
      { year: 2017, value: 28.1 },
      { year: 2018, value: 28.2 },
      { year: 2019, value: 28.3 },
      { year: 2020, value: 28.4 },
      { year: 2021, value: 28.3 },
      { year: 2022, value: 28.5 }
    ]
  },
  {
    id: 'nuwara-eliya',
    name: 'Nuwara Eliya',
    province: 'Central',
    coordinates: [80.7891, 6.9497],
    elevation: 1868,
    annualRainfall: 1900,
    averageTemperature: 15.8,
    monthlyData: [
      { month: 'Jan', rainfall: 100, temperature: 14.5, humidity: 79 },
      { month: 'Feb', rainfall: 90, temperature: 15.1, humidity: 75 },
      { month: 'Mar', rainfall: 110, temperature: 16.2, humidity: 74 },
      { month: 'Apr', rainfall: 180, temperature: 16.8, humidity: 78 },
      { month: 'May', rainfall: 190, temperature: 16.5, humidity: 82 },
      { month: 'Jun', rainfall: 160, temperature: 15.9, humidity: 85 },
      { month: 'Jul', rainfall: 150, temperature: 15.4, humidity: 84 },
      { month: 'Aug', rainfall: 140, temperature: 15.3, humidity: 83 },
      { month: 'Sep', rainfall: 170, temperature: 15.6, humidity: 82 },
      { month: 'Oct', rainfall: 220, temperature: 15.8, humidity: 83 },
      { month: 'Nov', rainfall: 210, temperature: 15.3, humidity: 84 },
      { month: 'Dec', rainfall: 180, temperature: 14.8, humidity: 82 }
    ],
    extremeEvents: [
      {
        date: '2016-05-17',
        type: 'landslide',
        severity: 'extreme',
        description: 'Catastrophic landslides due to heavy rainfall',
        affectedAreas: ['Nuwara Eliya', 'Aranayake']
      }
    ],
    rainfallTrend: [
      { year: 2013, value: 1850 },
      { year: 2014, value: 1880 },
      { year: 2015, value: 1920 },
      { year: 2016, value: 1970 },
      { year: 2017, value: 1930 },
      { year: 2018, value: 1910 },
      { year: 2019, value: 1940 },
      { year: 2020, value: 1960 },
      { year: 2021, value: 1950 },
      { year: 2022, value: 1980 }
    ],
    temperatureTrend: [
      { year: 2013, value: 15.3 },
      { year: 2014, value: 15.4 },
      { year: 2015, value: 15.5 },
      { year: 2016, value: 15.7 },
      { year: 2017, value: 15.8 },
      { year: 2018, value: 15.9 },
      { year: 2019, value: 16.0 },
      { year: 2020, value: 16.1 },
      { year: 2021, value: 16.0 },
      { year: 2022, value: 16.2 }
    ]
  }
];
