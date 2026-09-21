import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import {
  AnimatedNumber,
  AppText,
  ChipRow,
  DetailHeader,
  Divider,
  FilterChip,
  Reveal,
  ScreenLayout,
  SummaryPanel,
  TextField,
} from '@/components';
import { calculatePlotCost, plotCostInputSchema, type Plot } from '@/domain';
import { space } from '@/design-system';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { plotRepository } from '@/repositories';
import { formatArea, formatInr } from '@/utils/format';

import { useProjects } from '../projects/useProjects';

const PLOT_CHOICES = 10;

/** Keeps digits and at most one decimal point, so the field can only hold a number. */
const numeric = (text: string) => {
  const cleaned = text.replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole;
};

function useAvailablePlots(projectId: string | undefined) {
  const loader = useCallback(
    () =>
      projectId
        ? plotRepository.list({ projectId, statuses: ['AVAILABLE'], sort: 'NUMBER' })
        : Promise.resolve<Plot[]>([]),
    [projectId],
  );
  return useAsyncResource(loader);
}

/**
 * 3 · PRICE CALCULATOR — area × rate + premium. Start from a real plot (pick a project, then a
 * plot) or type the numbers; the total updates as you type. A preview, never a quotation.
 */
export function PriceCalculatorScreen() {
  const router = useRouter();
  const projects = useProjects();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [plotId, setPlotId] = useState<string | undefined>();
  const [area, setArea] = useState('');
  const [rate, setRate] = useState('');
  const [premium, setPremium] = useState('');
  const plots = useAvailablePlots(projectId);

  const parsed = plotCostInputSchema.safeParse({
    areaSqYd: Number(area),
    ratePerSqYd: Number(rate),
    ...(premium ? { premiumAmount: Number(premium) } : null),
  });
  const cost = parsed.success ? calculatePlotCost(parsed.data) : undefined;

  const fillFrom = (plot: Plot) => {
    setPlotId(plot.id);
    setArea(String(plot.areaSqYd));
    setRate(String(plot.baseRatePerSqYd));
    setPremium(plot.premiumAmount ? String(plot.premiumAmount) : '');
  };

  const edited = (setter: (v: string) => void) => (text: string) => {
    setPlotId(undefined);
    setter(numeric(text));
  };

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title="Price calculator" onBack={() => router.back()} />}
    >
      <Reveal index={0}>
        <SummaryPanel title="Start from a plot">
          <AppText tone="secondary">
            Pick a project and an available plot to fill the numbers, or type your own below.
          </AppText>
          <ChipRow>
            {(projects.data ?? []).map((project) => (
              <FilterChip
                key={project.id}
                label={project.name}
                selected={projectId === project.id}
                onPress={() => {
                  setProjectId(project.id);
                  setPlotId(undefined);
                }}
              />
            ))}
          </ChipRow>
          {projectId ? (
            <ChipRow>
              {(plots.data ?? []).slice(0, PLOT_CHOICES).map((plot) => (
                <FilterChip
                  key={plot.id}
                  label={`Plot ${plot.plotNumber} · ${formatArea(plot.areaSqYd)}`}
                  selected={plotId === plot.id}
                  onPress={() => fillFrom(plot)}
                />
              ))}
            </ChipRow>
          ) : null}
        </SummaryPanel>
      </Reveal>

      <Reveal index={1}>
        <SummaryPanel title="Numbers">
          <TextField
            label="Plot area"
            placeholder="240"
            value={area}
            onChangeText={edited(setArea)}
            keyboardType="decimal-pad"
            right={<AppText tone="secondary">sq yd</AppText>}
          />
          <TextField
            label="Rate per sq yd"
            placeholder="18000"
            value={rate}
            onChangeText={edited(setRate)}
            keyboardType="number-pad"
            left={<AppText tone="secondary">₹</AppText>}
          />
          <TextField
            label="Premium (optional)"
            placeholder="0"
            helperText="Corner or facing premium, added to the total."
            value={premium}
            onChangeText={edited(setPremium)}
            keyboardType="number-pad"
            left={<AppText tone="secondary">₹</AppText>}
          />
        </SummaryPanel>
      </Reveal>

      <Reveal index={2}>
        <SummaryPanel title="Estimated cost">
          {cost ? (
            <View style={{ gap: space[12] }}>
              <Line label="Base cost" value={formatInr(cost.baseAmount)} />
              <Line label="Premium" value={formatInr(cost.premiumAmount)} />
              <Divider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <AppText variant="labelLG">Estimated total</AppText>
                <AnimatedNumber
                  value={cost.total}
                  format={(n) => formatInr(Math.round(n))}
                  variant="metricLG"
                />
              </View>
            </View>
          ) : (
            <AppText tone="secondary">
              Enter the plot area and the rate per sq yd to see the total.
            </AppText>
          )}
          <AppText variant="caption" tone="secondary">
            Estimate for preview only. This is not a quotation.
          </AppText>
        </SummaryPanel>
      </Reveal>
    </ScreenLayout>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <AppText tone="secondary">{label}</AppText>
      <AppText variant="labelLG" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </AppText>
    </View>
  );
}
