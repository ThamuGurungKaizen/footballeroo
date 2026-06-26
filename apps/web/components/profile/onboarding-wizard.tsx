'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export interface OnboardingData {
  name: string;
  dietary: string[];
  favouriteTeams: string[];
  cuisinePreferences: string[];
}

const DIETARY_OPTIONS = [
  'Vegan', 'Vegetarian', 'Pescatarian', 'Halal',
  'Kosher', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
];

const TEAM_OPTIONS = [
  'England', 'Brazil', 'Germany', 'Spain', 'Italy',
  'France', 'Argentina', 'Japan', 'Nigeria', 'Mexico',
  'South Korea', 'Portugal', 'Netherlands', 'Morocco',
  'United States', 'Colombia', 'Turkey', 'Australia',
];

const CUISINE_OPTIONS = [
  'Italian', 'Spanish', 'Japanese', 'Mexican', 'Indian',
  'French', 'Brazilian', 'Korean', 'Moroccan', 'Turkish',
  'British', 'Nigerian', 'American', 'Argentine', 'Thai',
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);

  const steps = [
    { title: 'Welcome', subtitle: 'Tell us your name' },
    { title: 'Dietary Needs', subtitle: 'We\'ll never show dishes that don\'t fit' },
    { title: 'Your Teams', subtitle: 'We\'ll prioritise their cuisines' },
    { title: 'Cuisine Preferences', subtitle: 'Select cuisines you love' },
  ];

  const toggleItem = (
    item: string,
    list: string[],
    setList: (l: string[]) => void,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleComplete = () => {
    onComplete({
      name,
      dietary: dietary.map((d) => d.toLowerCase().replace('-', '_')),
      favouriteTeams: teams,
      cuisinePreferences: cuisines.map((c) => c.toLowerCase()),
    });
  };

  const canProceed = step === 0 ? name.length > 0 : true;

  return (
    <div className="mx-auto max-w-lg">
      {/* Progress bar */}
      <div className="mb-8 flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step header */}
      <h2 className="text-2xl font-bold">{steps[step].title}</h2>
      <p className="mt-1 text-muted-foreground">{steps[step].subtitle}</p>

      {/* Step content */}
      <div className="mt-6">
        {step === 0 && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border bg-background px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        )}

        {step === 1 && (
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => toggleItem(option, dietary, setDietary)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  dietary.includes(option)
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {dietary.includes(option) && <Check className="mr-1 inline h-3 w-3" />}
                {option}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {TEAM_OPTIONS.map((team) => (
              <button
                key={team}
                onClick={() => toggleItem(team, teams, setTeams)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  teams.includes(team)
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {teams.includes(team) && <Check className="mr-1 inline h-3 w-3" />}
                {team}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => toggleItem(cuisine, cuisines, setCuisines)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  cuisines.includes(cuisine)
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {cuisines.includes(cuisine) && <Check className="mr-1 inline h-3 w-3" />}
                {cuisine}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
