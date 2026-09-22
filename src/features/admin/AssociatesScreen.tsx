import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  ChipRow,
  DetailHeader,
  EmptyState,
  FilterChip,
  LoadingState,
  NavPanel,
  NavRow,
  ResourceBoundary,
  ScreenLayout,
  icons,
} from '@/components';
import type { User } from '@/domain';
import { SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';

import { useAdminDashboard } from './useAdminDashboard';

type Filter = 'ALL' | 'SENIOR' | 'ASSOCIATE';

const isSenior = (u: User) => u.designation === SENIOR_ASSOCIATE_DESIGNATION;

/** Every associate, filterable by seniority. Tap one to promote them or set their incentive. */
export function AssociatesScreen() {
  const router = useRouter();
  const resource = useAdminDashboard();
  const [filter, setFilter] = useState<Filter>('ALL');

  const visible = (associates: User[]) =>
    filter === 'ALL' ? associates : associates.filter((a) => isSenior(a) === (filter === 'SENIOR'));

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      header={<DetailHeader title="Senior Associates" onBack={() => router.back()} />}
    >
      <ResourceBoundary
        resource={resource}
        subject="your associates"
        loading={<LoadingState variant="rows" count={5} />}
        isEmpty={(data) => data.associates.length === 0}
        empty={
          <EmptyState
            icon={icons.admin}
            title="No associates yet"
            description="Associates created from the app will appear here."
          />
        }
      >
        {({ associates }) => (
          <>
            <ChipRow>
              <FilterChip
                label="All"
                count={associates.length}
                selected={filter === 'ALL'}
                onPress={() => setFilter('ALL')}
              />
              <FilterChip
                label="Senior"
                count={associates.filter(isSenior).length}
                selected={filter === 'SENIOR'}
                onPress={() => setFilter('SENIOR')}
              />
              <FilterChip
                label="Associate"
                count={associates.filter((a) => !isSenior(a)).length}
                selected={filter === 'ASSOCIATE'}
                onPress={() => setFilter('ASSOCIATE')}
              />
            </ChipRow>

            <NavPanel>
              {visible(associates).map((associate) => (
                <NavRow
                  key={associate.id}
                  icon={isSenior(associate) ? icons.admin : icons.associate}
                  title={associate.fullName}
                  subtitle={`${associate.designation} · ${associate.associateCode}`}
                  onPress={() =>
                    router.push({
                      pathname: '/associates/[associateId]',
                      params: { associateId: associate.id },
                    })
                  }
                />
              ))}
            </NavPanel>
          </>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
