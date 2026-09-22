import type { Admin } from '@/domain';
import { DEFAULT_COUNTRY_CODE, PROTOTYPE_ADMIN_PHONE } from '@/constants/prototype';

import { ADMIN_ID } from './ids';

/** The prototype's single demo admin. */
export function buildAdmin(): Admin {
  return {
    id: ADMIN_ID,
    fullName: 'Priya Narasimhan',
    phone: `${DEFAULT_COUNTRY_CODE}${PROTOTYPE_ADMIN_PHONE}`,
    email: 'priya.narasimhan@example.com',
  };
}
