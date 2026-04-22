import { db } from '../index';
import { apps } from '../schema';
import { sql } from 'drizzle-orm';

const initialApps = [
  {
    name: 'Circuit Simulator Pro',
    description: 'Advanced circuit simulation with real-time analysis and comprehensive component library',
    rating: 4.8,
    reviews: 2340,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'NEC Code Reference',
    description: 'Complete National Electrical Code database with search and bookmarks',
    rating: 4.9,
    reviews: 5678,
    category: 'Reference',
    isPro: false,
    purpose: 'Code Reference',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Load Calculator',
    description: 'Calculate electrical loads for residential & commercial installations',
    rating: 4.7,
    reviews: 1890,
    category: 'Calculator',
    isPro: false,
    purpose: 'Calculations',
    necVersion: '2020',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Power Quality Analyzer',
    description: 'Monitor and analyze power quality issues in real-time',
    rating: 4.6,
    reviews: 982,
    category: 'Analysis',
    isPro: true,
    purpose: 'Analysis & Testing',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Wire Size Calculator',
    description: 'Determine proper wire gauge based on ampacity and voltage drop',
    rating: 4.8,
    reviews: 3421,
    category: 'Calculator',
    isPro: false,
    purpose: 'Calculations',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Panel Schedule Builder',
    description: 'Create professional electrical panel schedules quickly',
    rating: 4.7,
    reviews: 1567,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2020',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Fault Current Calculator',
    description: 'Calculate short circuit and fault currents for system protection',
    rating: 4.9,
    reviews: 2103,
    category: 'Calculator',
    isPro: false,
    purpose: 'Calculations',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Motor Control Designer',
    description: 'Design motor control circuits with protection and control logic',
    rating: 4.5,
    reviews: 876,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2020',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Lighting Design Tool',
    description: 'Plan and calculate lighting layouts for optimal illumination',
    rating: 4.6,
    reviews: 1234,
    category: 'Design',
    isPro: false,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Pro Diagram Editor',
    description: 'AI-powered circuit diagramming with Mermaid, export to PNG/SVG/PDF, and 1000+ electrical symbols',
    rating: 4.9,
    reviews: 4210,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    href: '/tools/diagram-editor',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Magic CAD',
    description: 'Next-gen AI 3D modeling and CAD tools powered by NVIDIA NIM and OpenSCAD.',
    rating: 5.0,
    reviews: 1337,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=300&fit=crop',
    href: '/magic-cad',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

async function seed() {
  console.log('Seeding apps...');
  try {
    // Clear existing data (optional, depends on if we want this script to be idempotent)
    await db.delete(apps);
    
    // Insert all apps
    for (const app of initialApps) {
      await db.insert(apps).values(app);
    }
    console.log('Successfully seeded apps!');
  } catch (error) {
    console.error('Error seeding apps:', error);
  }
}

seed();
