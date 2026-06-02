import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, Star, Crown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface LeaderboardUser {
  id: string;
  name: string;
  department?: string;
  year?: string;
  rollNo?: string;
  totalPoints: number;
}

interface LeaderboardListProps {
  leaderboard: LeaderboardUser[];
  currentUserId?: string;
  showFilters?: boolean;
  maxItems?: number;
}

const categories = [
  { value: "", label: "Global" },
  { value: "technical", label: "Technical" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts & Culture" },
  { value: "leadership", label: "Leadership" },
  { value: "volunteering", label: "Volunteering" },
  { value: "internship", label: "Internship" },
  { value: "placement", label: "Placement" },
];

export function LeaderboardList({ 
  leaderboard, 
  currentUserId, 
  showFilters = false,
  maxItems = 5 
}: LeaderboardListProps) {
  const [selectedCategory, setSelectedCategory] = useState("");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case 2:
        return "bg-gray-100 border-gray-300 text-gray-800";
      case 3:
        return "bg-amber-100 border-amber-300 text-amber-800";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  const displayedLeaderboard = leaderboard.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle data-testid="leaderboard-title">Leaderboard</CardTitle>
          {showFilters && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32" data-testid="select-leaderboard-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedLeaderboard.length > 0 ? (
          <div className="space-y-3">
            {displayedLeaderboard.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === currentUserId;
              
              return (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isCurrentUser 
                      ? "bg-primary/5 border border-primary/20" 
                      : rank <= 3 
                        ? `${getRankBadgeColor(rank).split(' ')[0]}/10 border ${getRankBadgeColor(rank).split(' ')[1]}/20`
                        : "hover:bg-muted/50"
                  }`}
                  data-testid={`leaderboard-item-${rank}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getRankBadgeColor(rank)}`}>
                    {getRankIcon(rank)}
                  </div>
                  
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted text-sm">
                      {user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium text-sm ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                        {user.name}
                        {isCurrentUser && " (You)"}
                      </p>
                      {rank <= 3 && (
                        <Badge variant="secondary" className="text-xs">
                          {rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "3rd Place"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.department}
                      {user.year && ` • ${user.year} Year`}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {user.totalPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-leaderboard">
              No rankings available yet.
            </p>
          </div>
        )}

        {leaderboard.length > maxItems && (
          <div className="mt-4 text-center">
            <Link href="/leaderboard">
              <Button variant="ghost" className="w-full text-primary hover:underline" data-testid="link-full-leaderboard">
                View Full Leaderboard
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
