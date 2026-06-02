import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/stats-cards";
import { UploadAchievementForm } from "@/components/upload-achievement-form";
import { AchievementCard } from "@/components/achievement-card";
import { LeaderboardList } from "@/components/leaderboard-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Users, Code, Target } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/achievements", { userId: user?.id }],
    enabled: !!user,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard", { limit: 5 }],
    enabled: !!user,
  });

  const recentAchievements = achievements.slice(0, 3);
  const pendingCount = userAchievements.filter(a => a.status === "pending").length;
  const approvedCount = userAchievements.filter(a => a.status === "approved").length;
  const currentRank = leaderboard.findIndex(u => u.id === user?.id) + 1;

  // Calculate progress to next badge
  const totalPoints = user?.totalPoints || 0;
  const nextBadgeThreshold = 1000; // Diamond badge
  const progressPercentage = Math.min((totalPoints / nextBadgeThreshold) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your achievements and climb the leaderboard
              </p>
            </div>
            <UploadAchievementForm trigger={
              <Button className="bg-primary text-primary-foreground" data-testid="button-add-achievement">
                <Trophy className="mr-2 h-4 w-4" />
                Add Achievement
              </Button>
            } />
          </div>

          <StatsCards 
            totalPoints={totalPoints}
            achievementCount={approvedCount}
            rank={currentRank}
            pendingCount={pendingCount}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Achievements */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Achievements</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="link-view-all-achievements">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement}
                      showActions={false}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground" data-testid="text-no-achievements">
                      No achievements yet. Start by uploading your first achievement!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <LeaderboardList leaderboard={leaderboard} currentUserId={user?.id} />
          </div>
        </div>

        {/* Bottom Grid - Badges & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {totalPoints >= 500 && (
                  <div className="text-center p-4 bg-muted/30 rounded-lg" data-testid="badge-gold">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Trophy className="text-white h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Gold Badge</p>
                    <p className="text-xs text-muted-foreground">500+ Points</p>
                  </div>
                )}
                {userAchievements.filter(a => a.category === "technical" && a.status === "approved").length >= 3 && (
                  <div className="text-center p-4 bg-muted/30 rounded-lg" data-testid="badge-tech-hero">
                    <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Code className="text-white h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Tech Hero</p>
                    <p className="text-xs text-muted-foreground">3+ Tech Wins</p>
                  </div>
                )}
                {userAchievements.filter(a => a.category === "leadership" && a.status === "approved").length >= 1 && (
                  <div className="text-center p-4 bg-muted/30 rounded-lg" data-testid="badge-leader">
                    <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Users className="text-white h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Leader</p>
                    <p className="text-xs text-muted-foreground">Leadership Role</p>
                  </div>
                )}
                {(totalPoints < 500 && userAchievements.filter(a => a.category === "technical" && a.status === "approved").length < 3 && userAchievements.filter(a => a.category === "leadership" && a.status === "approved").length < 1) && (
                  <div className="col-span-full text-center py-8">
                    <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground" data-testid="text-no-badges">
                      Keep earning achievements to unlock badges!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress to Next Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Progress to Diamond</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Current Progress</span>
                  <span className="text-sm text-muted-foreground" data-testid="text-points-progress">
                    {totalPoints} / {nextBadgeThreshold} pts
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {nextBadgeThreshold - totalPoints} points to Diamond Badge
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Suggested Activities:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-primary" />
                    <span>Win a major hackathon (+50 pts)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-secondary" />
                    <span>Complete certification course (+30 pts)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-accent" />
                    <span>Lead a major project (+40 pts)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
