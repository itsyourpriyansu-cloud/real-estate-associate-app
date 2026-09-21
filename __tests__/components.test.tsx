import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  AppTabBar,
  AppText,
  Avatar,
  Button,
  ConfirmationSheet,
  ContactActionBar,
  ConversationRow,
  EmptyState,
  IconButton,
  LeadCard,
  LeadStageIndicator,
  MessageBubble,
  NextActionCard,
  NotificationRow,
  PipelineSummary,
  PressableScale,
  OTPField,
  PhoneField,
  PlotCard,
  PlotLegend,
  PlotStatusBadge,
  PriceSummary,
  ProjectCard,
  RepositoryErrorState,
  ResourceBoundary,
  SelectField,
  StatusChip,
  TaskCard,
  TextField,
  Toggle,
  ToastProvider,
  UnreadBadge,
  VisitCard,
  describeRepositoryError,
  useToast,
} from '@/components';
import { plotStatusSchema, type PlotStatus } from '@/domain';
import { plotStatusTokens } from '@/design-system';
import { useReducedMotion } from '@/hooks/useMotion';
import { RepositoryError } from '@/repositories/contracts';
import { usePreferencesStore } from '@/store/preferencesStore';

import { loadSamples } from './helpers';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};
const wrap = (ui: ReactElement) => (
  <SafeAreaProvider initialMetrics={metrics}>
    <ToastProvider>{ui}</ToastProvider>
  </SafeAreaProvider>
);
const show = (ui: ReactElement) => render(wrap(ui));

