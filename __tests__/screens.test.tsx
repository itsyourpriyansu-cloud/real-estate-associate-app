import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import { resetPrototypeData } from '@/repositories';
import { AddMemberScreen } from '@/features/team/AddMemberScreen';
import { BookingConfirmScreen } from '@/features/booking/BookingConfirmScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { GuestHome } from '@/features/guest/GuestHome';
import { PublicHome } from '@/features/landing/PublicHome';
import { PriceCalculatorScreen } from '@/features/calculator/PriceCalculatorScreen';
import { ProjectGalleryScreen } from '@/features/projects/ProjectGalleryScreen';
import { ProjectsScreen } from '@/features/projects/ProjectsScreen';
import { TeamSalesScreen } from '@/features/sales/TeamSalesScreen';
import { SiteVisitsScreen } from '@/features/visits/SiteVisitsScreen';
import { MyTeamScreen } from '@/features/team/MyTeamScreen';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePrototypeStore } from '@/store/prototypeStore';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};
const show = (ui: ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ToastProvider>{ui}</ToastProvider>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  // Screens under test read through the real repositories; skip motion so figures are final.
  usePreferencesStore.setState({ reduceMotion: 'on', hideFigures: false });
});

afterEach(async () => {
  usePrototypeStore.getState().setScenario('NORMAL');
  usePrototypeStore.getState().setLatencyEnabled(false);
  useAuthStore.getState().signOut();
  usePreferencesStore.setState({ reduceMotion: 'system', hideFigures: false });
  await resetPrototypeData();
});

describe('Public Home', () => {
  it('shows the public numbers from the summary repository and two ways in', async () => {
    await show(<PublicHome />);
    expect(await screen.findByText('Total registered sq. yards')).toBeTruthy();
    expect(await screen.findByLabelText('Completed, 2')).toBeTruthy();
    expect(screen.getByLabelText('Ongoing, 2')).toBeTruthy();
    expect(screen.getByLabelText('Plots available, 74')).toBeTruthy();

    expect(screen.getByRole('radio', { name: /^Guest\./ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /^Associate\./ })).toBeTruthy();
    expect(screen.queryByRole('radio', { name: /^Simple login\./ })).toBeNull();
  });

  it('defaults to Associate, and choosing Guest changes the action and signs in as a guest', async () => {
    await show(<PublicHome />);
    expect(
      screen.getByRole('radio', { name: /^Associate\./ }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: /^Guest\./ }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue as guest' }));
    expect(useAuthStore.getState().session).toEqual({ kind: 'guest' });
  });

  it('still offers the ways in when the numbers cannot load (offline)', async () => {
    usePrototypeStore.getState().setScenario('OFFLINE');
    await show(<PublicHome />);
    expect(await screen.findByText('You’re offline')).toBeTruthy();
    expect(screen.getByRole('radio', { name: /^Guest\./ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
  });
});

describe('Guest hub', () => {
  it('offers Our Projects and a way back', async () => {
    useAuthStore.getState().continueAsGuest();
    await show(<GuestHome />);
    expect(screen.getByRole('button', { name: /^Our Projects, Project details/ })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Back to Home' }));
    expect(useAuthStore.getState().session).toEqual({ kind: 'none' });
  });
});

describe('Dashboard', () => {
  it('shows the hero figure, team numbers, performance and the seven sections', async () => {
    await show(<DashboardScreen />);
    expect(await screen.findByText('Total registered sq. yards')).toBeTruthy();
    expect(await screen.findByLabelText('Team members, 16')).toBeTruthy();
    expect(screen.getByLabelText('My team, 9')).toBeTruthy();
    expect(screen.getByText('My performance')).toBeTruthy();
    for (const title of [
      'Our Projects',
      'Live Booking',
      'Price Calculator',
      'Site Visits History',
      'Team Sales',
      'Add Team Member',
      'My Team',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(`^${title},`) })).toBeTruthy();
    }
  });

  it('masks the figures with the eye control and remembers it', async () => {
    await show(<DashboardScreen />);
    await screen.findByText('Total registered sq. yards');
    await fireEvent.press(screen.getByRole('button', { name: 'Hide figures' }));
    expect(usePreferencesStore.getState().hideFigures).toBe(true);
    // The hero figure and the team-sales stat are both masked.
    expect((await screen.findAllByText('••••••')).length).toBeGreaterThanOrEqual(2);
  });

  it('reads Pending, not zero, when nothing is recorded (Empty CRM)', async () => {
    usePrototypeStore.getState().setScenario('EMPTY_CRM');
    await show(<DashboardScreen />);
    expect(await screen.findByLabelText('My sales, pending, not yet added')).toBeTruthy();
    expect(screen.getByLabelText('YHIPL2 team site visits, pending, not yet added')).toBeTruthy();
  });

  it('opens the menu with Profile, Settings, Prototype controls and Sign out', async () => {
    await show(<DashboardScreen />);
    await screen.findByText('My performance');
    await fireEvent.press(screen.getByRole('button', { name: 'Open menu' }));
    expect(await screen.findByText('Prototype controls')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    useAuthStore.setState({ session: { kind: 'associate', phone: '+919876543210' } });
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(useAuthStore.getState().session).toEqual({ kind: 'none' });
  });

  it('shows a recoverable error when the repository fails, and recovers when the connection returns', async () => {
    usePrototypeStore.getState().setScenario('REPOSITORY_ERRORS');
    await show(<DashboardScreen />);
    expect(await screen.findByText('Couldn’t load your dashboard')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeTruthy();
    // Switching the scenario refetches on its own; the error clears without a manual retry.
    await act(async () => usePrototypeStore.getState().setScenario('NORMAL'));
    expect(await screen.findByText('My performance')).toBeTruthy();
  });
});

describe('Our Projects', () => {
  it('lists every project with live counts and filters by status', async () => {
    await show(<ProjectsScreen />);
    expect(await screen.findByText('Sunrise Meadows')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All, 4' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ongoing, 2' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ongoing, 2' }));
    expect(screen.queryByText('Sunrise Meadows')).toBeNull();
    expect(screen.getByText('Emerald Hills')).toBeTruthy();
    expect(screen.getByText('Maple Ridge')).toBeTruthy();
  });
});

describe('Project Gallery', () => {
  it('shows every stock photo for the project', async () => {
    await show(<ProjectGalleryScreen projectId="prj_real_rise" />);
    expect(await screen.findByText('Gallery')).toBeTruthy();
    expect(screen.getByText('Sunrise Meadows')).toBeTruthy();
    expect(screen.getAllByLabelText(/Sunrise Meadows photo \d/).length).toBe(5);
  });
});

describe('My Team and Add Member', () => {
  it('lists the downline with levels and filters by level', async () => {
    await show(<MyTeamScreen />);
    expect(await screen.findByText('Vikram Naidu')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Level 3, 1' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Level 3, 1' }));
    expect(screen.getByText('Harsha Vardhan')).toBeTruthy();
    expect(screen.queryByText('Vikram Naidu')).toBeNull();
  });

  it('validates the form with messages under the fields, and does not add anyone', async () => {
    await show(<AddMemberScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Add member' }));
    expect(await screen.findByText('Enter the member’s full name')).toBeTruthy();
    expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeTruthy();
  });

  it('adds a member through the repository', async () => {
    await show(<AddMemberScreen />);
    await fireEvent.changeText(await screen.findByLabelText('Full name'), 'Asha Menon');
    await fireEvent.changeText(screen.getByLabelText('Mobile number'), '9811100001');
    await fireEvent.press(screen.getByRole('button', { name: 'Add member' }));

    await waitFor(async () => {
      await show(<MyTeamScreen />);
      expect(await screen.findByText('Asha Menon')).toBeTruthy();
    });
  });

  it('says so when the number already belongs to a member', async () => {
    await show(<AddMemberScreen />);
    await fireEvent.changeText(await screen.findByLabelText('Full name'), 'Copy Cat');
    await fireEvent.changeText(screen.getByLabelText('Mobile number'), '9876500017');
    await fireEvent.press(screen.getByRole('button', { name: 'Add member' }));
    expect(
      await screen.findByText('A member with this mobile number already exists.'),
    ).toBeTruthy();
  });
});

describe('Team Sales', () => {
  it('shows this month against its target, top sellers and the sales list', async () => {
    await show(<TeamSalesScreen />);
    expect(await screen.findByText('Target progress')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: /^Area target, \d+%$/ })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: /^Value target, \d+%$/ })).toBeTruthy();
    expect(screen.getByText('Top sellers')).toBeTruthy();
    expect(screen.getByText('Sales this month')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Aug 2026' })).toBeTruthy();
  });
});

describe('Site Visits History', () => {
  it('lists the associate’s visits and filters by status', async () => {
    await show(<SiteVisitsScreen />);
    expect(await screen.findByText('Rahul Sharma')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All, 7' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Completed, 4' }));
    expect(screen.queryByText('Rahul Sharma')).toBeNull();
    expect(screen.getByText('Mohammed Faizan')).toBeTruthy();
  });
});

