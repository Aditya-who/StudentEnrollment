import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Download, Link2, Star, Medal, Trophy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/achievements", { userId: user?.id }],
    enabled: !!user,
  });

  const approvedAchievements = userAchievements.filter(a => a.status === "approved");
  
  // Group achievements by category
  const achievementsByCategory = approvedAchievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    toast({
      title: "PDF Generation",
      description: "Portfolio PDF generation would be implemented here with a service like Puppeteer or jsPDF",
    });
  };

  const handleShareLink = () => {
    const portfolioUrl = `${window.location.origin}/portfolio/${user?.id}`;
    navigator.clipboard.writeText(portfolioUrl);
    toast({
      title: "Link Copied",
      description: "Portfolio link copied to clipboard",
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      technical: "💻",
      academic: "📚",
      sports: "🏆",
      arts: "🎨",
      leadership: "👥",
      volunteering: "🤝",
      internship: "💼",
      placement: "🎯",
    };
    return icons[category] || "🏅";
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      technical: "Technical Achievements",
      academic: "Academic Excellence",
      sports: "Sports & Athletics",
      arts: "Arts & Culture",
      leadership: "Leadership & Management",
      volunteering: "Volunteering & Community Service",
      internship: "Internships & Work Experience",
      placement: "Placements & Career",
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-portfolio-title">
                Your Portfolio
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate a comprehensive portfolio from your verified achievements
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleShareLink} data-testid="button-share-portfolio">
                <Link2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
              <Button onClick={handleDownloadPDF} data-testid="button-download-pdf">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg p-6 bg-muted/30">
              {/* Profile Header */}
              <div className="flex items-start space-x-6 mb-8">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-xl bg-primary/10">
                    {user?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1" data-testid="text-portfolio-name">
                    {user?.name}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-2">
                    {user?.department} Engineering
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    {user?.rollNo && (
                      <span>Roll No: {user.rollNo}</span>
                    )}
                    {user?.year && (
                      <span>• {user.year} Year</span>
                    )}
                    {user?.email && (
                      <span>• {user.email}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium" data-testid="text-total-points">
                        {user?.totalPoints || 0} Points
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Medal className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium" data-testid="text-achievement-count">
                        {approvedAchievements.length} Achievements
                      </span>
                    </div>
                  </div>
                  {user?.bio && (
                    <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
                      {user.bio}
                    </p>
                  )}
                  {(user?.linkedinUrl || user?.githubUrl) && (
                    <div className="flex items-center space-x-3 mt-3">
                      {user.linkedinUrl && (
                        <a 
                          href={user.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center space-x-1"
                          data-testid="link-linkedin"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {user.githubUrl && (
                        <a 
                          href={user.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center space-x-1"
                          data-testid="link-github"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Achievement Categories */}
              {Object.keys(achievementsByCategory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                        <span className="text-xl">{getCategoryIcon(category)}</span>
                        <span>{getCategoryName(category)}</span>
                        <Badge variant="secondary" className="ml-2">
                          {achievements.length}
                        </Badge>
                      </h3>
                      <div className="grid gap-3">
                        {achievements.map((achievement) => (
                          <div 
                            key={achievement.id}
                            className="flex justify-between items-center p-3 bg-card rounded border"
                            data-testid={`achievement-${achievement.id}`}
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">
                                {achievement.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {achievement.issuingAuthority} • 
                                {new Date(achievement.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                +{achievement.points} pts
                              </Badge>
                              {achievement.certificateUrl && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => window.open(achievement.certificateUrl, '_blank')}
                                  data-testid={`view-certificate-${achievement.id}`}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Achievements Yet
                  </h3>
                  <p className="text-muted-foreground" data-testid="text-no-portfolio-achievements">
                    Start uploading and getting achievements approved to build your portfolio!
                  </p>
                </div>
              )}

              {/* Portfolio Footer */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  Generated by Achievo • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
