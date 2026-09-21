import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, IconButton, type ButtonSize, type ButtonVariant } from '@/components/buttons';
import {
  ChoiceChip,
  FilterChip,
  LeadPriorityChip,
  LeadStageChip,
  StatusChip,
} from '@/components/chips';
import {
  DateField,
  OTPField,
  PhoneField,
  SearchField,
  SelectField,
  TextArea,
  TextField,
  TimeField,
} from '@/components/forms';
import { PlotStatusBadge } from '@/components/domain';
import { Icon } from '@/components/primitives';
import { space } from '@/design-system';
import { leadPrioritySchema, leadStageSchema, plotStatusSchema } from '@/domain';

import { ShowcaseSection, Specimen } from '../ShowcaseSection';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger'];
const SIZES: ButtonSize[] = ['large', 'medium', 'small'];

export function Controls() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('98765');
  const [otp, setOtp] = useState('123');
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [facing, setFacing] = useState<'EAST' | 'NORTH' | undefined>('EAST');
  const [day, setDay] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>('15:30');
  const [filter, setFilter] = useState('ALL');
  const [choices, setChoices] = useState<string[]>(['EAST']);

  return (
    <>
      <ShowcaseSection
        title="Buttons"
        note="One Primary per screen. Every button is tactile: spring scale, surface change, optional haptic."
      >
        {VARIANTS.map((variant) => (
          <Specimen key={variant} label={variant}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: space[8],
                alignItems: 'center',
              }}
            >
              {SIZES.map((size) => (
                <Button
                  key={size}
                  label={size === 'large' ? 'Continue' : size === 'medium' ? 'Open lead' : 'Share'}
                  variant={variant}
                  size={size}
                />
              ))}
            </View>
          </Specimen>
        ))}
        <Specimen label="With icon · disabled · loading (tap to load)">
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8], alignItems: 'center' }}
          >
            <Button label="Add lead" icon={Plus} variant="secondary" size="medium" />
            <Button label="Delete lead" icon={Trash2} variant="danger" size="medium" />
            <Button label="Disabled" disabled size="medium" />
            <Button
              label="Save"
              size="medium"
              loading={loading}
              onPress={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1600);
              }}
            />
          </View>
        </Specimen>
        <Specimen label="Full width">
          <Button label="Create cost preview" fullWidth />
        </Specimen>
        <Specimen label="Icon buttons (44×44) · plain, filled, outline, badge, disabled">
          <View style={{ flexDirection: 'row', gap: space[8] }}>
            <IconButton icon={Phone} accessibilityLabel="Call" />
            <IconButton icon={MessageCircle} accessibilityLabel="WhatsApp" variant="filled" />
            <IconButton icon={Phone} accessibilityLabel="Call" variant="outline" />
            <IconButton icon={Bell} accessibilityLabel="Notifications" badgeCount={4} />
            <IconButton icon={Phone} accessibilityLabel="Call" variant="outline" disabled />
          </View>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Form fields"
        note="Idle · focused · filled · error · disabled. Errors always carry text and an icon."
      >
        <TextField label="Full name" placeholder="Customer name" />
        <TextField label="Filled" value="Rahul Sharma" onChangeText={() => undefined} />
        <TextField
          label="Email"
          value="rahul@"
          errorText="Enter a valid email address."
          onChangeText={() => undefined}
        />
        <TextField
          label="Disabled"
          value="Prototype Hold"
          disabled
          onChangeText={() => undefined}
        />
        <TextField
          label="With helper"
          placeholder="Budget"
          helperText="Enter the maximum budget in lakhs."
          leftIcon={Clock}
        />
        <PhoneField
          value={phone}
          onChangeText={setPhone}
          helperText="We’ll ask for a code on the next step."
        />
        <PhoneField
          value="123"
          onChangeText={() => undefined}
          errorText="Enter a valid 10-digit mobile number."
        />
        <OTPField value={otp} onChange={setOtp} />
        <OTPField
          value="12"
          onChange={() => undefined}
          errorText="That code doesn’t match. Check it and try again."
        />
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search leads, projects, plots"
        />
        <TextArea
          label="Notes"
          placeholder="What did the customer say?"
          value={notes}
          onChangeText={setNotes}
          maxLength={200}
        />
        <SelectField
          label="Facing"
          options={[
            { value: 'EAST', label: 'East facing', description: 'Preferred for Vastu' },
            { value: 'NORTH', label: 'North facing' },
          ]}
          value={facing}
          onChange={setFacing}
        />
        <DateField value={day} onChange={setDay} />
        <TimeField value={time} onChange={setTime} />
      </ShowcaseSection>

      <ShowcaseSection
        title="Chips"
        note="Filter chips select; status chips inform. Status is always icon + label + tone."
      >
        <Specimen label="Filter chips">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {['ALL', 'NEW', 'HOT', 'FOLLOW-UP'].map((key) => (
              <FilterChip
                key={key}
                label={
                  key === 'ALL'
                    ? 'All'
                    : key === 'NEW'
                      ? 'New'
                      : key === 'HOT'
                        ? 'Hot'
                        : 'Follow-up'
                }
                count={key === 'HOT' ? 5 : undefined}
                selected={filter === key}
                onPress={() => setFilter(key)}
              />
            ))}
          </View>
        </Specimen>
        <Specimen label="Choice chips (multi-select)">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {['EAST', 'NORTH', 'WEST'].map((key) => (
              <ChoiceChip
                key={key}
                label={`${key[0]}${key.slice(1).toLowerCase()} facing`}
                selected={choices.includes(key)}
                onPress={() =>
                  setChoices((current) =>
                    current.includes(key) ? current.filter((c) => c !== key) : [...current, key],
                  )
                }
              />
            ))}
          </View>
        </Specimen>
        <Specimen label="Lead priority">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {leadPrioritySchema.options.map((priority) => (
              <LeadPriorityChip key={priority} priority={priority} />
            ))}
          </View>
        </Specimen>
        <Specimen label="Lead stage">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {leadStageSchema.options.map((stage) => (
              <LeadStageChip key={stage} stage={stage} />
            ))}
          </View>
        </Specimen>
        <Specimen label="Plot status (text + icon + tone)">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {plotStatusSchema.options.map((status) => (
              <PlotStatusBadge key={status} status={status} size="md" />
            ))}
          </View>
        </Specimen>
        <Specimen label="Generic status chips">
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8], alignItems: 'center' }}
          >
            <StatusChip label="Overdue" tone="danger" icon={AlertCircle} />
            <StatusChip label="Follow-up due" tone="warning" icon={Clock} />
            <StatusChip label="Confirmed" tone="success" icon={Check} />
            <StatusChip label="Draft" />
            <Icon icon={Check} tone="secondary" />
          </View>
        </Specimen>
      </ShowcaseSection>
    </>
  );
}
