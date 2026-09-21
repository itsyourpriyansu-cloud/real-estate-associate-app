import type { Plot, Project, ProjectStatus } from '@/domain';

import { PROJECT_ID, type ProjectKey } from './ids';

/**
 * Fictional but realistic demo projects (spec §12). Names, developers and RERA labels are invented
 * for the prototype and must never be presented as real regulated offerings.
 */
export interface ProjectBlueprint {
  key: ProjectKey;
  id: string;
  name: string;
  developerName: string;
  location: string;
  city: string;
  status: ProjectStatus;
  reraNumber: string;
  possessionLabel: string;
  description: string;
  amenities: string[];
  highlights: string[];
  // --- plot generation parameters (deterministic; no randomness) ---
  plotCount: number;
  areaOptionsSqYd: number[];
  /** Base rate per sq yd for Block A / Block B. */
  ratePerSqYd: { A: number; B: number };
  /** Plots 1..phaseOneCount are Phase 1; the rest are Phase 2. */
  phaseOneCount: number;
  /** Plots 1..blockACount are Block A; the rest are Block B. */
  blockACount: number;
  /** Rotates the facing / size cycles so the four layouts do not look identical. */
  variation: number;
}

export const PROJECT_BLUEPRINTS: readonly ProjectBlueprint[] = [
  {
    key: 'rr',
    id: PROJECT_ID.rr,
    name: 'Real Rise',
    developerName: 'Meridian Landmarks',
    location: 'Bangalore Highway',
    city: 'Hyderabad',
    status: 'COMPLETED',
    reraNumber: 'DEMO-RERA-RR-0001',
    possessionLabel: 'Ready for registration',
    description:
      'A gated open-plot layout on the Bangalore Highway corridor with wide internal roads and a mix of east and north facing plots. Prototype description for demonstration only.',
    amenities: [
      '40 ft and 30 ft internal roads',
      'Avenue plantation',
      'Underground drainage',
      'Street lighting',
      'Entrance arch with compound wall',
      'Community park',
      'Water supply provision',
    ],
    highlights: [
      'East and north facing plots available',
      'Two-phase layout with corner plots',
      'Close to the highway junction',
    ],
    plotCount: 36,
    areaOptionsSqYd: [150, 167, 180, 200, 220, 240, 267, 300, 333, 360],
    ratePerSqYd: { A: 17_500, B: 18_000 },
    phaseOneCount: 20,
    blockACount: 18,
    variation: 3,
  },
  {
    key: 'ag',
    id: PROJECT_ID.ag,
    name: 'Aurelia Greens',
    developerName: 'Aurelia Estates',
    location: 'Airport Corridor',
    city: 'Hyderabad',
    status: 'ONGOING',
    reraNumber: 'DEMO-RERA-AG-0002',
    possessionLabel: 'Dec 2027',
    description:
      'A premium villa-plot community in the Airport Corridor with generous plot sizes, landscaped avenues and a clubhouse. Prototype description for demonstration only.',
    amenities: [
      'Clubhouse',
      'Landscaped avenues',
      'Jogging track',
      'Children’s play area',
      '24×7 gated security',
      'Rainwater harvesting',
      'Solar street lighting',
    ],
    highlights: [
      'Larger 300–500 sq yd plots',
      'Single-phase gated community',
      'Airport corridor access',
    ],
    plotCount: 30,
    areaOptionsSqYd: [200, 240, 267, 300, 333, 400, 450, 500],
    ratePerSqYd: { A: 26_000, B: 27_500 },
    phaseOneCount: 30,
    blockACount: 15,
    variation: 5,
  },
  {
    key: 'nc',
    id: PROJECT_ID.nc,
    name: 'Northgate County',
    developerName: 'Northgate Realty',
    location: 'Hyderabad Highway',
    city: 'Hyderabad',
    status: 'COMPLETED',
    reraNumber: 'DEMO-RERA-NC-0003',
    possessionLabel: 'Ready for registration',
    description:
      'An affordable open-plot layout along the Hyderabad Highway with compact, easy-to-finance plot sizes. Prototype description for demonstration only.',
    amenities: [
      '30 ft internal roads',
      'Street lighting',
      'Underground drainage',
      'Entrance arch',
      'Avenue plantation',
      'Overhead water tank',
    ],
    highlights: [
      'Entry-level pricing',
      'Compact plots of 167–400 sq yd',
      'Suited to first-time buyers',
    ],
    plotCount: 30,
    areaOptionsSqYd: [167, 180, 200, 222, 250, 267, 300, 333, 400],
    ratePerSqYd: { A: 11_000, B: 12_500 },
    phaseOneCount: 18,
    blockACount: 15,
    variation: 7,
  },
  {
    key: 'ce',
    id: PROJECT_ID.ce,
    name: 'Cedar Enclave',
    developerName: 'Cedar Habitat Developers',
    location: 'Outer Ring Growth Zone',
    city: 'Hyderabad',
    status: 'ONGOING',
    reraNumber: 'DEMO-RERA-CE-0004',
    possessionLabel: 'Jun 2027',
    description:
      'A mid-premium plotted development in the Outer Ring growth zone, balanced between price and appreciation potential. Prototype description for demonstration only.',
    amenities: [
      'Landscaped entrance',
      '40 ft main road',
      'Community park',
      'Underground utilities',
      'Street lighting',
      'CCTV at entry and exit',
    ],
    highlights: [
      'Growth-zone location',
      'Investor-friendly sizes',
      'Corner plots on the main road',
    ],
    plotCount: 24,
    areaOptionsSqYd: [200, 222, 240, 267, 300, 333, 360],
    ratePerSqYd: { A: 19_000, B: 21_000 },
    phaseOneCount: 24,
    blockACount: 12,
    variation: 2,
  },
];

/**
 * Projects are derived from plots so unit counts and price/size ranges can never disagree with the
 * inventory. `heroImageUrl` / `thumbnailUrl` use the `placeholder://` scheme (see domain/project.ts).
 */
export function buildProjects(plots: readonly Plot[]): Project[] {
  return PROJECT_BLUEPRINTS.map((bp) => {
    const own = plots.filter((p) => p.projectId === bp.id);
    const totals = own.map((p) => p.estimatedTotal);
    const areas = own.map((p) => p.areaSqYd);
    return {
      id: bp.id,
      name: bp.name,
      developerName: bp.developerName,
      location: bp.location,
      city: bp.city,
      status: bp.status,
      heroImageUrl: `placeholder://projects/${bp.key}/hero`,
      thumbnailUrl: `placeholder://projects/${bp.key}/thumb`,
      startingPrice: Math.min(...totals),
      maxPrice: Math.max(...totals),
      minPlotAreaSqYd: Math.min(...areas),
      maxPlotAreaSqYd: Math.max(...areas),
      availableUnits: own.filter((p) => p.status === 'AVAILABLE').length,
      totalUnits: own.length,
      reraNumber: bp.reraNumber,
      possessionLabel: bp.possessionLabel,
      description: bp.description,
      amenities: bp.amenities,
      highlights: bp.highlights,
    };
  });
}
