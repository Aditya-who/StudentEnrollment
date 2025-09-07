import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Check, X, Users, Award, Clock, TrendingUp } from "lucide-react";
import { Redirect } from "wouter";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!user || !["faculty", "admin"].includes(user.role)) {
    return <Redirect to="/" />;
  }

  const { data: pendingAchievements = [], isLoading } = useQuery({
    queryKey: ["/api/achievements", { status: "pending" }],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/achievements"],
    select: (data) => {
      const pending = data.filter((a: any) => a.status === "pending").length;
      const approved = data.filter((a: any) => a.status === "approved").length;
      const rejected = data.filter((a: any) => a.status === "rejected").length;
      return { pending, approved, rejected, total: data.length };
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      return await apiRequest("PATCH", `/api/achievements/${achievementId}`, {
        status: "approved"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Achievement Approved",
        description: "The achievement has been successfully approved and points awarded.",
      });
      setSelectedAchievement(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve achievement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ achievementId, reason }: { achievementId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/achievements/${achievementId}`, {
        status: "rejected",
        rejectionReason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Achievement Rejected",
        description: "The achievement has been rejected with feedback.",
      });
      setSelectedAchievement(null);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject achievement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "bg-blue-100 text-blue-800",
      academic: "bg-green-100 text-green-800",
      sports: "bg-orange-100 text-orange-800",
      arts: "bg-purple-100 text-purple-800",
      leadership: "bg-red-100 text-red-800",
      volunteering: "bg-yellow-100 text-yellow-800",
      internship: "bg-indigo-100 text-indigo-800",
      placement: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-faculty-dashboard">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and validate student achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-pending-count">
                    {stats?.pending || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Approved</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-approved-count">
                    {stats?.approved || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Check className="text-secondary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-rejected-count">
                    {stats?.rejected || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <X className="text-destructive h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-count">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="w-20 h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : pendingAchievements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Achievement</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingAchievements.map((achievement) => (
                      <tr key={achievement.id} data-testid={`achievement-row-${achievement.id}`}>
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {achievement.user?.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{achievement.user?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.user?.department}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-sm">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {achievement.issuingAuthority}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge className={`text-xs ${getCategoryColor(achievement.category)}`}>
                            {achievement.category}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {new Date(achievement.date).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedAchievement(achievement)}
                                  data-testid={`view-achievement-${achievement.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Achievement</DialogTitle>
                                </DialogHeader>
                                {selectedAchievement && (
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold text-lg">{selectedAchievement.title}</h3>
                                      <p className="text-muted-foreground">
                                        by {selectedAchievement.user?.name} • {selectedAchievement.issuingAuthority}
                                      </p>
                                    </div>
                                    
                                    {selectedAchievement.description && (
                                      <div>
                                        <Label>Description</Label>
                                        <p className="text-sm mt-1">{selectedAchievement.description}</p>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Category</Label>
                                        <p className="text-sm mt-1">{selectedAchievement.category}</p>
                                      </div>
                                      <div>
                                        <Label>Date</Label>
                                        <p className="text-sm mt-1">
                                          {new Date(selectedAchievement.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>

                                    {selectedAchievement.certificateUrl && (
                                      <div>
                                        <Label>Certificate</Label>
                                        <div className="mt-1">
                                          <Button 
                                            variant="outline" 
                                            onClick={() => window.open(selectedAchievement.certificateUrl, '_blank')}
                                            data-testid="view-certificate"
                                          >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Certificate
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex justify-between pt-4 border-t">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="destructive" data-testid="button-reject">
                                            <X className="mr-2 h-4 w-4" />
                                            Reject
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Reject Achievement</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="rejection-reason">Reason for rejection</Label>
                                              <Textarea
                                                id="rejection-reason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Please provide a reason for rejection..."
                                                data-testid="textarea-rejection-reason"
                                              />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                              <DialogTrigger asChild>
                                                <Button variant="outline">Cancel</Button>
                                              </DialogTrigger>
                                              <Button
                                                variant="destructive"
                                                onClick={() => rejectMutation.mutate({
                                                  achievementId: selectedAchievement.id,
                                                  reason: rejectionReason
                                                })}
                                                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                                data-testid="button-confirm-reject"
                                              >
                                                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>

                                      <Button
                                        onClick={() => approveMutation.mutate(selectedAchievement.id)}
                                        disabled={approveMutation.isPending}
                                        data-testid="button-approve"
                                      >
                                        <Check className="mr-2 h-4 w-4" />
                                        {approveMutation.isPending ? "Approving..." : "Approve"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Pending Achievements
                </h3>
                <p className="text-muted-foreground" data-testid="text-no-pending">
                  All achievements have been reviewed. Great work!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
