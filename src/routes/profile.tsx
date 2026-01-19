import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Loader2, MapPin, Trophy, Zap } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
    const { data: user, isLoading } = useQuery(convexQuery(api.users.current, {}))

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    if (!user) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                <p>You need to be logged in to view your scout profile.</p>
            </div>
        )
    }

    const stats = user.profile ? {
        ...user.profile,
        badges: user.profile.badges
    } : {
        points: 0,
        badges: [] as Array<string>,
        currentStreak: 0,
        longestStreak: 0,
        totalVotes: 0
    }

    // Badge Definitions (Mirroring backend manually for presentation)
    // Ideally this comes from a shared constant or backend query
    const BADGES = [
        { id: 'first_scout', name: 'First Scout', icon: '🌱' },
        { id: 'trailblazer', name: 'Trailblazer', icon: '🚀' },
        { id: 'location_pro', name: 'Location Pro', icon: '📍' },
        { id: 'store_hunter', name: 'Store Hunter', icon: '🛒' },
        { id: 'century_scout', name: 'Century Scout', icon: '💯' },
        { id: 'streak_master', name: 'Streak Master', icon: '🔥' },
    ]

    return (
        <div className="container mx-auto p-4 space-y-8 max-w-4xl">
            <div className="flex items-center gap-4">
                {user.image && <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full border-2 border-primary" />}
                <div>
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.points}</div>
                        <p className="text-xs text-muted-foreground">Scout Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Zap className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.currentStreak} Days</div>
                        <p className="text-xs text-muted-foreground">Best: {stats.longestStreak}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalVotes}</div>
                        <p className="text-xs text-muted-foreground">Contributions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {BADGES.map(badge => {
                            const isUnlocked = stats.badges.includes(badge.id)
                            return (
                                <div key={badge.id} 
                                     className={`flex flex-col items-center p-4 rounded-lg border w-32 text-center transition-all ${isUnlocked ? 'bg-primary/10 border-primary' : 'opacity-40 grayscale'}`}>
                                    <div className="text-4xl mb-2">{badge.icon}</div>
                                    <Badge variant={isUnlocked ? "default" : "outline"} className="mb-1">{badge.name}</Badge>
                                    {!isUnlocked && <div className="text-xs mt-1 text-muted-foreground">Locked</div>}
                                </div>
                            )
                        })}
                        {stats.badges.length === 0 && <p className="text-muted-foreground">Start voting to earn badges!</p>}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Level Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Current Level</span>
                        <span>{stats.points} / 1000 XP</span>
                    </div>
                     <Progress value={(stats.points % 1000) / 10} className="w-full" />
                     <p className="text-xs text-muted-foreground">Get to 1000 points to verify as an Elite Scout.</p>
                </CardContent>
            </Card>
        </div>
    )
}
