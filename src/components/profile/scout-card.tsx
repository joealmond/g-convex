'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Star } from 'lucide-react';
import { BADGES } from '@/lib/gamification';
import type { UserProfile } from '@/lib/types';

interface ScoutCardProps {
  profile: UserProfile | null;
  className?: string;
}

/**
 * Displays user's Scout Points, badges, and streak information
 */
export function ScoutCard({ profile, className }: ScoutCardProps) {
  if (!profile) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">Sign in to track your Scout Points!</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate level based on points (every 100 points = 1 level)
  const level = Math.floor(profile.points / 100) + 1;
  const pointsToNextLevel = 100 - (profile.points % 100);
  const progressPercent = (profile.points % 100);

  // Get badge details for earned badges
  const earnedBadges = profile.badges.map(badgeId => 
    BADGES.find(b => b.id === badgeId)
  ).filter(Boolean);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Scout Profile</span>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            Lvl {level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points Display */}
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{profile.points}</p>
          <p className="text-sm text-muted-foreground">Scout Points</p>
        </div>

        {/* Progress to next level */}
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Level {level}</span>
            <span>{pointsToNextLevel} pts to Level {level + 1}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        {profile.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-orange-500/10 p-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-500">
              {profile.currentStreak} day streak!
            </span>
          </div>
        )}

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Badges ({earnedBadges.length}/{BADGES.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((badge) => (
                <div
                  key={badge!.id}
                  className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1"
                  title={badge!.description}
                >
                  <span>{badge!.icon}</span>
                  <span className="text-xs font-medium">{badge!.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded bg-secondary p-2">
            <p className="font-bold">{profile.totalVotes}</p>
            <p className="text-muted-foreground">Total Votes</p>
          </div>
          <div className="rounded bg-secondary p-2">
            <p className="font-bold">{profile.newProductVotes}</p>
            <p className="text-muted-foreground">Discoveries</p>
          </div>
          <div className="rounded bg-secondary p-2">
            <p className="font-bold">{profile.storesTagged.length}</p>
            <p className="text-muted-foreground">Stores Tagged</p>
          </div>
          <div className="rounded bg-secondary p-2">
            <p className="font-bold">{profile.longestStreak}</p>
            <p className="text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
