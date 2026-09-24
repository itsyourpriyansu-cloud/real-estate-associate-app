import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  ActionTile,
  AnimatedNumber,
  AppHeader,
  AppText,
  AssociateDock,
  BrandMark,
  ChipRow,
  DockContext,
  FilterChip,
  HeroCard,
  HeroStat,
  LoginOptionCard,
  NavPanel,
  NavRow,
  ProgressBar,
  Reveal,
  SaleRow,
  StatGrid,
  StatTile,
  SuccessMark,
  SummaryPanel,
  TeamMemberRow,
  VisitHistoryRow,
  Wordmark,
  icons,
  useDockClearance,
} from '@/components';
import {
  COMMISSION_RATE_SENIOR_ASSOCIATE,
  REWARD_PLOT_TARGET,
  SENIOR_ASSOCIATE_DESIGNATION,
} from '@/constants/prototype';
import { layout } from '@/design-system';
import { commissionFor, rewardProgressFor } from '@/features/dashboard/dashboardSelectors';
import { DOCK_ITEMS, dockHref, dockKeyFor } from '@/features/navigation/dock';
import {
  availablePeriods,
  performanceFor,
  periodLabel,
  periodOf,
  rankSellers,
} from '@/features/sales/salesSelectors';
import { useCountUp } from '@/hooks/useCountUp';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatInr } from '@/utils/format';

import { createTestRepositories, loadSamples } from './helpers';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};
const show = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

afterEach(() => {
  usePreferencesStore.setState({ reduceMotion: 'system', hideFigures: false });
});

const reduceMotion = () => usePreferencesStore.setState({ reduceMotion: 'on' });

describe('brand', () => {
  it('announces the company once, as "Vara Real Estates"', async () => {
    await show(<Wordmark />);
    expect(screen.getByLabelText('Vara Real Estates')).toBeTruthy();
    expect(screen.getByText('Vara')).toBeTruthy();
    expect(screen.getByText('Real Estates')).toBeTruthy();
  });

  it('draws the mark at every size without throwing', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) await show(<BrandMark size={size} />);
  });
});

describe('icon vocabulary', () => {
  it('gives every meaning exactly one glyph (no two meanings share a picture)', () => {
    const glyphs = Object.values(icons);
    expect(new Set(glyphs).size).toBe(glyphs.length);
  });

  it('covers the seven dashboard sections and the two entry paths', () => {
    for (const key of [
      'projects',
      'booking',
      'calculator',
      'siteVisits',
      'teamSales',
      'addMember',
      'myTeam',
      'guest',
      'associate',
    ] as const) {
      expect(icons[key]).toBeDefined();
    }
  });
});

describe('count-up and animated numbers', () => {
  it('shows the final figure immediately with Reduce Motion on', async () => {
    reduceMotion();
    const { result } = await renderHook(() => useCountUp(1234));
    expect(result.current).toBe(1234);
  });

  it('starts at zero and reaches the target when motion is on', async () => {
    jest.useFakeTimers();
    try {
      const { result } = await renderHook(() => useCountUp(500, { ms: 200 }));
      expect(result.current).toBe(0);
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current).toBe(500);
    } finally {
      jest.useRealTimers();
    }
  });

  it('speaks the final value, never the count-up, and can be masked', async () => {
    await show(<AnimatedNumber value={4748} format={(n) => `${Math.round(n)} sq yd`} />);
    expect(screen.getByLabelText('4748 sq yd')).toBeTruthy();
    await show(<AnimatedNumber value={4748} masked="••••" />);
    expect(screen.getByText('••••')).toBeTruthy();
  });
});

