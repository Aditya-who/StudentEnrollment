import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Heart, MessageCircle, Eye, Calendar, Building } from "lucide-react";

interface AchievementCardProps {
  achievement: any;
  showActions?: boolean;
}

export function AchievementCard({ achievement, showActions = true }: AchievementCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false); // This should come from API

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return await apiRequest("DELETE", `/api/achievements/${achievement.id}/like`);
      } else {
        return await apiRequest("POST", `/api/achievements/${achievement.id}/like`);
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/achievements/${achievement.id}/comments`, {
        content
      });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
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
    <Card className={`transition-all hover:shadow-md ${
      achievement.status === "pending" ? "border-yellow-200 bg-yellow-50/50" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-muted/30">
            {getCategoryIcon(achievement.category)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground" data-testid={`achievement-title-${achievement.id}`}>
                    {achievement.title}
                  </h3>
                  {achievement.points > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{achievement.points} pts
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Badge className={`text-xs ${getCategoryColor(achievement.category)}`}>
                    {achievement.category}
                  </Badge>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(achievement.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Building className="h-3 w-3" />
                  <span>{achievement.issuingAuthority}</span>
                </div>

                {achievement.user && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {achievement.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {achievement.user.name}
                      {achievement.user.department && ` • ${achievement.user.department}`}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusBadge(achievement.status)}
              </div>
            </div>

            {achievement.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {achievement.description}
              </p>
            )}

            {showActions && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                    className="flex items-center space-x-1 p-0 h-auto"
                    data-testid={`like-button-${achievement.id}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="text-sm text-muted-foreground">
                      {achievement.likesCount || 0}
                    </span>
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1 p-0 h-auto"
                        data-testid={`comment-button-${achievement.id}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          {achievement.commentsCount || 0}
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Comments</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="comment">Add a comment</Label>
                          <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            data-testid="textarea-comment"
                          />
                          <Button
                            onClick={() => comment.trim() && commentMutation.mutate(comment)}
                            disabled={!comment.trim() || commentMutation.isPending}
                            size="sm"
                            data-testid="button-post-comment"
                          >
                            {commentMutation.isPending ? "Posting..." : "Post Comment"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {achievement.certificateUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(achievement.certificateUrl, '_blank')}
                    data-testid={`view-certificate-${achievement.id}`}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    <span className="text-sm">View Certificate</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
