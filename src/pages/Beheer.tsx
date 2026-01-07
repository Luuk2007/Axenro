import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, CreditCard, BarChart3, Database, Shield, Search, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile?: {
    full_name: string | null;
  };
  user_profile?: {
    name: string | null;
    age: number | null;
    weight: number | null;
    height: number | null;
    fitness_goal: string | null;
  };
  subscription?: {
    subscription_tier: string | null;
    test_subscription_tier: string | null;
    test_mode: boolean;
    subscribed: boolean;
  };
}

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalWorkouts: number;
  freeUsers: number;
  proUsers: number;
  premiumUsers: number;
}

const Beheer = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminAccess();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newTier, setNewTier] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (!adminLoading && !isAdmin && user) {
      toast.error('Geen toegang tot beheer pagina');
      navigate('/');
      return;
    }

    if (isAdmin) {
      loadData();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Fout bij laden van gegevens');
    } finally {
      setLoadingData(false);
    }
  };

  const loadUsers = async () => {
    // Get subscribers with their data
    const { data: subscribers, error: subsError } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('Error loading subscribers:', subsError);
      return;
    }

    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error loading profiles:', profilesError);
    }

    // Get user_profiles
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*');

    if (userProfilesError) {
      console.error('Error loading user_profiles:', userProfilesError);
    }

    // Combine data
    const combinedUsers: UserData[] = (subscribers || []).map(sub => ({
      id: sub.user_id || sub.id,
      email: sub.email,
      created_at: sub.created_at,
      last_sign_in_at: null,
      profile: profiles?.find(p => p.id === sub.user_id),
      user_profile: userProfiles?.find(up => up.user_id === sub.user_id),
      subscription: {
        subscription_tier: sub.subscription_tier,
        test_subscription_tier: sub.test_subscription_tier,
        test_mode: sub.test_mode,
        subscribed: sub.subscribed
      }
    }));

    setUsers(combinedUsers);
  };

  const loadStats = async () => {
    // Count subscribers by tier
    const { data: subscribers, error: subsError } = await supabase
      .from('subscribers')
      .select('subscription_tier, test_subscription_tier, test_mode, subscribed');

    if (subsError) {
      console.error('Error loading stats:', subsError);
      return;
    }

    // Count workouts
    const { count: workoutsCount, error: workoutsError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true });

    if (workoutsError) {
      console.error('Error counting workouts:', workoutsError);
    }

    const totalUsers = subscribers?.length || 0;
    const activeSubscribers = subscribers?.filter(s => s.subscribed).length || 0;
    
    // Count by tier
    let freeUsers = 0;
    let proUsers = 0;
    let premiumUsers = 0;

    subscribers?.forEach(s => {
      const tier = s.test_mode ? s.test_subscription_tier : s.subscription_tier;
      if (tier === 'pro') proUsers++;
      else if (tier === 'premium') premiumUsers++;
      else freeUsers++;
    });

    setStats({
      totalUsers,
      activeSubscribers,
      totalWorkouts: workoutsCount || 0,
      freeUsers,
      proUsers,
      premiumUsers
    });
  };

  const handleChangeTier = async (userId: string, email: string) => {
    if (!newTier) {
      toast.error('Selecteer een tier');
      return;
    }

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          test_subscription_tier: newTier,
          test_mode: true 
        })
        .eq('email', email);

      if (error) throw error;

      toast.success(`Tier gewijzigd naar ${newTier}`);
      setSelectedUser(null);
      setNewTier('');
      loadUsers();
    } catch (error) {
      console.error('Error changing tier:', error);
      toast.error('Fout bij wijzigen van tier');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadgeColor = (tier: string | null | undefined) => {
    switch (tier) {
      case 'premium': return 'bg-purple-500';
      case 'pro': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Beheer</h1>
            <p className="text-muted-foreground">Admin dashboard voor Axenro</p>
          </div>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Vernieuwen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Abonnees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscribers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Workouts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWorkouts || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnementen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-sm">
              <Badge variant="secondary">Free: {stats?.freeUsers || 0}</Badge>
              <Badge className="bg-blue-500">Pro: {stats?.proUsers || 0}</Badge>
              <Badge className="bg-purple-500">Premium: {stats?.premiumUsers || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Gebruikers
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Abonnementen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gebruikersbeheer</CardTitle>
              <CardDescription>Bekijk en beheer alle gebruikers</CardDescription>
              <div className="flex items-center gap-2 mt-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op email of naam..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Naam</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Aangemaakt</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userData) => {
                      const currentTier = userData.subscription?.test_mode 
                        ? userData.subscription?.test_subscription_tier 
                        : userData.subscription?.subscription_tier;
                      
                      return (
                        <TableRow key={userData.id}>
                          <TableCell className="font-medium">{userData.email}</TableCell>
                          <TableCell>
                            {userData.profile?.full_name || userData.user_profile?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTierBadgeColor(currentTier)}>
                              {currentTier || 'free'}
                            </Badge>
                            {userData.subscription?.test_mode && (
                              <Badge variant="outline" className="ml-1">Test</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(userData.created_at).toLocaleDateString('nl-NL')}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setNewTier(currentTier || 'free');
                                  }}
                                >
                                  Wijzig tier
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Wijzig abonnement</DialogTitle>
                                  <DialogDescription>
                                    Wijzig het abonnement voor {userData.email}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Huidige tier:</label>
                                    <Badge className={getTierBadgeColor(currentTier)}>
                                      {currentTier || 'free'}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Nieuwe tier:</label>
                                    <Select value={newTier} onValueChange={setNewTier}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecteer tier" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    onClick={() => handleChangeTier(userData.id, userData.email)}
                                    className="w-full"
                                  >
                                    Opslaan
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abonnementenoverzicht</CardTitle>
              <CardDescription>Statistieken over abonnementen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Free</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.freeUsers || 0}</div>
                    <p className="text-sm text-muted-foreground">gebruikers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-blue-500">Pro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.proUsers || 0}</div>
                    <p className="text-sm text-muted-foreground">gebruikers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-purple-500">Premium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.premiumUsers || 0}</div>
                    <p className="text-sm text-muted-foreground">gebruikers</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Beheer;
