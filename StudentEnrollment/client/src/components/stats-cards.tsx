import { Card, CardContent } from "@/components/ui/card";
import { Star, Medal, TrendingUp, Clock } from "lucide-react";

interface StatsCardsProps {
  totalPoints: number;
  achievementCount: number;
  rank: number;
  pendingCount: number;
}

export function StatsCards({ totalPoints, achievementCount, rank, pendingCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Points</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-points">
                {totalPoints}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Star className="text-primary h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-secondary text-sm">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Keep earning!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Achievements</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-achievements">
                {achievementCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Medal className="text-secondary h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-secondary text-sm">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Verified achievements</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Rank</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-rank">
                {rank > 0 ? `#${rank}` : "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-accent h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-secondary text-sm">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Global ranking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-pending">
                {pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-yellow-600 text-sm">
              <Clock className="mr-1 h-3 w-3" />
              <span>Awaiting review</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
