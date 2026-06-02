import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard", { category: selectedCategory || undefined, limit: 50 }],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-sm font-bold">{rank}</span>;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-leaderboard-title">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you rank among your peers across different categories
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rankings</CardTitle>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="w-16 h-4 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((participant, index) => {
                  const rank = index + 1;
                  const isCurrentUser = participant.id === user?.id;
                  
                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center space-x-4 p-4 border rounded-lg transition-colors ${
                        isCurrentUser 
                          ? "bg-primary/5 border-primary/20" 
                          : rank <= 3 
                            ? `${getRankBadgeColor(rank).replace('text-', 'bg-').replace('border-', 'border-').replace('bg-', 'bg-').split(' ')[0]}/10 ${getRankBadgeColor(rank).replace('text-', 'border-').replace('border-', 'border-').replace('bg-', 'border-').split(' ')[1]}/20`
                            : "border-border hover:bg-muted/50"
                      }`}
                      data-testid={`leaderboard-item-${rank}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getRankBadgeColor(rank)}`}>
                        {getRankIcon(rank)}
                      </div>
                      
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-muted">
                          {participant.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium text-sm ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                            {participant.name}
                            {isCurrentUser && " (You)"}
                          </p>
                          {rank <= 3 && (
                            <Badge variant="secondary" className="text-xs">
                              {rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "3rd Place"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {participant.department}
                          {participant.year && ` • ${participant.year} Year`}
                          {participant.rollNo && ` • ${participant.rollNo}`}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold text-sm ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                          {participant.totalPoints || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground" data-testid="text-no-rankings">
                  No rankings available for this category yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
