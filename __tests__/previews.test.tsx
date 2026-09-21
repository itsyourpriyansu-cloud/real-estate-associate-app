import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/feedback';
import { HomePreview } from '@/features/home/HomePreview';
import { InboxPreview } from '@/features/inbox/InboxPreview';
import { LeadsPreview } from '@/features/leads/LeadsPreview';
import { ProjectsPreview } from '@/features/projects/ProjectsPreview';
import { TasksPreview } from '@/features/tasks/TasksPreview';
import { resetPrototypeData } from '@/repositories';
import { simulation } from '@/services/simulation';
import { usePrototypeStore } from '@/store/prototypeStore';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true };
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => mockRouter,
}));

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

const setScenario = (
  scenario: Parameters<ReturnType<typeof usePrototypeStore.getState>['setScenario']>[0],
) => act(async () => usePrototypeStore.getState().setScenario(scenario));

beforeEach(() => {
  mockRouter.push.mockClear();
});

afterEach(async () => {
  await setScenario('NORMAL');
  await act(async () => {
    await resetPrototypeData();
  });
});

describe('Home preview', () => {
  it('answers "what should I do next?" from seeded data, through repositories', async () => {
    await show(<HomePreview />);

    // Greeting + date from the demo Clock (09:15 on Mon 21 Sep 2026).
    expect(await screen.findByText('Raghunath')).toBeTruthy();
    expect(screen.getByText('Good morning')).toBeTruthy();
    expect(screen.getByText('Monday 21 September')).toBeTruthy();

    // Today at a glance.
    expect(screen.getByText('leads need attention')).toBeTruthy();
    expect(screen.getByText('site visits today')).toBeTruthy();
    expect(screen.getByText('overdue follow‑ups')).toBeTruthy();

    // The next action: the hottest lead's task due today.
    expect(screen.getByText('Next action')).toBeTruthy();
    expect(screen.getByText('Follow up on Real Rise shortlist')).toBeTruthy();
    expect(screen.getByText('Today · 10:30 AM')).toBeTruthy();

    // Today's visits, the overdue banner, inventory and the month.
    expect(screen.getAllByText('Rohit Bansal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(1);
    expect(screen.getByText(/Overdue · Follow up after brochure/)).toBeTruthy();
    expect(screen.getByText('Plots available')).toBeTruthy();
    expect(screen.getByText('₹42.8L')).toBeTruthy();
    expect(screen.getByText('Recent activity')).toBeTruthy();
  });

  it('opens the next action’s lead', async () => {
    await show(<HomePreview />);
    await screen.findByText('Next action');
    await fireEvent.press(screen.getByRole('button', { name: 'Open Rahul Sharma' }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/leads/[leadId]',
      params: { leadId: 'lead_001' },
    });
  });

  it('shows a recoverable error, then loads after "Try again"', async () => {
    await setScenario('REPOSITORY_ERRORS');
    await show(<HomePreview />);
    expect(await screen.findByText('Couldn’t load your day')).toBeTruthy();
    expect(screen.getByText('Your prototype data is still safe.')).toBeTruthy();

    // The problem clears (no dataset change, so nothing refetches on its own)...
    await act(async () => simulation.setConfig({ scenario: 'NORMAL' }));
    // ...and the user recovers with one tap.
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Next action')).toBeTruthy();
  });

  it('shows the offline state in words', async () => {
    await setScenario('OFFLINE');
    await show(<HomePreview />);
    expect(await screen.findByText('You’re offline')).toBeTruthy();
    expect(screen.getByText('Previously loaded prototype data is available.')).toBeTruthy();
  });

  it('has honest empty states when the CRM is empty', async () => {
    await setScenario('EMPTY_CRM');
    await show(<HomePreview />);
    expect(await screen.findByText('Nothing scheduled yet')).toBeTruthy();
    expect(screen.getByText('No site visits today')).toBeTruthy();
  });

  it('is honest about work that belongs to a later stage', async () => {
    await show(<HomePreview />);
    await screen.findByText('Next action');
    await fireEvent.press(screen.getByRole('button', { name: 'Add lead' }));
    expect(await screen.findByText('Adding a lead arrives in a later stage.')).toBeTruthy();
  });
});

describe('Leads preview', () => {
  it('lists every lead, then filters by chip', async () => {
    await show(<LeadsPreview />);
    expect(await screen.findByText('18 leads')).toBeTruthy();
    expect(screen.getByText('Ananya Iyer')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Hot', selected: false }));
    expect(await screen.findByText('5 leads · Hot')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hot', selected: true })).toBeTruthy();
    expect(screen.queryByText('Ananya Iyer')).toBeNull(); // NORMAL priority
    expect(screen.getByText('Rahul Sharma')).toBeTruthy();
  });

  it('opens a lead from its card', async () => {
    await show(<LeadsPreview />);
    await screen.findByText('Rahul Sharma');
    await fireEvent.press(screen.getByRole('button', { name: /^Rahul Sharma\. Hot priority/ }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/leads/[leadId]',
      params: { leadId: 'lead_001' },
    });
  });

  it('has a specific empty state per filter', async () => {
    await setScenario('EMPTY_CRM');
    await show(<LeadsPreview />);
    expect(await screen.findByText('No leads yet')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Hot', selected: false }));
    expect(await screen.findByText('No hot leads right now')).toBeTruthy();
  });

  it('shows a recoverable error', async () => {
    await setScenario('REPOSITORY_ERRORS');
    await show(<LeadsPreview />);
    expect(await screen.findByText('Couldn’t load your leads')).toBeTruthy();
  });
});

describe('Projects preview', () => {
  it('shows the four projects and an inventory sample with every status spelled out', async () => {
    await show(<ProjectsPreview />);
    expect(await screen.findByText('4 projects · 74 plots available')).toBeTruthy();
    for (const name of ['Real Rise', 'Aurelia Greens', 'Northgate County', 'Cedar Enclave']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(screen.getByText('21 available')).toBeTruthy();
    expect(screen.getByText('Inventory · Real Rise')).toBeTruthy();
    expect(screen.getAllByText('Not for sale').length).toBeGreaterThan(0); // summary legend
    expect(screen.getAllByRole('button', { name: 'View inventory' })).toHaveLength(4);
  });

  it('routes to a project’s inventory', async () => {
    await show(<ProjectsPreview />);
    await screen.findByText('4 projects · 74 plots available');
    await fireEvent.press(screen.getAllByRole('button', { name: 'View inventory' })[0] as never);
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/projects/[projectId]/inventory',
      params: { projectId: 'prj_real_rise' },
    });
  });
});

describe('Tasks preview', () => {
  it('groups today’s tasks and shows segment counts', async () => {
    await show(<TasksPreview />);
    expect(await screen.findByText('Monday 21 September')).toBeTruthy();
    expect(await screen.findByText('Send intro and project options')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Today, 6', selected: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Overdue, 3' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upcoming, 7' })).toBeTruthy();
  });

  it('completes a task for real: the repository updates, a toast confirms, counts move', async () => {
    await show(<TasksPreview />);
    await screen.findByText('Send intro and project options');
    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Mark Send intro and project options complete' }),
    );
    expect(await screen.findByText('Task marked complete.')).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Today, 5', selected: true })).toBeTruthy();
    expect(screen.queryByText('Send intro and project options')).toBeNull();
    expect(screen.getByRole('button', { name: 'Completed, 3' })).toBeTruthy();
  });

  it('marks overdue tasks in words', async () => {
    await show(<TasksPreview />);
    await screen.findByText('Send intro and project options');
    await fireEvent.press(screen.getByRole('button', { name: 'Overdue, 3' }));
    expect(await screen.findByText('Follow up after brochure')).toBeTruthy();
    expect(screen.getAllByLabelText('Overdue')).toHaveLength(3); // one chip per overdue task
  });

  it('has an encouraging empty state', async () => {
    await setScenario('EMPTY_CRM');
    await show(<TasksPreview />);
    expect(await screen.findByText('Nothing scheduled today')).toBeTruthy();
  });
});

describe('Inbox preview', () => {
  it('lists the seeded conversations and states that it is not live WhatsApp', async () => {
    await show(<InboxPreview />);
    expect(await screen.findByText('4 unread · Prototype inbox, not live WhatsApp')).toBeTruthy();
    expect(screen.getByText('Can you also share the cost for plot 26?')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /unread\./ })).toHaveLength(4);
  });

  it('opens a conversation', async () => {
    await show(<InboxPreview />);
    await screen.findByText('Rahul Sharma');
    await fireEvent.press(screen.getByRole('button', { name: /^Rahul Sharma/ }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/conversations/[conversationId]',
      params: { conversationId: 'conv_001' },
    });
  });
});