describe('Button', () => {
  it('presses, and exposes role + accessible name', async () => {
    const onPress = jest.fn();
    await show(<Button label="Continue" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled: cannot be pressed and reports disabled', async () => {
    const onPress = jest.fn();
    await show(<Button label="Save" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Save', disabled: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('loading: cannot be pressed, reports busy, and keeps its label laid out so width never jumps', async () => {
    const onPress = jest.fn();
    await show(<Button label="Save" onPress={onPress} loading />);
    const button = screen.getByRole('button', { name: 'Save', busy: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('every variant and size renders its label', async () => {
    for (const variant of ['primary', 'secondary', 'tertiary', 'danger'] as const) {
      for (const size of ['large', 'medium', 'small'] as const) {
        const label = `${variant}-${size}`;
        const { unmount } = await show(<Button label={label} variant={variant} size={size} />);
        expect(screen.getByText(label)).toBeTruthy();
        await unmount();
      }
    }
  });

  it('uses a custom accessibility label when provided', async () => {
    await show(<Button label="Call" accessibilityLabel="Call Rahul Sharma" />);
    expect(screen.getByRole('button', { name: 'Call Rahul Sharma' })).toBeTruthy();
  });
});

describe('IconButton', () => {
  it('is named for screen readers and folds an unread badge into the name', async () => {
    const Icon = ((props: object) => <Text {...props}>i</Text>) as never;
    await show(<IconButton icon={Icon} accessibilityLabel="Notifications" badgeCount={4} />);
    expect(screen.getByRole('button', { name: 'Notifications, 4 unread' })).toBeTruthy();
  });
});

describe('status components (never colour alone)', () => {
  it.each(plotStatusSchema.options)(
    'PlotStatusBadge %s shows its label and a spoken status',
    async (status: PlotStatus) => {
      await show(<PlotStatusBadge status={status} />);
      expect(screen.getByLabelText(`Status: ${plotStatusTokens[status].label}`)).toBeTruthy();
      expect(screen.getByText(plotStatusTokens[status].label)).toBeTruthy(); // uppercase is CSS-only, text is real
    },
  );

  it('PlotLegend lists all five statuses', async () => {
    await show(<PlotLegend />);
    for (const status of plotStatusSchema.options) {
      expect(screen.getByText(plotStatusTokens[status].label)).toBeTruthy();
    }
  });

  it('StatusChip exposes its label', async () => {
    await show(<StatusChip label="Overdue" tone="danger" />);
    expect(screen.getByLabelText('Overdue')).toBeTruthy();
  });

  it('UnreadBadge says "N unread" and hides at zero', async () => {
    await show(<UnreadBadge count={3} />);
    expect(screen.getByLabelText('3 unread')).toBeTruthy();
    await show(<UnreadBadge count={0} />);
    expect(screen.queryByLabelText('0 unread')).toBeNull();
  });

  it('LeadStageIndicator states the stage in words', async () => {
    await show(<LeadStageIndicator stage="VISIT" />);
    expect(screen.getByText('Visit · stage 5 of 8')).toBeTruthy();
    await show(<LeadStageIndicator stage="LOST" />);
    expect(screen.getByText('Lost')).toBeTruthy();
  });
});

describe('LeadCard', () => {
  it('shows who, what they want, stage, source and the next action', async () => {
    const { rahul, now } = await loadSamples();
    await show(<LeadCard lead={rahul} now={now} />);
    expect(screen.getByText('Rahul Sharma')).toBeTruthy();
    expect(screen.getAllByText(/₹40–55L/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/200–300 sq yd/).length).toBeGreaterThan(0);
    expect(screen.getByText('Bangalore Highway, Airport Corridor')).toBeTruthy();
    expect(screen.getByText('Meta · Real Rise campaign')).toBeTruthy();
    expect(screen.getByText('Follow up on Real Rise shortlist')).toBeTruthy();
    expect(screen.getByText('Today · 10:30 AM')).toBeTruthy();
    expect(screen.getByLabelText('Stage: Visit')).toBeTruthy();
    expect(screen.getByText('Hot')).toBeTruthy();
  });

  it('opens on card press; Call and WhatsApp fire their own handlers only', async () => {
    const { rahul, now } = await loadSamples();
    const [onPress, onCall, onWhatsApp] = [jest.fn(), jest.fn(), jest.fn()];
    await show(
      <LeadCard lead={rahul} now={now} onPress={onPress} onCall={onCall} onWhatsApp={onWhatsApp} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: /^Rahul Sharma\. Hot priority/ }));
    expect(onPress).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Call Rahul Sharma' }));
    expect(onCall).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole('button', { name: /^WhatsApp Rahul Sharma/ }));
    expect(onWhatsApp).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1); // action presses never open the card
  });

  it('never nests an interactive element inside another', async () => {
    const { rahul, now } = await loadSamples();
    await show(
      <LeadCard
        lead={rahul}
        now={now}
        onPress={jest.fn()}
        onCall={jest.fn()}
        onWhatsApp={jest.fn()}
      />,
    );
    const region = screen.getByRole('button', { name: /^Rahul Sharma\. Hot priority/ });
    expect(within(region).queryByRole('button')).toBeNull();
  });

  it('announces unread WhatsApp messages on the button', async () => {
    const { rahul, now } = await loadSamples();
    await show(<LeadCard lead={rahul} now={now} />);
    expect(screen.getByRole('button', { name: 'WhatsApp Rahul Sharma, 2 unread' })).toBeTruthy();
  });

  it('says "Overdue" in words for a slipped next action', async () => {
    const { faizan, now } = await loadSamples();
    await show(<LeadCard lead={faizan} now={now} />);
    expect(screen.getByText('Overdue · Yesterday · 6:00 PM')).toBeTruthy();
  });

  it('handles a lead with no next action and one with no budget', async () => {
    const { swathi, harish, now } = await loadSamples();
    await show(<LeadCard lead={swathi} now={now} />);
    expect(screen.getByText('No next action scheduled')).toBeTruthy();
    await show(<LeadCard lead={harish} now={now} />);
    expect(screen.getAllByText(/Budget not set/).length).toBeGreaterThan(0);
  });

  it('survives a very long name and a huge budget without dropping information', async () => {
    const { rahul, now } = await loadSamples();
    const long = {
      ...rahul,
      fullName: 'Venkata Subramanyam Raghavendra Chaudhary-Srinivasan',
      requirement: { ...rahul.requirement, budgetMin: 85_000_000, budgetMax: 320_000_000 },
    };
    await show(<LeadCard lead={long} now={now} />);
    expect(
      screen.getByText('Venkata Subramanyam Raghavendra Chaudhary-Srinivasan').props.numberOfLines,
    ).toBe(1);
    expect(screen.getAllByText(/₹8\.5–32Cr/).length).toBeGreaterThan(0);
  });
});

describe('ProjectCard', () => {
  it('shows name, location, price, sizes and live availability', async () => {
    const { realRise } = await loadSamples();
    await show(<ProjectCard project={realRise} />);
    expect(screen.getByText('Real Rise')).toBeTruthy();
    expect(screen.getByText('Bangalore Highway · Completed')).toBeTruthy();
    expect(screen.getByText('₹26.8L')).toBeTruthy();
    expect(screen.getByText('150–360 sq yd')).toBeTruthy();
    expect(screen.getByText('21 available')).toBeTruthy();
  });

  it('marks a project with no availability as sold out (text, not just colour)', async () => {
    const { realRise } = await loadSamples();
    await show(<ProjectCard project={{ ...realRise, availableUnits: 0 }} />);
    expect(screen.getByText('Sold out')).toBeTruthy();
    expect(screen.queryByText(/available/)).toBeNull();
  });

  it('has one primary action and wires its buttons without nesting them', async () => {
    const { realRise } = await loadSamples();
    const [onPress, onViewInventory, onShare] = [jest.fn(), jest.fn(), jest.fn()];
    await show(
      <ProjectCard
        project={realRise}
        onPress={onPress}
        onViewInventory={onViewInventory}
        onShare={onShare}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'View inventory' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Share Real Rise' }));
    expect(onViewInventory).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    const region = screen.getByRole('button', { name: /^Real Rise, Bangalore Highway/ });
    expect(within(region).queryByRole('button')).toBeNull();
  });
});

describe('TaskCard', () => {
  it('open: shows time, title and who it belongs to, and completes on tap', async () => {
    const { openTask, now } = await loadSamples();
    const onComplete = jest.fn();
    await show(
      <TaskCard
        task={openTask}
        now={now}
        leadName="Rahul Sharma"
        projectName="Real Rise"
        onComplete={onComplete}
      />,
    );
    expect(screen.getByText('10:30 AM')).toBeTruthy();
    expect(screen.getByText('Follow up on Real Rise shortlist')).toBeTruthy();
    expect(screen.getByText('Rahul Sharma · Real Rise')).toBeTruthy();
    const box = screen.getByRole('checkbox', {
      name: 'Mark Follow up on Real Rise shortlist complete',
    });
    expect(box.props.accessibilityState).toMatchObject({ checked: false });
    await fireEvent.press(box);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('overdue: says "Overdue" (text + icon), not just a colour', async () => {
    const { overdueTask, now } = await loadSamples();
    await show(<TaskCard task={overdueTask} now={now} leadName="Mohammed Faizan" />);
    expect(screen.getByText('Overdue')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Overdue/ })).toBeTruthy();
  });

  it('done: reads as completed and cannot be re-completed', async () => {
    const { doneTask, now } = await loadSamples();
    const onComplete = jest.fn();
    await show(<TaskCard task={doneTask} now={now} onComplete={onComplete} />);
    const box = screen.getByRole('checkbox', { name: `${doneTask.title}, completed` });
    expect(box.props.accessibilityState).toMatchObject({ checked: true });
    await fireEvent.press(box);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('can hide the day when the list is already grouped by day', async () => {
    const { openTask, now } = await loadSamples();
    await show(<TaskCard task={openTask} now={now} showDay={false} />);
    expect(screen.queryByText('Today')).toBeNull();
  });
});

describe('PlotCard', () => {
  it('describes number, status, size, facing and price in one accessible name', async () => {
    const { plot26 } = await loadSamples();
    await show(<PlotCard plot={plot26} />);
    expect(
      screen.getByRole('button', { name: 'Plot 26, Available, 240 sq yd, East facing, ₹44.1L' }),
    ).toBeTruthy();
    expect(screen.getByText('240 sq yd')).toBeTruthy();
    expect(screen.getByText('East facing')).toBeTruthy();
    expect(screen.getByText('₹44.1L')).toBeTruthy();
  });

  it('renders every status with its own label', async () => {
    const { plots } = await loadSamples();
    for (const status of plotSchemaStatuses) {
      const plot = plots.find((p) => p.status === status);
      if (!plot) throw new Error(`no ${status} plot`);
      const { unmount } = await show(<PlotCard plot={plot} />);
      expect(screen.getByLabelText(`Status: ${plotStatusTokens[status].label}`)).toBeTruthy();
      await unmount();
    }
  });

  it('exposes selection and fires onPress', async () => {
    const { plot26 } = await loadSamples();
    const onPress = jest.fn();
    await show(<PlotCard plot={plot26} selected onPress={onPress} />);
    const tile = screen.getByRole('button', { name: /Selected$/ });
    expect(tile.props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(tile);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps a large price readable on one line', async () => {
    const { plot26 } = await loadSamples();
    await show(<PlotCard plot={{ ...plot26, estimatedTotal: 1_234_567_890 }} />);
    expect(screen.getByText('₹123.46Cr').props.numberOfLines).toBe(1);
  });
});

const plotSchemaStatuses = plotStatusSchema.options;

describe('other CRM / property / communication components', () => {
  it('NextActionCard: lead, task, when, budget and three actions', async () => {
    const { rahul, openTask, now } = await loadSamples();
    await show(<NextActionCard task={openTask} lead={rahul} now={now} />);
    expect(screen.getByText('Next action')).toBeTruthy();
    expect(screen.getByText('Rahul Sharma')).toBeTruthy();
    expect(screen.getByText('Today · 10:30 AM')).toBeTruthy();
    expect(screen.getByText(/Budget ₹40–55L/)).toBeTruthy();
    for (const name of ['Call Rahul Sharma', 'WhatsApp Rahul Sharma', 'Open Rahul Sharma'])
      expect(screen.getByRole('button', { name })).toBeTruthy();
  });

  it('VisitCard: time, customer, project, status and contact actions', async () => {
    const { visit, now } = await loadSamples();
    await show(
      <VisitCard visit={visit} customerName="Rahul Sharma" projectName="Real Rise" now={now} />,
    );
    expect(screen.getByText('3:30 PM')).toBeTruthy();
    expect(screen.getByLabelText('Confirmed')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Call Rahul Sharma' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'WhatsApp Rahul Sharma' })).toBeTruthy();
  });

  it('ContactActionBar: four named actions with the unread count on WhatsApp', async () => {
    await show(<ContactActionBar unreadMessages={2} />);
    for (const name of ['Call', 'WhatsApp, 2 unread', 'Schedule', 'Note'])
      expect(screen.getByRole('button', { name })).toBeTruthy();
  });

  it('PriceSummary: preview only, never a quotation', async () => {
    const { plot26 } = await loadSamples();
    await show(<PriceSummary plot={plot26} />);
    expect(screen.getByText('Estimated total')).toBeTruthy();
    expect(screen.getByText(/not a quotation/i)).toBeTruthy();
    expect(screen.getByText('₹18,000 / sq yd')).toBeTruthy();
  });

  it('ConversationRow: unread is announced and outbound previews are prefixed', async () => {
    const { conversation, now } = await loadSamples();
    await show(
      <ConversationRow
        conversation={conversation}
        customerName="Rahul Sharma"
        projectName="Real Rise"
        now={now}
      />,
    );
    expect(
      screen.getByRole('button', { name: /Rahul Sharma, Real Rise\. 2 unread\./ }),
    ).toBeTruthy();
    expect(screen.getByText('Can you also share the cost for plot 26?')).toBeTruthy();
  });

  it('MessageBubble: rich messages are labelled and delivery state is spoken', async () => {
    const { conversation } = await loadSamples();
    const card = conversation.messages.find((m) => m.kind === 'VISIT_CONFIRMATION');
    if (!card) throw new Error('no visit confirmation');
    await show(<MessageBubble message={card} />);
    expect(screen.getByText('Visit confirmation')).toBeTruthy();
    expect(screen.getByLabelText(/Visit confirmation:.*Read$/)).toBeTruthy();
  });

  it('NotificationRow: unread state and type are spoken, not just a dot', async () => {
    const { notification, now } = await loadSamples();
    await show(<NotificationRow notification={notification} now={now} />);
    expect(screen.getByRole('button', { name: /^Unread\. Action required\./ })).toBeTruthy();
    await show(<NotificationRow notification={{ ...notification, read: true }} now={now} />);
    expect(screen.getAllByRole('button', { name: /^Action required\./ }).length).toBe(1);
  });

  it('Avatar: initials fallback and a verified announcement', async () => {
    await show(<Avatar name="K. V. Raghunath Reddy" verified />);
    expect(screen.getByText('KR')).toBeTruthy();
    expect(screen.getByLabelText('K. V. Raghunath Reddy, verified')).toBeTruthy();
  });

  it('every button in a busy composition has an accessible name', async () => {
    const s = await loadSamples();
    await show(
      <>
        <LeadCard
          lead={s.rahul}
          now={s.now}
          onPress={jest.fn()}
          onCall={jest.fn()}
          onWhatsApp={jest.fn()}
        />
        <VisitCard
          visit={s.visit}
          customerName="Rahul Sharma"
          projectName="Real Rise"
          now={s.now}
          onPress={jest.fn()}
        />
        <ProjectCard
          project={s.realRise}
          onPress={jest.fn()}
          onViewInventory={jest.fn()}
          onShare={jest.fn()}
        />
        <ContactActionBar />
        <NextActionCard task={s.openTask} lead={s.rahul} now={s.now} />
      </>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(10);
    for (const button of buttons) {
      expect(String(button.props.accessibilityLabel ?? '').length).toBeGreaterThan(0);
    }
  });
});

describe('form fields', () => {
  it('TextField: error text is shown as text (and announced), not only a red border', async () => {
    await show(
      <TextField
        label="Email"
        value="rahul@"
        errorText="Enter a valid email address."
        onChangeText={jest.fn()}
      />,
    );
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('TextField: helper text shows when there is no error; disabled is exposed', async () => {
    await show(
      <TextField label="Budget" helperText="In lakhs" disabled value="" onChangeText={jest.fn()} />,
    );
    expect(screen.getByText('In lakhs')).toBeTruthy();
    expect(screen.getByLabelText('Budget').props.editable).toBe(false);
  });

  it('PhoneField: keeps digits only, caps at 10, and shows +91', async () => {
    const onChangeText = jest.fn();
    await show(<PhoneField value="" onChangeText={onChangeText} />);
    expect(screen.getByText('+91')).toBeTruthy();
    const input = screen.getByLabelText('Mobile number');
    expect(input.props.keyboardType).toBe('phone-pad');
    await fireEvent.changeText(input, '98a76-54321 99');
    expect(onChangeText).toHaveBeenCalledWith('9876543219');
  });

  it('OTPField: digits only, completes at six, and names the field', async () => {
    const [onChange, onComplete] = [jest.fn(), jest.fn()];
    await show(<OTPField value="" onChange={onChange} onComplete={onComplete} />);
    const input = screen.getByLabelText('Verification code, 6 digits');
    await fireEvent.changeText(input, '123');
    expect(onComplete).not.toHaveBeenCalled();
    await fireEvent.changeText(input, '12a3456');
    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('OTPField: shows an error as text', async () => {
    await show(<OTPField value="12" onChange={jest.fn()} errorText="That code doesn’t match." />);
    expect(screen.getByText('That code doesn’t match.')).toBeTruthy();
  });

  it('SelectField: opens a sheet of options and reports the choice', async () => {
    const onChange = jest.fn();
    await show(
      <SelectField
        label="Facing"
        options={[
          { value: 'EAST', label: 'East facing' },
          { value: 'NORTH', label: 'North facing' },
        ]}
        onChange={onChange}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Facing, Select' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'North facing' }));
    expect(onChange).toHaveBeenCalledWith('NORTH');
  });

  it('Toggle: is a switch with a checked state', async () => {
    const onValueChange = jest.fn();
    await show(
      <Toggle
        value={false}
        onValueChange={onValueChange}
        accessibilityLabel="Push notifications"
      />,
    );
    const toggle = screen.getByRole('switch', { name: 'Push notifications' });
    expect(toggle.props.accessibilityState).toMatchObject({ checked: false });
    await fireEvent.press(toggle);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

describe('feedback states', () => {
  it('EmptyState: human copy and a working action', async () => {
    const onAction = jest.fn();
    await show(
      <EmptyState
        icon={(() => null) as never}
        title="No leads yet"
        description="New enquiries will show up here."
        actionLabel="Add a lead"
        onAction={onAction}
      />,
    );
    expect(screen.getByText('No leads yet')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Add a lead' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('RepositoryErrorState: friendly, reassuring, retryable — and never shows the raw error', async () => {
    const onRetry = jest.fn();
    await show(
      <RepositoryErrorState
        error={new RepositoryError('SERVER_ERROR', 'SECRET stack detail')}
        subject="your leads"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('Couldn’t load your leads')).toBeTruthy();
    expect(screen.getByText('Your prototype data is still safe.')).toBeTruthy();
    expect(screen.queryByText(/SECRET/)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('describes each failure in words', () => {
    expect(
      describeRepositoryError(new RepositoryError('OFFLINE', 'x'), 'your leads'),
    ).toMatchObject({ offline: true, title: 'You’re offline' });
    expect(describeRepositoryError(new RepositoryError('NOT_FOUND', 'x'), 'this lead').title).toBe(
      'Couldn’t find this lead',
    );
    expect(describeRepositoryError(new Error('boom'), 'your leads').title).toBe(
      'Couldn’t load your leads',
    );
  });

  it('ResourceBoundary: loading → skeleton, error → retry, empty → empty state, success → content', async () => {
    const resource = (status: 'loading' | 'error' | 'success', data?: string[]) => ({
      status,
      data,
      error: status === 'error' ? new RepositoryError('OFFLINE', 'x') : undefined,
      reload: jest.fn(),
    });

    const loading = await show(
      <ResourceBoundary resource={resource('loading')} subject="leads">
        {() => <AppText>content</AppText>}
      </ResourceBoundary>,
    );
    expect(screen.getByRole('progressbar')).toBeTruthy();
    await loading.unmount();

    const error = await show(
      <ResourceBoundary resource={resource('error')} subject="leads">
        {() => <AppText>content</AppText>}
      </ResourceBoundary>,
    );
    expect(screen.getByText('You’re offline')).toBeTruthy();
    await error.unmount();

    const empty = await show(
      <ResourceBoundary
        resource={resource('success', [])}
        subject="leads"
        isEmpty={(d) => d.length === 0}
        empty={<AppText>nothing here</AppText>}
      >
        {() => <AppText>content</AppText>}
      </ResourceBoundary>,
    );
    expect(screen.getByText('nothing here')).toBeTruthy();
    await empty.unmount();

    await show(
      <ResourceBoundary resource={resource('success', ['a'])} subject="leads">
        {(d) => <AppText>{`content ${d.length}`}</AppText>}
      </ResourceBoundary>,
    );
    expect(screen.getByText('content 1')).toBeTruthy();
  });

  it('ConfirmationSheet: shows a destructive confirmation and reports the choice', async () => {
    const [onConfirm, onClose] = [jest.fn(), jest.fn()];
    await show(
      <ConfirmationSheet
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete this lead?"
        message="Its timeline will be removed."
        confirmLabel="Delete lead"
        destructive
      />,
    );
    expect(screen.getByText('Delete this lead?')).toBeTruthy();
    expect(screen.getByText('Its timeline will be removed.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Delete lead' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ConfirmationSheet: renders nothing while closed', async () => {
    await show(
      <ConfirmationSheet
        visible={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Delete this lead?"
      />,
    );
    expect(screen.queryByText('Delete this lead?')).toBeNull();
  });

  it('Toast: announces a concise message from anywhere via useToast', async () => {
    function Trigger() {
      const toast = useToast();
      return (
        <Button
          label="Complete"
          onPress={() => toast.show({ tone: 'success', message: 'Visit marked complete.' })}
        />
      );
    }
    await show(<Trigger />);
    expect(screen.queryByText('Visit marked complete.')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Complete' }));
    expect(screen.getByText('Visit marked complete.')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('AppTabBar', () => {
  const names = ['home', 'leads', 'projects', 'tasks', 'inbox'];
  const routes = names.map((name) => ({ key: `${name}-key`, name }));
  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: {
          title: route.name[0]?.toUpperCase() + route.name.slice(1),
          tabBarIcon: () => null,
          tabBarBadge: route.name === 'inbox' ? 4 : undefined,
        },
      },
    ]),
  );

  const renderBar = (index: number) => {
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
    const utils = show(
      <AppTabBar
        state={{ index, routes } as never}
        descriptors={descriptors as never}
        navigation={navigation as never}
        insets={metrics.insets}
      />,
    );
    return { navigation, utils };
  };

  it('has exactly five tabs in the specified order, with the unread count spoken', async () => {
    const { utils } = renderBar(0);
    await utils;
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      'Home',
      'Leads',
      'Projects',
      'Tasks',
      'Inbox, 4 unread',
    ]);
  });

  it('marks only the focused tab as selected', async () => {
    await renderBar(1).utils;
    expect(screen.getByRole('tab', { name: 'Leads', selected: true })).toBeTruthy();
    expect(screen.getAllByRole('tab', { selected: true })).toHaveLength(1);
  });

  it('navigates on a tab press but not when re-pressing the focused tab', async () => {
    const { navigation, utils } = renderBar(1);
    await utils;
    await fireEvent.press(screen.getByRole('tab', { name: 'Tasks' }));
    expect(navigation.navigate).toHaveBeenCalledWith('tasks', undefined);
    navigation.navigate.mockClear();
    await fireEvent.press(screen.getByRole('tab', { name: 'Leads' }));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});

describe('Reduce Motion', () => {
  afterEach(async () => {
    await act(async () => usePreferencesStore.getState().setReduceMotion('system'));
  });

  it('follows the preference override, and the system setting by default', async () => {
    const { result } = await renderHook(() => useReducedMotion());
    expect(result.current).toBe(false); // system default in tests

    await act(async () => usePreferencesStore.getState().setReduceMotion('on'));
    expect(result.current).toBe(true);
    await act(async () => usePreferencesStore.getState().setReduceMotion('off'));
    expect(result.current).toBe(false);
  });
});

describe('disabled dimming', () => {
  it('dims a disabled press target by default, but not when the caller draws the disabled look', async () => {
    const dimmed = await show(
      <PressableScale disabled>
        <Text>dim me</Text>
      </PressableScale>,
    );
    expect(JSON.stringify(screen.toJSON())).toContain('"opacity":0.45');
    await dimmed.unmount();

    await show(
      <PressableScale disabled dimWhenDisabled={false}>
        <Text>leave me</Text>
      </PressableScale>,
    );
    expect(JSON.stringify(screen.toJSON())).not.toContain('"opacity":0.45');
  });

  it('PipelineSummary (display-only) is fully legible: every stage count is spoken and not dimmed', async () => {
    await show(<PipelineSummary counts={{ NEW: 2, VISIT: 3, BOOKING: 1 }} />);
    expect(screen.getByLabelText('New, 2 leads')).toBeTruthy();
    expect(screen.getByLabelText('Visit, 3 leads')).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain('"opacity":0.45');
  });
});
