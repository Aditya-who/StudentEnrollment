import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { UploadAchievementForm } from "@/components/upload-achievement-form";
import { AchievementCard } from "@/components/achievement-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Filter, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const categories = [
  { value: "", label: "All Categories" },
  { value: "technical", label: "Technical" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts & Culture" },
  { value: "leadership", label: "Leadership" },
  { value: "volunteering", label: "Volunteering" },
  { value: "internship", label: "Internship" },
  { value: "placement", label: "Placement" },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: allAchievements = [], isLoading: allLoading } = useQuery({
    queryKey: ["/api/achievements", { category: selectedCategory || undefined }],
  });

  const { data: myAchievements = [], isLoading: myLoading } = useQuery({
    queryKey: ["/api/achievements", { userId: user?.id, category: selectedCategory || undefined }],
    enabled: !!user,
  });

  const achievements = activeTab === "all" ? allAchievements : myAchievements;
  const isLoading = activeTab === "all" ? allLoading : myLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-secondary text-secondary-foreground">Verified</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory && achievement.category !== selectedCategory) return false;
    return true;
  });

  const pendingCount = myAchievements.filter(a => a.status === "pending").length;
  const approvedCount = myAchievements.filter(a => a.status === "approved").length;
  const rejectedCount = myAchievements.filter(a => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-achievements-title">
                Achievements
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage your achievements and see what others have accomplished
              </p>
            </div>
            <UploadAchievementForm trigger={
              <Button className="bg-primary text-primary-foreground" data-testid="button-upload-achievement">
                <Plus className="mr-2 h-4 w-4" />
                Upload Achievement
              </Button>
            } />
          </div>

          {/* Stats Summary */}
          {activeTab === "my" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-lg font-semibold" data-testid="text-approved-count">{approvedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-lg font-semibold" data-testid="text-pending-count">{pendingCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-lg font-semibold" data-testid="text-rejected-count">{rejectedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-all-achievements">All Achievements</TabsTrigger>
                  <TabsTrigger value="my" data-testid="tab-my-achievements">My Achievements</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
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
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 border border-border rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAchievements.length > 0 ? (
              <div className="space-y-4">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {activeTab === "my" ? "No achievements yet" : "No achievements found"}
                </h3>
                <p className="text-muted-foreground mb-4" data-testid="text-no-achievements">
                  {activeTab === "my" 
                    ? "Start by uploading your first achievement to get recognized!"
                    : "No achievements match your current filters."
                  }
                </p>
                {activeTab === "my" && (
                  <UploadAchievementForm trigger={
                    <Button data-testid="button-upload-first-achievement">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Your First Achievement
                    </Button>
                  } />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
