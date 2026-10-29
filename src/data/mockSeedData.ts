/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Challenge,
  University,
  Project,
  NotificationItem,
  AuditLogItem
} from '../types.js';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-citizen-01',
    name: 'Rameshwar Munda',
    email: 'rameshwar.munda@demo.setu.gov.in',
    role: 'CITIZEN',
    district: 'Khunti',
    phone: '+91 94311 00142',
    verified: true,
    createdAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 'usr-officer-01',
    name: 'Dr. Alok Kumar Verma, IAS',
    email: 'officer.validation@jharkhand.gov.in',
    role: 'GOVERNMENT_OFFICER',
    organization: 'Department of Higher & Technical Education',
    department: 'State Innovation Council & Technical Education',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-uni-admin-01',
    name: 'Prof. S. N. Sinha',
    email: 'dean.rnd@bitmesra.ac.in',
    role: 'UNIVERSITY_ADMIN',
    organization: 'Birla Institute of Technology (BIT) Mesra [DEMO DATA]',
    department: 'Dean Research, Innovation & Consultancy',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-02-12T10:00:00Z'
  },
  {
    id: 'usr-faculty-01',
    name: 'Dr. Ananya Roy',
    email: 'ananya.roy@bitmesra.ac.in',
    role: 'FACULTY_MENTOR',
    organization: 'BIT Mesra [DEMO DATA]',
    department: 'Civil & Environmental Engineering',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-02-15T11:00:00Z'
  },
  {
    id: 'usr-student-01',
    name: 'Pooja Kumari',
    email: 'pooja.k.btech23@bitmesra.ac.in',
    role: 'STUDENT',
    organization: 'BIT Mesra [DEMO DATA]',
    department: 'Computer Science & Engineering',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-03-01T08:30:00Z'
  },
  {
    id: 'usr-student-02',
    name: 'Amit Hansda',
    email: 'amit.h.civil23@bitmesra.ac.in',
    role: 'STUDENT',
    organization: 'BIT Mesra [DEMO DATA]',
    department: 'Civil Engineering',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-03-01T08:35:00Z'
  },
  {
    id: 'usr-industry-01',
    name: 'Vikas Agarwal',
    email: 'vikas.agarwal@tatasteel.com.demo',
    role: 'INDUSTRY_PARTNER',
    organization: 'Tata Steel Innovation Centre [DEMO DATA]',
    department: 'Rural Technology & MSME Incubation',
    district: 'East Singhbhum (Jamshedpur)',
    verified: true,
    createdAt: '2026-02-20T14:00:00Z'
  },
  {
    id: 'usr-csr-01',
    name: 'Meera Sengupta',
    email: 'meera.s@csr-jharkhandfoundation.org.demo',
    role: 'CSR_ORGANIZATION',
    organization: 'Jharkhand Sustainable Futures CSR Foundation [DEMO DATA]',
    department: 'Rural Water & Education Grants',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-02-25T15:00:00Z'
  },
  {
    id: 'usr-admin-01',
    name: 'State SETU Super Administrator',
    email: 'admin.setu@jharkhand.gov.in',
    role: 'PLATFORM_ADMIN',
    organization: 'Government of Jharkhand',
    department: 'IT & e-Governance / Higher & Technical Education',
    district: 'Ranchi',
    verified: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const DEMO_UNIVERSITIES: University[] = [
  {
    id: 'uni-01',
    name: 'Birla Institute of Technology (BIT) Mesra',
    shortName: 'BIT Mesra',
    location: 'Mesra, Ranchi',
    district: 'Ranchi',
    departments: ['Civil & Environmental Engineering', 'Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Bio-Engineering', 'Remote Sensing'],
    courses: ['B.Tech', 'M.Tech', 'Ph.D', 'Integrated M.Sc.'],
    facultyExpertise: ['Water Resources Engineering', 'IoT & Embedded Systems', 'Environmental Quality Monitoring', 'GIS & Satellite Telemetry', 'Structural Analysis'],
    researchAreas: ['Smart Water Quality Grids', 'Rural Micro-Sensors', 'Disaster Mitigation', 'Renewable Clean Energy'],
    labs: ['Water & Wastewater Treatment Lab', 'IoT & Embedded Systems Centre', 'Remote Sensing & GIS Cell', 'Advanced Material Characterization'],
    innovationCentre: 'Centre for Innovation, Incubation and Entrepreneurship (CIIE)',
    incubationCentre: 'BIT-TBI (DST Supported)',
    existingProjectsCount: 14,
    patentsCount: 8,
    facilities: ['Water Quality Spectrophotometer', '3D Prototyping Workshop', 'LoRaWAN Field Gateway', 'High Performance Computing Cluster'],
    studentCapabilities: ['Full-stack Sensor Integration', 'Low-cost Filtration Fabrication', 'Mobile Telemetry Apps', 'Hydraulic Modeling'],
    isDemoData: true
  },
  {
    id: 'uni-02',
    name: 'National Institute of Technology (NIT) Jamshedpur',
    shortName: 'NIT Jamshedpur',
    location: 'Adityapur, Jamshedpur',
    district: 'East Singhbhum (Jamshedpur)',
    departments: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Metallurgical & Materials', 'Computer Science'],
    courses: ['B.Tech', 'M.Tech', 'Ph.D'],
    facultyExpertise: ['Pavement Material Engineering', 'Solar Microgrid Architecture', 'Smart IoT Gateways', 'Hydraulic Structures'],
    researchAreas: ['Recycled Aggregates in Rural Roads', 'Decentralized Solar Networks', 'Acoustic Leak Detection'],
    labs: ['Highway & Transportation Lab', 'Renewable Energy Systems Lab', 'Robotics & Automation Lab'],
    innovationCentre: 'NITJ Innovation & Incubation Hub',
    incubationCentre: 'Technology Incubation Centre (TIC)',
    existingProjectsCount: 11,
    patentsCount: 5,
    facilities: ['Road Profilometer & Core Drill Testing', 'Solar PV Simulator', 'Heavy Structures Testing Rig'],
    studentCapabilities: ['Pothole Detection Computer Vision', 'Solar MPPT Controllers', 'Low-cost Sensor Fabrication'],
    isDemoData: true
  },
  {
    id: 'uni-03',
    name: 'Indian Institute of Technology (ISM) Dhanbad',
    shortName: 'IIT (ISM) Dhanbad',
    location: 'Sardar Patel Nagar, Dhanbad',
    district: 'Dhanbad',
    departments: ['Mining Engineering', 'Environmental Science & Engineering', 'Civil Engineering', 'Electronics Engineering'],
    courses: ['B.Tech', 'M.Tech', 'Ph.D'],
    facultyExpertise: ['Mine Water Purification', 'Groundwater Hydrogeology', 'Smart Telemetry', 'Environmental Impact Assessment'],
    researchAreas: ['Acid Mine Drainage Remediation', 'Disaster Early Warning', 'Clean Drinking Water from Mine Voids'],
    labs: ['Hydrogeology Research Lab', 'Advanced Environmental Engineering Lab', 'TexMin Technology Innovation Hub'],
    innovationCentre: 'Centre of Excellence in Sustainable Mining',
    incubationCentre: 'IIT ISM Innovation Hub (i-TBI)',
    existingProjectsCount: 18,
    patentsCount: 12,
    facilities: ['Inductively Coupled Plasma Mass Spectrometer (ICP-MS)', 'Drone Georeferencing Unit', 'Pilot Membrane Filtration System'],
    studentCapabilities: ['Automated Water Quality Analytics', 'Geospatial Watershed Modeling', 'Telemetry Firmware Development'],
    isDemoData: true
  },
  {
    id: 'uni-04',
    name: 'Birsa Agricultural University (BAU) Kanke',
    shortName: 'BAU Ranchi',
    location: 'Kanke, Ranchi',
    district: 'Ranchi',
    departments: ['Agronomy', 'Soil Science & Agricultural Chemistry', 'Agricultural Engineering', 'Horticulture'],
    courses: ['B.Sc. Agri', 'M.Tech Farm Machinery', 'Ph.D'],
    facultyExpertise: ['Precision Drip Irrigation', 'Rainwater Harvesting', 'Soil Nutrient Deficiency Mapping', 'Drought Resistant Crops'],
    researchAreas: ['Plateau Agro-Ecology', 'Low-power Solar Pump Systems', 'Soil Moisture Micro-Controllers'],
    labs: ['Soil & Water Conservation Engineering Lab', 'Seed Technology Research Lab', 'Agro-Meteorology Observatory'],
    innovationCentre: 'Agri-Business Incubation Centre (R-ABI)',
    existingProjectsCount: 9,
    patentsCount: 3,
    facilities: ['Agro-Climatic Sensor Network', 'Precision Drip Testbeds', 'Greenhouse Controlled Environment'],
    studentCapabilities: ['Soil Sensor Calibration', 'Mobile Farm Advisory Development', 'Gravity Drip Installation'],
    isDemoData: true
  },
  {
    id: 'uni-05',
    name: 'Ranchi University, Ranchi',
    shortName: 'Ranchi University',
    location: 'Shaheed Chowk, Ranchi',
    district: 'Ranchi',
    departments: ['Physics & Electronics', 'Chemistry', 'Botany & Environmental Science', 'Geology'],
    courses: ['B.Sc.', 'M.Sc.', 'Ph.D', 'MCA'],
    facultyExpertise: ['Water Chemistry', 'Fluoride Contamination Mitigation', 'Rural Community Studies', 'GIS Mapping'],
    researchAreas: ['Plateau Groundwater Contamination', 'Herbal Water Coagulants', 'Community Resource Governance'],
    labs: ['Chemical Analysis Core Lab', 'Applied Geology & Remote Sensing Lab'],
    innovationCentre: 'University Science Instrumentation Centre (USIC)',
    existingProjectsCount: 6,
    patentsCount: 1,
    facilities: ['Spectrophotometer', 'Atomic Absorption Spectrometer (AAS)', 'Water Sampling Mobile Van'],
    studentCapabilities: ['Field Water Testing Testing Kits', 'Community Survey Tooling', 'Water Hardness Testing'],
    isDemoData: true
  }
];

export const DEMO_CHALLENGES: Challenge[] = [
  {
    id: 'SETU-JH-2026-00142',
    title: 'No reliable drinking water in village and women walking 3 km daily',
    description: 'There is no reliable drinking water in our village of Torpa block. Two tube-wells are damaged and dry, and villagers have to walk over 3 km every single morning to collect water from a muddy pit. Children are suffering from waterborne illnesses and stomach infections.',
    category: 'Water & Sanitation',
    location: {
      state: 'Jharkhand',
      district: 'Khunti',
      block: 'Torpa',
      villageOrCity: 'Dorma Gram Panchayat',
      pincode: '835227',
      coordinates: { lat: 22.9567, lng: 85.2789 }
    },
    citizenId: 'usr-citizen-01',
    citizenName: 'Rameshwar Munda',
    citizenPhone: '+91 94311 00142',
    peopleAffected: 1750,
    urgency: 'HIGH',
    additionalInfo: 'Around 350 households are severely affected. The water collected from the pit has high turbidity and iron odor.',
    media: [
      {
        id: 'med-01',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
        name: 'dry_handpump_village_square.jpg',
        uploadedAt: '2026-08-01T09:05:00Z'
      }
    ],
    status: 'PILOT_DEPLOYED',
    aiAnalysis: {
      detected_language: 'English (with local Jharkhand context)',
      problem_summary: 'Lack of reliable drinking water and high travel distance (3 km) causing health hazards for 350 households in Torpa, Khunti.',
      domain: 'Drinking Water and Sanitation',
      sub_domain: 'Drinking Water',
      priority: 'HIGH',
      confidence: 96,
      required_expertise: ['Civil Engineering', 'Water Resources', 'IoT', 'Environmental Engineering', 'Solar Pumping'],
      possible_departments: ['Drinking Water and Sanitation', 'Rural Development'],
      possible_universities: ['BIT Mesra', 'IIT (ISM) Dhanbad', 'NIT Jamshedpur'],
      duplicate_candidates: [],
      innovation_assessment: 'INNOVATION_GAP',
      reasoning_summary: 'While Jal Jeevan Mission covers piped schemes, low water table and rocky plateau strata require decentralized solar-powered filtration with remote IoT borehole water level and quality telemetry to prevent pump burnout.',
      existing_schemes: ['Jal Jeevan Mission (JJM)', 'Swachh Bharat Mission (Grameen)'],
      analyzed_at: '2026-08-01T09:06:12Z',
      model_used: 'gemini-3.8-flash'
    },
    assignedDepartmentId: 'dept-04',
    assignedDepartmentName: 'Drinking Water and Sanitation',
    officerRemarks: 'Validated by State Innovation Committee. Forwarded to BIT Mesra Civil & IoT Engineering team for solar telemetry prototype & pilot implementation.',
    supportCount: 47,
    supporters: [
      { citizenId: 'usr-citizen-01', citizenName: 'Rameshwar Munda', location: 'Torpa, Khunti', supportedAt: '2026-08-01T09:05:00Z', note: 'Original reporter' },
      { citizenId: 'usr-c-02', citizenName: 'Birsa Purty', location: 'Dorma, Khunti', supportedAt: '2026-08-02T10:15:00Z', note: 'Our tola also has dry handpumps' },
      { citizenId: 'usr-c-03', citizenName: 'Somra Oraon', location: 'Torpa, Khunti', supportedAt: '2026-08-03T11:40:00Z', note: 'Immediate intervention needed for school children' }
    ],
    duplicateCluster: {
      clusterId: 'CLUST-JH-001',
      mainChallengeId: 'SETU-JH-2026-00142',
      reportsCount: 4,
      supportingCitizensCount: 47,
      photosCount: 6,
      semanticSimilarityPercent: 91,
      locationOverlapPercent: 88,
      status: 'MERGED'
    },
    innovationGate: {
      checkedAt: '2026-08-01T09:07:00Z',
      classification: 'INNOVATION_GAP',
      existingSolutions: {
        governmentSolutionsCount: 2,
        researchCount: 14,
        patentsCount: 3,
        openSourceCount: 5,
        existingProductsCount: 1,
        previousProjectsCount: 2
      },
      gapExplanation: 'Rocky plateau strata and deep aquifer depletion render standard shallow handpumps inoperative within 18 months. Commercial RO systems waste 60% water. A gravity-assisted nano-filtration setup with IoT solar telemetry is required.',
      recommendation: 'Authorize university research pilot for decentralized hybrid filtration with automated drawdown shutoff.',
      references: [
        { title: 'Jharkhand Groundwater Board Plateau Aquifer Report 2025', type: 'Government Report', url: 'https://jharkhand.gov.in' },
        { title: 'Solar-Powered Low-Maintenance Fluoride Filtration in Chotanagpur Plateau', type: 'Research Paper', url: 'https://doi.org/10.1016/j.jwpe.2024.103982' },
        { title: 'Indian Patent 421099 - Gravity Sediment Trap with Cyclonic Pre-separator', type: 'Patent', url: 'https://ipindia.gov.in' }
      ]
    },
    createdAt: '2026-08-01T09:05:00Z',
    updatedAt: '2026-09-10T14:20:00Z',
    projectId: 'proj-00142'
  },
  {
    id: 'SETU-JH-2026-00108',
    title: 'Heavy soil erosion and severe pothole damage cutting off school access',
    description: 'During monsoons, 4 km of rural approach road to Kasturba Gandhi Balika Vidyalaya in Shikaripara has washed away. Ambulances cannot enter and 420 girl students are unable to attend school safely.',
    category: 'Roads & Infrastructure',
    location: {
      state: 'Jharkhand',
      district: 'Dumka',
      block: 'Shikaripara',
      villageOrCity: 'Banjhi Village',
      pincode: '814158',
      coordinates: { lat: 24.2689, lng: 87.5211 }
    },
    citizenId: 'usr-citizen-01',
    citizenName: 'Sunita Marandi',
    citizenPhone: '+91 98351 44521',
    peopleAffected: 2400,
    urgency: 'HIGH',
    additionalInfo: 'Standard tar surfacing washes off within 2 months due to high slope runoff and clay-rich soil.',
    media: [
      {
        id: 'med-02',
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        name: 'damaged_mud_road_monsoon.jpg',
        uploadedAt: '2026-08-05T10:15:00Z'
      }
    ],
    status: 'PROJECT_APPROVED',
    aiAnalysis: {
      detected_language: 'English',
      problem_summary: 'Severe road erosion on 4km rural stretch blocking access to Kasturba Balika Vidyalaya due to excessive stormwater runoff.',
      domain: 'Road Construction',
      sub_domain: 'Road Infrastructure',
      priority: 'HIGH',
      confidence: 94,
      required_expertise: ['Civil Engineering', 'Geotechnical Engineering', 'Pavement Materials', 'Hydrological Runoff Modeling'],
      possible_departments: ['Road Construction', 'Rural Development'],
      possible_universities: ['NIT Jamshedpur', 'BIT Mesra'],
      duplicate_candidates: [],
      innovation_assessment: 'INNOVATION_GAP',
      reasoning_summary: 'Standard bitumen fails on this slope. Requires research into geocell soil stabilization combined with steel slag/fly-ash composite paving for high-moisture hillocks.',
      existing_schemes: ['PMGSY (Pradhan Mantri Gram Sadak Yojana)'],
      analyzed_at: '2026-08-05T10:16:30Z',
      model_used: 'gemini-3.8-flash'
    },
    assignedDepartmentId: 'dept-20',
    assignedDepartmentName: 'Road Construction',
    officerRemarks: 'Approved for R&D pilot collaboration with NIT Jamshedpur Highway Lab and Bokaro Steel MSME slag consortium.',
    supportCount: 32,
    supporters: [
      { citizenId: 'usr-c-04', citizenName: 'Sunita Marandi', location: 'Shikaripara, Dumka', supportedAt: '2026-08-05T10:15:00Z', note: 'School principal' },
      { citizenId: 'usr-c-05', citizenName: 'Manoj Hembrom', location: 'Banjhi, Dumka', supportedAt: '2026-08-06T14:20:00Z', note: 'Ambulance turned back last week' }
    ],
    duplicateCluster: {
      clusterId: 'CLUST-JH-002',
      mainChallengeId: 'SETU-JH-2026-00108',
      reportsCount: 3,
      supportingCitizensCount: 32,
      photosCount: 4,
      semanticSimilarityPercent: 89,
      locationOverlapPercent: 94,
      status: 'MERGED'
    },
    innovationGate: {
      checkedAt: '2026-08-05T10:18:00Z',
      classification: 'INNOVATION_GAP',
      existingSolutions: {
        governmentSolutionsCount: 1,
        researchCount: 9,
        patentsCount: 2,
        openSourceCount: 3,
        existingProductsCount: 2,
        previousProjectsCount: 1
      },
      gapExplanation: 'High precipitation intensity on laterite clay hills causes recurring base subgrade failure. Conventional WBM (Water Bound Macadam) road washouts recur annually. Geocell interlocking with localized industrial slag matrix needed.',
      recommendation: 'Deploy academic trial using industrial by-product stabilizer under PMGSY innovation window.',
      references: [
        { title: 'Indian Roads Congress IRC:SP:89-2019 Guidelines on Soil Stabilization', type: 'Technical Standard', url: 'https://irc.nic.in' },
        { title: 'Performance of Steel Slag Aggregate in Semi-Rigid Pavements in High Rainfall Zones', type: 'Research Paper', url: 'https://doi.org/10.1016/j.conbuildmat.2023.131456' }
      ]
    },
    createdAt: '2026-08-05T10:15:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    projectId: 'proj-00108'
  },
  {
    id: 'SETU-JH-2026-00087',
    title: 'Frequent grid failure disabling digital smart classrooms in tribal residential school',
    description: 'Our tribal residential school in Latehar receives barely 2 to 3 hours of erratic electricity per day. The government provided smart interactive boards and computer lab, but they remain shut down 80% of the time.',
    category: 'Energy & Education',
    location: {
      state: 'Jharkhand',
      district: 'Latehar',
      block: 'Mahuadanr',
      villageOrCity: 'Orsa Village',
      pincode: '822119',
      coordinates: { lat: 23.3892, lng: 84.1123 }
    },
    citizenId: 'usr-citizen-01',
    citizenName: 'Father Joseph Toppo',
    citizenPhone: '+91 94701 88921',
    peopleAffected: 650,
    urgency: 'MEDIUM',
    additionalInfo: 'School has 350 residential students. Standard diesel generators are too expensive to operate continuously.',
    media: [],
    status: 'PROTOTYPE_READY',
    aiAnalysis: {
      detected_language: 'English',
      problem_summary: 'Erratic grid power (2-3 hrs/day) disabling digital learning infrastructure for 350 students in remote tribal school.',
      domain: 'Energy',
      sub_domain: 'Renewable Energy',
      priority: 'MEDIUM',
      confidence: 93,
      required_expertise: ['Electrical Engineering', 'Solar Microgrids', 'Battery Management Systems', 'IoT Power Telemetry'],
      possible_departments: ['Energy', 'School Education & Literacy'],
      possible_universities: ['NIT Jamshedpur', 'BIT Mesra'],
      duplicate_candidates: [],
      innovation_assessment: 'INNOVATION_GAP',
      reasoning_summary: 'High humidity and temperature swings in Mahuadanr valley require a smart hybrid DC microgrid with dynamic load-shedding prioritizing educational devices over non-critical loads.',
      existing_schemes: ['Jharkhand Renewable Energy Development Agency (JREDA) Solar Rooftop'],
      analyzed_at: '2026-07-20T11:02:15Z',
      model_used: 'gemini-3.8-flash'
    },
    assignedDepartmentId: 'dept-05',
    assignedDepartmentName: 'Energy',
    officerRemarks: 'Forwarded to NIT Jamshedpur Electrical Department. Prototype battery management controller tested in lab.',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-08-30T16:45:00Z',
    projectId: 'proj-00087'
  },
  {
    id: 'SETU-JH-2026-00054',
    title: 'Flash flooding of river tributary submerging pedestrian bridge during school hours',
    description: 'During heavy rain in Sahibganj, the seasonal stream swells unpredictably within 30 minutes, marooning 3 villages and 600 children. There is no automated warning system, and locals rely on visual guesswork.',
    category: 'Disaster Management & Water',
    location: {
      state: 'Jharkhand',
      district: 'Sahibganj',
      block: 'Barharwa',
      villageOrCity: 'Kalyanpur',
      pincode: '816101',
      coordinates: { lat: 24.8567, lng: 87.7789 }
    },
    citizenId: 'usr-citizen-01',
    citizenName: 'Babulal Murmu',
    citizenPhone: '+91 97712 33410',
    peopleAffected: 3200,
    urgency: 'CRITICAL',
    additionalInfo: 'Last year two bullock carts were washed away. Cell connectivity exists near the hill summit.',
    media: [],
    status: 'UNIVERSITY_MATCHED',
    aiAnalysis: {
      detected_language: 'English',
      problem_summary: 'Rapid flash flooding of river tributary cutting off 3 villages and school without early warning.',
      domain: 'Home, Jail & Disaster Management',
      sub_domain: 'Disaster Management',
      priority: 'CRITICAL',
      confidence: 97,
      required_expertise: ['Hydrology', 'IoT Ultrasonic Sensor Telemetry', 'Data Science', 'Civil Engineering'],
      possible_departments: ['Home, Jail & Disaster Management', 'Water Resources'],
      possible_universities: ['IIT (ISM) Dhanbad', 'BIT Mesra'],
      duplicate_candidates: [],
      innovation_assessment: 'INNOVATION_GAP',
      reasoning_summary: 'Upstream ultrasonic water-level radar with solar transmitter and solar siren alarm downriver. Low cost, off-grid solution required.',
      existing_schemes: ['State Disaster Management Authority (SDMA) Flood Warning'],
      analyzed_at: '2026-08-10T14:12:00Z',
      model_used: 'gemini-3.8-flash'
    },
    assignedDepartmentId: 'dept-11',
    assignedDepartmentName: 'Home, Jail & Disaster Management',
    officerRemarks: 'High priority. Matched with IIT ISM Dhanbad Hydrogeology and TexMin IoT labs.',
    createdAt: '2026-08-10T14:10:00Z',
    updatedAt: '2026-08-18T09:30:00Z'
  },
  {
    id: 'SETU-JH-2026-00033',
    title: 'Groundwater depletion causing severe paddy crop failure across drought-prone upland blocks',
    description: 'In Palamu drought-prone zone, open wells have dropped below 120 ft. Traditional canal water does not reach upland smallholder farmers, resulting in 65% loss of monsoon paddy and forced migration.',
    category: 'Agriculture & Irrigation',
    location: {
      state: 'Jharkhand',
      district: 'Palamu',
      block: 'Chainpur',
      villageOrCity: 'Bishrampur Road',
      pincode: '822110',
      coordinates: { lat: 24.0385, lng: 84.0722 }
    },
    citizenId: 'usr-citizen-01',
    citizenName: 'Devendra Kumar Yadav',
    peopleAffected: 4500,
    urgency: 'HIGH',
    media: [],
    status: 'PENDING_GOVT_VALIDATION',
    aiAnalysis: {
      detected_language: 'English',
      problem_summary: 'Severe water table depletion and lack of upland irrigation leading to paddy crop failure and distress migration in Palamu.',
      domain: 'Agriculture, Animal Husbandry & Co-operative',
      sub_domain: 'Irrigation & Agriculture',
      priority: 'HIGH',
      confidence: 91,
      required_expertise: ['Agricultural Engineering', 'Precision Drip Irrigation', 'Soil Moisture Sensors', 'Agronomy'],
      possible_departments: ['Agriculture, Animal Husbandry & Co-operative', 'Water Resources'],
      possible_universities: ['Birsa Agricultural University (BAU) Kanke', 'BIT Mesra'],
      duplicate_candidates: [],
      innovation_assessment: 'INNOVATION_GAP',
      reasoning_summary: 'Traditional flood irrigation exhausts the scarce aquifer. Sub-surface micro-drip combined with indigenous millet intercropping and low-cost soil moisture tensiometers needed.',
      existing_schemes: ['PM Krishi Sinchayee Yojana (PMKSY)', 'Jharkhand Micro Irrigation Scheme'],
      analyzed_at: '2026-09-01T15:20:00Z',
      model_used: 'gemini-3.8-flash'
    },
    assignedDepartmentId: 'dept-01',
    assignedDepartmentName: 'Agriculture, Animal Husbandry & Co-operative',
    createdAt: '2026-09-01T15:18:00Z',
    updatedAt: '2026-09-01T15:20:00Z'
  },
  {
    id: 'SETU-JH-2026-00021',
    title: 'Unsegregated vegetable and organic market waste rotting near residential bus terminus',
    description: 'Daily 12 tons of organic produce and packaging waste from Madhupur daily market accumulates on the open roadside, creating toxic leachates and stray animal hazards.',
    category: 'Urban Waste & Sanitation',
    location: {
      state: 'Jharkhand',
      district: 'Deoghar',
      block: 'Madhupur',
      villageOrCity: 'Madhupur Bazaar',
      pincode: '815353',
      coordinates: { lat: 24.2612, lng: 86.6433 }
    },
    citizenId: 'usr-citizen-01',
    citizenName: 'Sanjay Rawani',
    peopleAffected: 8000,
    urgency: 'MEDIUM',
    media: [],
    status: 'GOVT_VALIDATED',
    aiAnalysis: {
      detected_language: 'English',
      problem_summary: '12 tons/day unsegregated organic waste dumping causing leachate pollution and health hazards in market zone.',
      domain: 'Urban Development & Housing',
      sub_domain: 'Municipal Services',
      priority: 'MEDIUM',
      confidence: 92,
      required_expertise: ['Environmental Engineering', 'Biochemical Conversion', 'Solid Waste Management', 'Mechanical Sorting'],
      possible_departments: ['Urban Development & Housing'],
      possible_universities: ['BIT Mesra', 'NIT Jamshedpur'],
      duplicate_candidates: [],
      innovation_assessment: 'IMPLEMENTATION_GAP',
      reasoning_summary: 'Municipal solid waste guidelines exist, but lack of decentralized rapid composting unit or bio-methanation digester causes transport failure.',
      existing_schemes: ['Swachh Bharat Urban 2.0 Solid Waste Management'],
      analyzed_at: '2026-08-20T10:00:00Z',
      model_used: 'gemini-3.8-flash'
    },
    assignedDepartmentId: 'dept-25',
    assignedDepartmentName: 'Urban Development & Housing',
    createdAt: '2026-08-20T09:55:00Z',
    updatedAt: '2026-08-22T14:10:00Z'
  }
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-00142',
    challengeId: 'SETU-JH-2026-00142',
    challengeTitle: 'No reliable drinking water in village and women walking 3 km daily',
    universityId: 'uni-01',
    universityName: 'Birla Institute of Technology (BIT) Mesra [DEMO DATA]',
    title: 'Jal-Setu: Solar-Powered IoT Water Purification & Hydro-Telemetry Network',
    abstract: 'A decentralized, solar-powered multi-stage filtration unit with low-power LoRaWAN telemetry that monitors borehole drawdown, filter membrane pressure, and daily dispensed volume for rural habitations.',
    facultyMentorName: 'Dr. Ananya Roy',
    facultyMentorEmail: 'ananya.roy@bitmesra.ac.in',
    currentStage: 'PILOT_DEPLOYMENT',
    members: [
      {
        id: 'pm-01',
        userId: 'usr-student-01',
        name: 'Pooja Kumari',
        role: 'LEAD_STUDENT',
        department: 'Computer Science & Engineering',
        skills: ['IoT Firmware', 'React Telemetry Dashboard', 'LoRaWAN Packet Decoding'],
        joinedAt: '2026-08-08T10:00:00Z'
      },
      {
        id: 'pm-02',
        userId: 'usr-student-02',
        name: 'Amit Hansda',
        role: 'STUDENT_COLLABORATOR',
        department: 'Civil & Environmental Engineering',
        skills: ['Water Quality Testing', 'Sediment Filter Sizing', 'Pipe Network CAD'],
        joinedAt: '2026-08-08T10:15:00Z'
      },
      {
        id: 'pm-03',
        userId: 'usr-student-03',
        name: 'Rahul Soren',
        role: 'STUDENT_COLLABORATOR',
        department: 'Electronics & Communication',
        skills: ['Solar MPPT Controller', 'Ultrasonic Depth Transducer'],
        joinedAt: '2026-08-09T11:00:00Z'
      },
      {
        id: 'pm-04',
        userId: 'usr-faculty-01',
        name: 'Dr. Ananya Roy',
        role: 'FACULTY_MENTOR',
        department: 'Civil & Environmental Engineering',
        skills: ['Hydraulic Design', 'Research Protocol', 'Govt Liaison'],
        joinedAt: '2026-08-05T09:00:00Z'
      }
    ],
    milestones: [
      {
        id: 'ms-01',
        projectId: 'proj-00142',
        stage: 'TEAM_FORMATION',
        title: 'Multidisciplinary Student Team & Faculty Mentor Assignment',
        description: 'Formed cross-discipline team of CS, Civil, and Electronics students under Dr. Ananya Roy guidance.',
        ownerName: 'Pooja Kumari',
        dueDate: '2026-08-10',
        completedDate: '2026-08-09',
        status: 'APPROVED',
        documents: [{ name: 'team_charter.pdf', url: '#', uploadedAt: '2026-08-09T18:00:00Z' }],
        comments: 'Approved by Dean R&D BIT Mesra.',
        evidence: 'Team formed with 3 disciplines (CS, Civil, ECE)'
      },
      {
        id: 'ms-02',
        projectId: 'proj-00142',
        stage: 'PROPOSAL',
        title: 'Technical Specification & Pilot Architecture Proposal',
        description: 'Submitted 12-page technical proposal specifying 500 LPH multi-stage cartridge + UV purification with solar array and LoRaWAN hydro-sensor.',
        ownerName: 'Dr. Ananya Roy',
        dueDate: '2026-08-16',
        completedDate: '2026-08-15',
        status: 'APPROVED',
        documents: [{ name: 'jal_setu_proposal_v1.pdf', url: '#', uploadedAt: '2026-08-15T12:00:00Z' }],
        comments: 'Validated by Drinking Water & Sanitation Dept technical committee.',
        evidence: 'Engineering schematics and bill of materials verified'
      },
      {
        id: 'ms-03',
        projectId: 'proj-00142',
        stage: 'PROTOTYPE_BUILD',
        title: 'Fabrication of Working Bench Prototype & Sensor Rig',
        description: 'Completed fabrication of skid-mounted 500 LPH filtration unit and calibrated ESP32-based turbidity and water-level telemetry sensors.',
        ownerName: 'Amit Hansda',
        dueDate: '2026-08-25',
        completedDate: '2026-08-24',
        status: 'APPROVED',
        documents: [{ name: 'prototype_lab_bench_report.pdf', url: '#', uploadedAt: '2026-08-24T17:00:00Z' }],
        comments: 'Lab bench tests showed 99.4% pathogen reduction and reliable wireless transmission.',
        evidence: 'Lab test results verified in Environmental Engineering lab'
      },
      {
        id: 'ms-04',
        projectId: 'proj-00142',
        stage: 'LAB_TESTING',
        title: 'Water Quality Testing & Stress Simulation',
        description: 'Conducted 72-hour continuous stress test under simulated high iron and turbid water conditions.',
        ownerName: 'Dr. Ananya Roy',
        dueDate: '2026-08-30',
        completedDate: '2026-08-29',
        status: 'APPROVED',
        documents: [{ name: 'water_testing_certificate_bis10500.pdf', url: '#', uploadedAt: '2026-08-29T16:00:00Z' }],
        comments: 'Water output conforms fully to BIS 10500:2012 drinking standards.',
        evidence: 'BIS 10500 chemical and microbiological test clearance'
      },
      {
        id: 'ms-05',
        projectId: 'proj-00142',
        stage: 'PILOT_DEPLOYMENT',
        title: 'Field Installation & Commissioning in Dorma Panchayat, Khunti',
        description: 'Installed the solar-powered community kiosk at Dorma Gram Panchayat. Connected pipeline to existing deep borewell and activated solar pump.',
        ownerName: 'Pooja Kumari',
        dueDate: '2026-09-08',
        completedDate: '2026-09-06',
        status: 'APPROVED',
        documents: [{ name: 'field_commissioning_signoff_panchayat.pdf', url: '#', uploadedAt: '2026-09-06T14:00:00Z' }],
        comments: 'Jointly signed by Mukhiya, Block Development Officer, and Student Lead.',
        evidence: 'Pilot running in Dorma village; 350 households drawing potable water'
      },
      {
        id: 'ms-06',
        projectId: 'proj-00142',
        stage: 'IMPACT_VERIFICATION',
        title: 'Measurable Social Impact Audit & Verification',
        description: 'Government Officer and Village Water Committee audit verifying daily water volume, household coverage, and health impact metrics.',
        ownerName: 'Dr. Alok Kumar Verma, IAS',
        dueDate: '2026-09-15',
        status: 'IN_PROGRESS',
        documents: [],
        comments: 'Survey underway by Village Health Sanitation & Nutrition Committee (VHSNC).'
      }
    ],
    collaborations: [
      {
        id: 'collab-01',
        projectId: 'proj-00142',
        partnerName: 'Tata Steel Innovation Centre [DEMO DATA]',
        partnerType: 'INDUSTRY',
        supportTypes: ['MENTORSHIP', 'TESTING_FACILITY', 'EQUIPMENT'],
        committedAmount: 250000,
        contactPerson: 'Vikas Agarwal',
        contactEmail: 'vikas.agarwal@tatasteel.com.demo',
        status: 'ACTIVE',
        offeredAt: '2026-08-12T11:00:00Z',
        notes: 'Provided stainless steel filter enclosures and donated high-efficiency solar MPPT inverters.'
      },
      {
        id: 'collab-02',
        projectId: 'proj-00142',
        partnerName: 'Jharkhand Sustainable Futures CSR Foundation [DEMO DATA]',
        partnerType: 'CSR_FOUNDATION',
        supportTypes: ['FUNDING', 'PILOT_SITE'],
        committedAmount: 380000,
        contactPerson: 'Meera Sengupta',
        contactEmail: 'meera.s@csr-jharkhandfoundation.org.demo',
        status: 'ACTIVE',
        offeredAt: '2026-08-14T15:30:00Z',
        notes: 'CSR grant covering solar panels, submersible pump, and local community operator training.'
      }
    ],
    impactMetric: {
      id: 'imp-00142',
      projectId: 'proj-00142',
      challengeId: 'SETU-JH-2026-00142',
      peopleImpacted: 1750,
      householdsBenefited: 350,
      villagesBenefited: 1,
      waterSavedLitresPerDay: 4800,
      costSavedInr: 45000,
      timeSavedHoursPerDay: 525, // 350 households saving 1.5 hrs daily
      beforeSnapshot: '350 households walking 3 km daily to collect contaminated muddy pit water; frequent gastrointestinal infections.',
      afterSnapshot: '350 households receiving 4,800 L/day of pure UV-treated potable water directly inside the village square; walking distance reduced from 3 km to under 150 meters.',
      verifiedByOfficer: true,
      verifiedAt: '2026-09-10T12:00:00Z',
      recordedAt: '2026-09-08T10:00:00Z'
    },
    createdAt: '2026-08-04T12:00:00Z',
    updatedAt: '2026-09-10T14:20:00Z'
  }
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    targetRole: 'CITIZEN',
    title: 'Pilot Solution Deployed in Your Village',
    message: 'Challenge SETU-JH-2026-00142 has resulted in a working solar water filtration pilot at Dorma Panchayat!',
    category: 'IMPACT',
    relatedId: 'SETU-JH-2026-00142',
    read: false,
    createdAt: '2026-09-10T14:25:00Z'
  },
  {
    id: 'notif-02',
    targetRole: 'GOVERNMENT_OFFICER',
    title: 'New High Priority Challenge Pending Validation',
    message: 'SETU-JH-2026-00054 (Sahibganj flash flood hazard) requires official department validation.',
    category: 'VALIDATION',
    relatedId: 'SETU-JH-2026-00054',
    read: false,
    createdAt: '2026-09-12T09:15:00Z'
  },
  {
    id: 'notif-03',
    targetRole: 'UNIVERSITY_ADMIN',
    title: 'New Challenge Matched to Your Institution',
    message: 'BIT Mesra has received a 96% capability match for rural water telemetry in Khunti district.',
    category: 'CHALLENGE',
    relatedId: 'SETU-JH-2026-00142',
    read: true,
    createdAt: '2026-08-02T10:00:00Z'
  },
  {
    id: 'notif-04',
    targetRole: 'STUDENT',
    title: 'Milestone Approved by Faculty Mentor',
    message: 'Dr. Ananya Roy approved Milestone: Field Installation & Commissioning in Dorma Panchayat.',
    category: 'MILESTONE',
    relatedId: 'proj-00142',
    read: true,
    createdAt: '2026-09-07T11:20:00Z'
  },
  {
    id: 'notif-05',
    targetRole: 'INDUSTRY_PARTNER',
    title: 'Pilot Milestone Reached for Jal-Setu',
    message: 'University team completed community field pilot installation supported by Tata Steel equipment grant.',
    category: 'PROJECT',
    relatedId: 'proj-00142',
    read: false,
    createdAt: '2026-09-08T16:00:00Z'
  }
];

