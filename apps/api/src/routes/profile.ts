import { Router } from 'express';
import type { ApiResponse } from '@footballeroo/shared';
import { getPersonalisedRecommendations, getSurpriseDish } from '../services/recommendations';
import type { UserContext } from '../services/recommendations/recommendation-engine';

const router = Router();

// In-memory user store (production would use Prisma/DB)
const userProfiles = new Map<string, UserProfileData>();

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  dietary: string[];
  favouriteTeams: string[];
  cuisinePreferences: string[];
  addresses: Address[];
  orderHistory: OrderHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  isDefault: boolean;
}

interface OrderHistoryItem {
  orderId: string;
  dishName: string;
  cuisine: string;
  orderedAt: string;
}

/**
 * GET /api/profile
 * Get the current user's profile
 */
router.get('/', (req, res) => {
  // In production, get userId from auth middleware
  const userId = req.headers['x-user-id'] as string || 'demo-user';

  let profile = userProfiles.get(userId);

  if (!profile) {
    // Create a default profile
    profile = createDefaultProfile(userId);
    userProfiles.set(userId, profile);
  }

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * PUT /api/profile
 * Update the current user's profile
 */
router.put('/', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const updates = req.body;

  let profile = userProfiles.get(userId);
  if (!profile) {
    profile = createDefaultProfile(userId);
  }

  // Apply updates
  if (updates.name !== undefined) profile.name = updates.name;
  if (updates.email !== undefined) profile.email = updates.email;
  if (updates.dietary !== undefined) profile.dietary = updates.dietary;
  if (updates.favouriteTeams !== undefined) profile.favouriteTeams = updates.favouriteTeams;
  if (updates.cuisinePreferences !== undefined) profile.cuisinePreferences = updates.cuisinePreferences;
  profile.updatedAt = new Date().toISOString();

  userProfiles.set(userId, profile);

  res.json({
    success: true,
    data: profile,
    message: 'Profile updated successfully',
  });
});

/**
 * POST /api/profile/onboarding
 * Complete the onboarding flow (first-time setup)
 */
router.post('/onboarding', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const { name, email, dietary, favouriteTeams, cuisinePreferences } = req.body;

  const profile: UserProfileData = {
    id: userId,
    email: email || '',
    name: name || '',
    dietary: dietary || [],
    favouriteTeams: favouriteTeams || [],
    cuisinePreferences: cuisinePreferences || [],
    addresses: [],
    orderHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  userProfiles.set(userId, profile);

  res.json({
    success: true,
    data: profile,
    message: 'Onboarding complete! Your preferences are saved.',
  });
});

/**
 * GET /api/profile/recommendations
 * Get personalised dish recommendations
 */
router.get('/recommendations', async (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const count = parseInt(req.query.count as string) || 3;

  const profile = userProfiles.get(userId) || createDefaultProfile(userId);

  const userContext: UserContext = {
    dietary: profile.dietary as any[],
    favouriteTeams: profile.favouriteTeams,
    cuisinePreferences: profile.cuisinePreferences,
    orderHistory: profile.orderHistory.map((o) => o.cuisine),
  };

  try {
    const recommendations = await getPersonalisedRecommendations(userContext, count);

    res.json({
      success: true,
      data: recommendations,
      message: `${recommendations.length} personalised recommendations`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Recommendation failed',
    });
  }
});

/**
 * POST /api/profile/surprise
 * Generate a personalised "Surprise Me" dish
 */
router.post('/surprise', async (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';

  const profile = userProfiles.get(userId) || createDefaultProfile(userId);

  const userContext: UserContext = {
    dietary: profile.dietary as any[],
    favouriteTeams: profile.favouriteTeams,
    cuisinePreferences: profile.cuisinePreferences,
    orderHistory: profile.orderHistory.map((o) => o.cuisine),
  };

  try {
    const dish = await getSurpriseDish(userContext);

    if (!dish) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate surprise dish',
      });
      return;
    }

    res.json({
      success: true,
      data: dish,
      message: `Surprise dish generated: "${dish.name}"`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Surprise generation failed',
    });
  }
});

/**
 * GET /api/profile/orders
 * Get user's order history
 */
router.get('/orders', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const profile = userProfiles.get(userId);

  res.json({
    success: true,
    data: profile?.orderHistory || [],
    message: `${profile?.orderHistory.length || 0} past orders`,
  });
});

/**
 * POST /api/profile/addresses
 * Add a delivery address
 */
router.post('/addresses', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const { label, line1, line2, city, postcode, isDefault } = req.body;

  let profile = userProfiles.get(userId);
  if (!profile) {
    profile = createDefaultProfile(userId);
  }

  const address: Address = {
    id: `addr-${Date.now()}`,
    label: label || 'Home',
    line1: line1 || '',
    line2,
    city: city || 'London',
    postcode: postcode || '',
    isDefault: isDefault || profile.addresses.length === 0,
  };

  // If new address is default, unset others
  if (address.isDefault) {
    profile.addresses = profile.addresses.map((a) => ({ ...a, isDefault: false }));
  }

  profile.addresses.push(address);
  profile.updatedAt = new Date().toISOString();
  userProfiles.set(userId, profile);

  res.json({
    success: true,
    data: address,
    message: 'Address added',
  });
});

/**
 * DELETE /api/profile/addresses/:id
 * Remove a delivery address
 */
router.delete('/addresses/:id', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const { id } = req.params;

  const profile = userProfiles.get(userId);
  if (!profile) {
    res.status(404).json({ success: false, error: 'Profile not found' });
    return;
  }

  profile.addresses = profile.addresses.filter((a) => a.id !== id);
  profile.updatedAt = new Date().toISOString();
  userProfiles.set(userId, profile);

  res.json({
    success: true,
    message: 'Address removed',
  });
});

// --- Helper ---

function createDefaultProfile(userId: string): UserProfileData {
  return {
    id: userId,
    email: '',
    name: '',
    dietary: [],
    favouriteTeams: [],
    cuisinePreferences: [],
    addresses: [],
    orderHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export { router as profileRouter };
