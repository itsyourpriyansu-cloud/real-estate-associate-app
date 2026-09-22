import { z } from 'zod';

import { idSchema, inrAmountSchema } from './common';

/** Drives Home's completed / ongoing counts and the "status" line on Our Projects. */
export const projectStatusSchema = z.enum(['ONGOING', 'COMPLETED', 'UPCOMING']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    developerName: z.string().min(1),
    location: z.string().min(1),
    city: z.string().min(1),
    status: projectStatusSchema,
    /**
     * Image reference. A remote URL from a future API, or a `placeholder://…` key resolved to a
     * bundled monochrome asset by the image resolver (Stage 5). Never a `require()` result, so the
     * field stays serialisable and API-shaped.
     */
    heroImageUrl: z.string().min(1),
    thumbnailUrl: z.string().min(1),
    /** Photo gallery for the project (Stage 9). Same reference rules as `heroImageUrl`. */
    galleryImages: z.array(z.string().min(1)).min(1),
    startingPrice: inrAmountSchema,
    maxPrice: inrAmountSchema.optional(),
    minPlotAreaSqYd: z.number().positive(),
    maxPlotAreaSqYd: z.number().positive(),
    availableUnits: z.number().int().nonnegative(),
    totalUnits: z.number().int().nonnegative(),
    /** Demo registration label. Never a real RERA number. */
    reraNumber: z.string().min(1).optional(),
    possessionLabel: z.string().min(1).optional(),
    description: z.string().min(1),
    amenities: z.array(z.string().min(1)),
    highlights: z.array(z.string().min(1)),
  })
  .refine((p) => p.availableUnits <= p.totalUnits, {
    message: 'availableUnits cannot exceed totalUnits',
    path: ['availableUnits'],
  })
  .refine((p) => p.minPlotAreaSqYd <= p.maxPlotAreaSqYd, {
    message: 'minPlotAreaSqYd cannot exceed maxPlotAreaSqYd',
    path: ['minPlotAreaSqYd'],
  });
export type Project = z.infer<typeof projectSchema>;
