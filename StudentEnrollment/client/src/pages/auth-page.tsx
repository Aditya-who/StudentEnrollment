import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Trophy, Users, Award, TrendingUp } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
      role: "student",
      department: "",
      year: "",
      rollNo: "",
      designation: "",
      bio: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate({ username: data.username, password: data.password });
  };

  const onRegister = (data: RegisterData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen">
        {/* Left side - Forms */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Trophy className="text-primary-foreground h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Achievo</h1>
              </div>
              <p className="text-muted-foreground">
                Track achievements, earn recognition, climb the leaderboard
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue tracking your achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          data-testid="input-login-username"
                          {...loginForm.register("username")}
                          placeholder="Enter your username"
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-destructive">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          data-testid="input-login-password"
                          type="password"
                          {...loginForm.register("password")}
                          placeholder="Enter your password"
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-destructive">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-login"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>
                      Join Achievo and start showcasing your achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            data-testid="input-register-name"
                            {...registerForm.register("name")}
                            placeholder="Your full name"
                          />
                          {registerForm.formState.errors.name && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            data-testid="input-register-username"
                            {...registerForm.register("username")}
                            placeholder="Choose a username"
                          />
                          {registerForm.formState.errors.username && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          data-testid="input-register-email"
                          type="email"
                          {...registerForm.register("email")}
                          placeholder="your.email@college.edu"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={(value) => registerForm.setValue("role", value as any)}>
                          <SelectTrigger data-testid="select-register-role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="faculty">Faculty</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {registerForm.formState.errors.role && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.role.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            data-testid="input-register-department"
                            {...registerForm.register("department")}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        {registerForm.watch("role") === "student" && (
                          <div className="space-y-2">
                            <Label htmlFor="rollNo">Roll Number</Label>
                            <Input
                              id="rollNo"
                              data-testid="input-register-rollno"
                              {...registerForm.register("rollNo")}
                              placeholder="e.g., CS2021001"
                            />
                          </div>
                        )}
                        {registerForm.watch("role") === "student" && (
                          <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select onValueChange={(value) => registerForm.setValue("year", value)}>
                              <SelectTrigger data-testid="select-register-year">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1st">1st Year</SelectItem>
                                <SelectItem value="2nd">2nd Year</SelectItem>
                                <SelectItem value="3rd">3rd Year</SelectItem>
                                <SelectItem value="4th">4th Year</SelectItem>
                                <SelectItem value="Final">Final Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {registerForm.watch("role") === "faculty" && (
                          <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                              id="designation"
                              data-testid="input-register-designation"
                              {...registerForm.register("designation")}
                              placeholder="e.g., Assistant Professor"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            data-testid="input-register-password"
                            type="password"
                            {...registerForm.register("password")}
                            placeholder="Create a password"
                          />
                          {registerForm.formState.errors.password && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            data-testid="input-register-confirm-password"
                            type="password"
                            {...registerForm.register("confirmPassword")}
                            placeholder="Confirm your password"
                          />
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-register"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right side - Hero section */}
        <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Showcase Your Journey
              </h2>
              <p className="text-lg text-muted-foreground">
                Track every achievement, compete with peers, and build an impressive portfolio 
                that showcases your growth and accomplishments.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Peer Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Get likes and comments from classmates
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <Award className="h-8 w-8 text-secondary mb-2" />
                <h3 className="font-semibold">Faculty Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Official verification of achievements
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <TrendingUp className="h-8 w-8 text-accent mb-2" />
                <h3 className="font-semibold">Leaderboards</h3>
                <p className="text-sm text-muted-foreground">
                  Compete and rank among peers
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Digital Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-generated professional portfolio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
