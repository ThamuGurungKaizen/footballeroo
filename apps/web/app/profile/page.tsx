'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      const json = await res.json();
      if (json.success && json.data) {
        setName(json.data.name || '');
        setEmail(json.data.email || '');
        setDietary(json.data.dietary || []);
        setTeams(json.data.favouriteTeams || []);
        setCuisines(json.data.cuisinePreferences || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, dietary,
          favouriteTeams: teams,
          cuisinePreferences: cuisines,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const toggle = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-xl border bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your preferences for personalised recommendations
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Personal Info */}
        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Personal Info</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        {/* Dietary */}
        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Dietary Restrictions</h2>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll filter the menu for you</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => toggle(opt.toLowerCase().replace('-', '_'), dietary, setDietary)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                  dietary.includes(opt.toLowerCase().replace('-', '_'))
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'hover:border-primary/50'
                }`}>{opt}</button>
            ))}
          </div>
        </section>

        {/* Teams */}
        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Favourite Teams</h2>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll prioritise their cuisines</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TEAM_OPTIONS.map((team) => (
              <button key={team} onClick={() => toggle(team, teams, setTeams)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                  teams.includes(team)
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'hover:border-primary/50'
                }`}>{team}</button>
            ))}
          </div>
        </section>

        {/* Cuisines */}
        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Cuisine Preferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select cuisines you love</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <button key={c} onClick={() => toggle(c.toLowerCase(), cuisines, setCuisines)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                  cuisines.includes(c.toLowerCase())
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'hover:border-primary/50'
                }`}>{c}</button>
            ))}
          </div>
        </section>
      </div>

      {/* Save */}
      <div className="mt-8 flex justify-end">
        <button onClick={saveProfile} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
