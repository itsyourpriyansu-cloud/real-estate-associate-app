import { z } from 'zod';

/** Opaque entity id. Seed ids are readable strings; a real API may return UUIDs — both validate. */
export const idSchema = z.string().min(1);

/** ISO-8601 timestamp. Offsets are accepted so an API returning `+05:30` also validates. */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** E.164 phone number, e.g. +919876543210. The UI formats; the domain stores canonical form. */
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be E.164 (+919876543210)');

/** Whole-rupee INR amount. Formatting (₹40L, ₹1.2Cr) is a presentation concern. */
export const inrAmountSchema = z.number().int().nonnegative();