export const DEMO_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-01',
    timestamp: '2026-08-01T09:05:00Z',
    actorName: 'Rameshwar Munda',
    actorRole: 'CITIZEN',
    action: 'SUBMIT_CHALLENGE',
    entityType: 'CHALLENGE',
    entityId: 'SETU-JH-2026-00142',
    details: 'Citizen submitted drinking water challenge in Khunti district.'
  },
  {
    id: 'aud-02',
    timestamp: '2026-08-01T09:06:12Z',
    actorName: 'SETU AI Core (gemini-3.8-flash)',
    actorRole: 'PLATFORM_ADMIN',
    action: 'AI_ANALYSIS_COMPLETED',
    entityType: 'CHALLENGE',
    entityId: 'SETU-JH-2026-00142',
    details: 'AI classified Domain: Drinking Water & Sanitation (Confidence 96%). Innovation Gate recommendation: INNOVATION GAP.'
  },
  {
    id: 'aud-03',
    timestamp: '2026-08-02T11:30:00Z',
    actorName: 'Dr. Alok Kumar Verma, IAS',
    actorRole: 'GOVERNMENT_OFFICER',
    action: 'GOVT_VALIDATE_AND_ROUTE',
    entityType: 'CHALLENGE',
    entityId: 'SETU-JH-2026-00142',
    details: 'Officer approved AI classification and routed to Department of Drinking Water and Sanitation (dept-04) and matched universities.'
  },
  {
    id: 'aud-04',
    timestamp: '2026-08-04T12:00:00Z',
    actorName: 'Prof. S. N. Sinha',
    actorRole: 'UNIVERSITY_ADMIN',
    action: 'UNIVERSITY_ACCEPT_CHALLENGE',
    entityType: 'PROJECT',
    entityId: 'proj-00142',
    details: 'BIT Mesra accepted challenge and assigned Dr. Ananya Roy as Faculty Mentor.'
  },
  {
    id: 'aud-05',
    timestamp: '2026-08-12T11:00:00Z',
    actorName: 'Vikas Agarwal',
    actorRole: 'INDUSTRY_PARTNER',
    action: 'INDUSTRY_COLLABORATION_OFFERED',
    entityType: 'PROJECT',
    entityId: 'proj-00142',
    details: 'Tata Steel Innovation Centre offered mentorship and Rs. 2,50,000 worth of filtration equipment.'
  },
  {
    id: 'aud-06',
    timestamp: '2026-09-10T12:00:00Z',
    actorName: 'Dr. Alok Kumar Verma, IAS',
    actorRole: 'GOVERNMENT_OFFICER',
    action: 'VERIFY_SOCIAL_IMPACT',
    entityType: 'CHALLENGE',
    entityId: 'SETU-JH-2026-00142',
    details: 'Officer verified social impact: 1,750 villagers benefited, 350 households covered, 525 hours saved daily.'
  }
];
