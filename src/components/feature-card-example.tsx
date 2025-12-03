'use client';

import React from 'react';
import { SectionFeatures, FeatureCardProps } from '@/components/feature-card';
import { Code, CircuitBoard, Wrench, Headphones, Globe } from 'lucide-react';

/**
 * Example Usage: Advanced AI Features Section
 * 
 * This demonstrates how to use the SectionFeatures wrapper
 * with FeatureCard components for the "Advanced AI Features" section.
 */

// Example data array for Advanced AI Features
const advancedAIFeatures: FeatureCardProps[] = [
  {
    icon: Code,
    featureTitle: 'AI Code Assistant',
    tag: 'Pro',
    shortDescription: 'Intelligent code generation for PLC ladder logic, Arduino C++, ESP32 firmware, and industrial automation controllers. Describe your control logic in plain English and get production-ready, commented code with best practices and error handling included.',
    ctaLabel: 'Try AI Code Assistant',
    ctaLink: '/tools/ai-features#code-assistant',
  },
  {
    icon: CircuitBoard,
    featureTitle: 'AI Circuit Designer',
    tag: 'Pro',
    shortDescription: 'Revolutionary circuit design assistant that converts functional requirements into complete schematic suggestions. Input specifications like voltage, current, frequency requirements and receive optimized circuit topologies with component recommendations and design rationale.',
    ctaLabel: 'Design with AI',
    ctaLink: '/tools/ai-features#circuit-designer',
  },
  {
    icon: Wrench,
    featureTitle: 'AI Troubleshooting',
    tag: 'Pro',
    shortDescription: 'Advanced diagnostic AI that analyzes photos of electrical problems, error codes, meter readings, and equipment failures. Provides step-by-step troubleshooting procedures, likely root causes ranked by probability, and safety precautions for field technicians.',
    ctaLabel: 'Start Troubleshooting',
    ctaLink: '/tools/ai-features#troubleshooting',
  },
  {
    icon: Headphones,
    featureTitle: 'Voice Input',
    tag: 'Free',
    shortDescription: 'Hands-free operation for field work with natural voice commands for calculations, code lookups, and tool access. Perfect for electricians wearing gloves or working in confined spaces. Supports complex queries like "Calculate voltage drop for 12 AWG copper wire, 150 feet, 20 amps".',
    ctaLabel: 'Enable Voice Control',
    ctaLink: '/tools/ai-features#voice-input',
  },
  {
    icon: Globe,
    featureTitle: 'Multi-language Support',
    tag: 'Free',
    shortDescription: 'Full platform translation for Spanish, Mandarin Chinese, and Hindi-speaking electrical professionals. Includes technical terminology, NEC code translations, calculation results, and interface localization to serve the global electrical engineering community.',
    ctaLabel: 'Change Language',
    ctaLink: '/tools/ai-features#multi-language',
  },
];

/**
 * Example Component: AdvancedAIFeaturesSection
 * 
 * Drop this component anywhere in your app to render the
 * Advanced AI Features section with all 5 feature cards.
 */
export default function AdvancedAIFeaturesSection() {
  return (
    <SectionFeatures
      sectionTitle="✨ Advanced AI Features"
      sectionSubtitle="Leverage artificial intelligence for code assistance, design, and troubleshooting"
      features={advancedAIFeatures}
    />
  );
}

/**
 * Alternative Example: Custom Feature Array
 * 
 * You can create any feature section by simply changing the data.
 * Here's another example for calculators:
 */

export const CalculatorFeaturesExample: FeatureCardProps[] = [
  {
    icon: Code,
    featureTitle: 'Ohm\'s Law Calculator',
    tag: 'Free',
    shortDescription: 'Calculate voltage, current, resistance, and power using Ohm\'s Law. Perfect for quick circuit analysis and component selection.',
    ctaLabel: 'Calculate Now',
    ctaLink: '/calculators#ohms-law',
  },
  {
    icon: CircuitBoard,
    featureTitle: 'Voltage Drop Calculator',
    tag: 'Free',
    shortDescription: 'Determine voltage drop across conductors based on wire gauge, length, current, and material. Ensure NEC compliance for your installations.',
    ctaLabel: 'Check Voltage Drop',
    ctaLink: '/calculators#voltage-drop',
  },
  {
    icon: Wrench,
    featureTitle: 'Power Factor Correction',
    tag: 'Pro',
    shortDescription: 'Calculate capacitor requirements for power factor correction in industrial and commercial applications. Reduce utility penalties and improve efficiency.',
    ctaLabel: 'Optimize Power Factor',
    ctaLink: '/calculators#power-factor',
  },
];

/**
 * Usage in a page:
 * 
 * import AdvancedAIFeaturesSection from '@/components/feature-card-example';
 * 
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <AdvancedAIFeaturesSection />
 *     </div>
 *   );
 * }
 * 
 * Or use the SectionFeatures component directly:
 * 
 * import { SectionFeatures } from '@/components/feature-card';
 * import { CalculatorFeaturesExample } from '@/components/feature-card-example';
 * 
 * export default function CalculatorsPage() {
 *   return (
 *     <SectionFeatures
 *       sectionTitle="Essential Calculators"
 *       sectionSubtitle="Quick and accurate electrical calculations"
 *       features={CalculatorFeaturesExample}
 *     />
 *   );
 * }
 */