describe('Reveal', () => {
  it('renders its children', async () => {
    await show(
      <Reveal index={3}>
        <AppText>Hello</AppText>
      </Reveal>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});

describe('HeroCard', () => {
  it('shows the figure, caption and footer stats', async () => {
    reduceMotion();
    await show(
      <HeroCard
        label="Total registered sq. yards"
        value={4748}
        format={(n) => n.toLocaleString('en-IN')}
        caption="YHIPL2 · all Vara projects"
        footer={<HeroStat label="My team" value="9" />}
      />,
    );
    expect(screen.getByText('Total registered sq. yards')).toBeTruthy();
    expect(screen.getByLabelText('4,748')).toBeTruthy();
    expect(screen.getByText('YHIPL2 · all Vara projects')).toBeTruthy();
    expect(screen.getByLabelText('My team, 9')).toBeTruthy();
  });

  it('masks the figure and names the control by what it will do', async () => {
    reduceMotion();
    const onToggle = jest.fn();
    const view = await show(
      <HeroCard label="Total" value={100} onToggleHidden={onToggle} hidden={false} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Hide figures' }));
    expect(onToggle).toHaveBeenCalledTimes(1);

    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <HeroCard label="Total" value={100} onToggleHidden={onToggle} hidden />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('••••••')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show figures' })).toBeTruthy();
  });
});

describe('SummaryPanel and StatTile', () => {
  it('shows a figure with its label', async () => {
    reduceMotion();
    await show(
      <SummaryPanel title="My performance">
        <StatGrid>
          <StatTile label="Team members" value={16} />
          <StatTile label="Starting from" value="₹26.8L" caption="Real Rise" />
        </StatGrid>
      </SummaryPanel>,
    );
    expect(screen.getByText('My performance')).toBeTruthy();
    expect(screen.getByLabelText('Team members, 16')).toBeTruthy();
    expect(screen.getByLabelText('Starting from, ₹26.8L')).toBeTruthy();
  });

  it('says "Pending — not yet added" instead of drawing a zero', async () => {
    await show(<StatTile label="My sales" pending />);
    expect(screen.getByLabelText('My sales, pending, not yet added')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('Not yet added')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });
});

describe('ActionTile', () => {
  it('is one labelled button', async () => {
    const onPress = jest.fn();
    await show(<ActionTile icon={icons.booking} label="Live booking" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Live booking' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('NavPanel and NavRow', () => {
  it('lists destinations as buttons that read title, subtitle and meta', async () => {
    const open = jest.fn();
    await show(
      <NavPanel>
        <NavRow
          icon={icons.projects}
          title="Our Projects"
          subtitle="Project details, status, locations"
          onPress={open}
        />
        <NavRow icon={icons.myTeam} title="My Team" meta="9" onPress={jest.fn()} />
      </NavPanel>,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Our Projects, Project details, status, locations' }),
    );
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'My Team, 9' })).toBeTruthy();
  });
});

describe('LoginOptionCard', () => {
  it('is a radio: selected state is spoken and pressing selects it', async () => {
    const onPress = jest.fn();
    await show(
      <LoginOptionCard
        icon={icons.guest}
        title="Guest"
        description="Browse our projects."
        selected={false}
        onPress={onPress}
      />,
    );
    const radio = screen.getByRole('radio', { name: 'Guest. Browse our projects.' });
    expect(radio.props.accessibilityState).toMatchObject({ selected: false, checked: false });
    await fireEvent.press(radio);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports selected', async () => {
    await show(
      <LoginOptionCard
        icon={icons.associate}
        title="Associate"
        description="Your dashboard."
        selected
        onPress={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('radio', { name: 'Associate. Your dashboard.' }).props.accessibilityState,
    ).toMatchObject({ selected: true, checked: true });
  });
});

describe('ProgressBar', () => {
  it('is a progressbar that speaks its percentage', async () => {
    reduceMotion();
    await show(
      <ProgressBar
        value={0.62}
        label="Area target, 62%"
        startCaption="1,247 sq yd sold"
        endCaption="Target 2,000"
      />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Area target, 62%' });
    expect(bar.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 62, text: '62%' });
    expect(screen.getByText('1,247 sq yd sold')).toBeTruthy();
    expect(screen.getByText('Target 2,000')).toBeTruthy();
  });

  it('caps the announced position at 100 but keeps the true percentage in the text', async () => {
    reduceMotion();
    await show(<ProgressBar value={1.4} label="Value target" />);
    expect(
      screen.getByRole('progressbar', { name: 'Value target' }).props.accessibilityValue,
    ).toMatchObject({ now: 100, text: '140%' });
  });
});

describe('floating dock', () => {
  it('has four destinations in order, with exactly one selected', async () => {
    reduceMotion();
    const onSelect = jest.fn();
    await show(<AssociateDock items={DOCK_ITEMS} activeKey="projects" onSelect={onSelect} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      'Home',
      'Projects',
      'Team',
      'Profile',
    ]);
    expect(tabs.map((tab) => !!tab.props.accessibilityState?.selected)).toEqual([
      false,
      true,
      false,
      false,
    ]);
    await fireEvent.press(screen.getByRole('tab', { name: 'Team' }));
    expect(onSelect).toHaveBeenCalledWith('team');
  });

  it('is shown only on the four top-level destinations', () => {
    expect(dockKeyFor('/dashboard')).toBe('home');
    expect(dockKeyFor('/projects')).toBe('projects');
    expect(dockKeyFor('/projects/')).toBe('projects');
    expect(dockKeyFor('/team')).toBe('team');
    expect(dockKeyFor('/profile')).toBe('profile');
    for (const pushed of [
      '/team/add',
      '/team/usr_member_001',
      '/projects/prj_real_rise',
      '/projects/prj_real_rise/inventory',
      '/plots/plot_rr_026',
      '/live-booking',
      '/settings',
      '/home',
      '/',
    ]) {
      expect({ pushed, key: dockKeyFor(pushed) }).toEqual({ pushed, key: undefined });
    }
  });

  it('routes every dock item to an existing top-level route', () => {
    expect(DOCK_ITEMS.map((item) => dockHref(item.key))).toEqual([
      '/dashboard',
      '/projects',
      '/team',
      '/profile',
    ]);
  });

  it('gives screens clearance only while the dock is on screen', async () => {
    const clearance = () => renderHook(() => useDockClearance());
    expect((await clearance()).result.current).toBe(0);
    const { result } = await renderHook(() => useDockClearance(), {
      wrapper: ({ children }) => <DockContext.Provider value>{children}</DockContext.Provider>,
    });
    expect(result.current).toBe(layout.dockHeight + layout.dockOffset);
  });
});

describe('AppHeader', () => {
  it('opens the menu and the profile, and names the profile control', async () => {
    const onMenu = jest.fn();
    const onProfile = jest.fn();
    await show(
      <AppHeader
        title="Dashboard"
        fullName="K. V. Raghunath Reddy"
        onMenu={onMenu}
        onProfile={onProfile}
      />,
    );
    expect(screen.getByText('Dashboard')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Open menu' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Profile, K. V. Raghunath Reddy' }));
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(onProfile).toHaveBeenCalledTimes(1);
  });
});

describe('list rows', () => {
  it('TeamMemberRow shows the person and their level, and opens on press', async () => {
    const { repositories } = createTestRepositories();
    const [member, ...rest] = await repositories.team.listMyTeam();
    const inactive = rest.find((m) => m.status === 'INACTIVE');
    if (!member || !inactive) throw new Error('seed has no members');
    const onPress = jest.fn();
    await show(<TeamMemberRow member={member} onPress={onPress} />);
    expect(screen.getByText(member.fullName)).toBeTruthy();
    expect(screen.getByText('Level 1')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: /Deepa Krishnan, Junior Associate, level 1/ }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);

    await show(<TeamMemberRow member={inactive} onPress={jest.fn()} />);
    expect(screen.getByText('Inactive')).toBeTruthy();
  });

  it('SaleRow reads customer, project, date, value and status', async () => {
    await show(
      <SaleRow
        customer="Kavitha Menon"
        detail="Real Rise · K. V. Raghunath Reddy"
        dateText="3 Sep"
        amountText="₹44.1L"
        status="REGISTERED"
      />,
    );
    expect(screen.getByText('Registered')).toBeTruthy();
    expect(
      screen.getByLabelText(
        'Kavitha Menon, Real Rise · K. V. Raghunath Reddy, 3 Sep, ₹44.1L, Registered',
      ),
    ).toBeTruthy();
  });

  it('VisitHistoryRow shows the date block and status, and opens on press', async () => {
    const { visit } = await loadSamples();
    const onPress = jest.fn();
    await show(
      <VisitHistoryRow
        visit={visit}
        customer="Rahul Sharma"
        project="Real Rise"
        dayNumber="21"
        monthShort="Sep"
        timeText="3:30 PM"
        onPress={onPress}
      />,
    );
    expect(screen.getByText('21', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('Confirmed')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Rahul Sharma, Real Rise, Sep 21, 3:30 PM' }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ChipRow and SuccessMark', () => {
  it('ChipRow holds chips that stay pressable', async () => {
    const onPress = jest.fn();
    await show(
      <ChipRow>
        <FilterChip label="Ongoing" count={2} onPress={onPress} />
        <FilterChip label="Completed" count={2} />
      </ChipRow>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Ongoing, 2' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('SuccessMark renders with and without motion', async () => {
    reduceMotion();
    await show(<SuccessMark />);
    await act(async () => usePreferencesStore.setState({ reduceMotion: 'off' }));
    await show(<SuccessMark />);
  });
});

describe('preferences: hide figures', () => {
  it('defaults to showing figures and persists the choice in the store', () => {
    expect(usePreferencesStore.getState().hideFigures).toBe(false);
    usePreferencesStore.getState().setHideFigures(true);
    expect(usePreferencesStore.getState().hideFigures).toBe(true);
  });
});

describe('sales selectors (pure)', () => {
  it('reads the calendar month a sale belongs to, and labels it', () => {
    expect(periodOf(new Date(2026, 8, 3, 12).toISOString())).toBe('2026-09');
    expect(periodLabel('2026-09')).toBe('Sep 2026');
    expect(periodLabel('2027-01')).toBe('Jan 2027');
  });

  it('measures a month against its target, and ranks sellers', async () => {
    const { repositories } = createTestRepositories();
    const [sales, targets] = await Promise.all([
      repositories.sales.listTeam(),
      repositories.sales.getTargets(),
    ]);
    const periods = availablePeriods(sales, targets);
    expect(periods[0]).toBe('2026-09');
    expect([...periods].sort().reverse()).toEqual(periods);

    const sept = performanceFor('2026-09', sales, targets);
    expect(sept.target).toEqual({ targetAreaSqYd: 2000, targetAmount: 50_000_000 });
    expect(sept.areaProgress).toBeCloseTo(sept.totals.areaSqYd / 2000, 6);
    expect(sept.amountProgress).toBeCloseTo(sept.totals.amount / 50_000_000, 6);
    expect(formatInr(sept.totals.amount)).toMatch(/^₹/);

    const inMonth = sales.filter((s) => periodOf(s.bookedAt) === '2026-09');
    const ranking = rankSellers(inMonth);
    expect(ranking.reduce((sum, r) => sum + r.totals.count, 0)).toBe(sept.totals.count);
    expect(ranking.map((r) => r.totals.amount)).toEqual(
      [...ranking.map((r) => r.totals.amount)].sort((a, b) => b - a),
    );
  });

  it('has no target progress for a month without a target', () => {
    const empty = performanceFor('2024-01', [], []);
    expect(empty).toMatchObject({ target: null, areaProgress: null, amountProgress: null });
    expect(empty.totals).toEqual({ count: 0, areaSqYd: 0, amount: 0 });
  });
});

describe('dashboard selectors (pure)', () => {
  it('pays commission only to a senior associate, at the given rate', () => {
    const sales = { count: 6, areaSqYd: 1744, amount: 32_878_000 };
    expect(commissionFor(SENIOR_ASSOCIATE_DESIGNATION, COMMISSION_RATE_SENIOR_ASSOCIATE, sales)).toEqual({
      eligible: true,
      rate: 0.05,
      amount: 1_643_900,
    });
    expect(commissionFor('Associate', COMMISSION_RATE_SENIOR_ASSOCIATE, sales)).toEqual({
      eligible: false,
      rate: 0.05,
      amount: 0,
    });
    expect(commissionFor(undefined, COMMISSION_RATE_SENIOR_ASSOCIATE, sales)).toMatchObject({
      eligible: false,
      amount: 0,
    });
  });

  it('tracks progress toward the foreign-trip reward and flips to achieved at the target', () => {
    expect(rewardProgressFor({ count: 0, areaSqYd: 0, amount: 0 }, REWARD_PLOT_TARGET)).toEqual({
      plotsSold: 0,
      target: REWARD_PLOT_TARGET,
      remaining: REWARD_PLOT_TARGET,
      achieved: false,
    });
    expect(rewardProgressFor({ count: 4, areaSqYd: 0, amount: 0 }, REWARD_PLOT_TARGET)).toEqual({
      plotsSold: 4,
      target: REWARD_PLOT_TARGET,
      remaining: 1,
      achieved: false,
    });
    expect(rewardProgressFor({ count: 5, areaSqYd: 0, amount: 0 }, REWARD_PLOT_TARGET)).toMatchObject({
      remaining: 0,
      achieved: true,
    });
    // Selling past the target never goes negative or un-achieves the reward.
    expect(rewardProgressFor({ count: 9, areaSqYd: 0, amount: 0 }, REWARD_PLOT_TARGET)).toMatchObject({
      remaining: 0,
      achieved: true,
    });
  });
});