describe('Price Calculator', () => {
  it('waits for numbers, then totals area × rate + premium, with the not-a-quotation note', async () => {
    await show(<PriceCalculatorScreen />);
    expect(screen.getByText(/Enter the plot area and the rate per sq yd/)).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Plot area'), '240');
    await fireEvent.changeText(screen.getByLabelText('Rate per sq yd'), '18000');
    await fireEvent.changeText(screen.getByLabelText('Premium (optional)'), '86000');
    expect(await screen.findByLabelText('₹44.1L')).toBeTruthy();
    expect(screen.getByText('₹43.2L')).toBeTruthy();
    expect(screen.getByText('Estimate for preview only. This is not a quotation.')).toBeTruthy();
  });

  it('keeps only digits in the numeric fields', async () => {
    await show(<PriceCalculatorScreen />);
    await fireEvent.changeText(screen.getByLabelText('Plot area'), '2a4b0');
    expect(screen.getByLabelText('Plot area').props.value).toBe('240');
  });
});

describe('Live Booking confirm step', () => {
  it('previews the cost, asks for the customer, and books through the repository', async () => {
    await show(<BookingConfirmScreen plotId="plot_rr_026" />);
    expect(await screen.findByText('Plot 26')).toBeTruthy();
    expect(screen.getByText('₹44.1L')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Review and confirm' }));
    expect(await screen.findByText('Enter the customer’s name')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Customer name'), 'Meera Kapoor');
    await fireEvent.press(screen.getByRole('button', { name: 'Review and confirm' }));
    expect(await screen.findByText('Book plot 26?')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByRole('button', { name: 'Confirm booking' }));
    });
    expect(await screen.findByText('Plot booked')).toBeTruthy();
    expect(screen.getByText('Prototype booking · no payment taken', { exact: false })).toBeTruthy();
  });

  it('refuses a plot that is already booked', async () => {
    await show(<BookingConfirmScreen plotId="plot_rr_008" />);
    expect(await screen.findByText('This plot can’t be booked')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Review and confirm' })).toBeNull();
  });
});
