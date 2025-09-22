import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarGrid } from '@/components/Avatar';
import { useToast } from '@/hooks/use-toast';
import { api, mockData, type User, type UserPreferences } from '@/lib/api';
import { Settings as SettingsIcon, Shield, Download, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userStr = localStorage.getItem('neuromatch_user');
      if (!userStr) {
        navigate('/signup');
        return;
      }

      const localUser = JSON.parse(userStr);
      const profile = await api.getProfile(localUser.id);
      
      if (profile) {
        setUser(profile);
        setNewUsername(profile.username);
        setSelectedAvatarId(profile.avatarId);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load settings",
        description: "Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean) => {
    if (!user) return;

    const updatedPreferences = {
      ...user.preferences,
      [key]: value
    };

    try {
      const updatedUser = await api.updateProfile(user.id, {
        preferences: updatedPreferences
      });
      
      setUser(updatedUser);
      localStorage.setItem('neuromatch_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Preferences updated",
        description: "Your settings have been saved."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update preferences",
        description: "Please try again."
      });
    }
  };

  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim()) return;

    setIsSaving(true);
    try {
      const updatedUser = await api.updateProfile(user.id, {
        username: newUsername.trim()
      });
      
      setUser(updatedUser);
      setEditingUsername(false);
      localStorage.setItem('neuromatch_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Username updated",
        description: "Your pseudonym has been changed."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update username",
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!user || !selectedAvatarId) return;

    setIsSaving(true);
    try {
      const updatedUser = await api.updateProfile(user.id, {
        avatarId: selectedAvatarId
      });
      
      setUser(updatedUser);
      setEditingAvatar(false);
      localStorage.setItem('neuromatch_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Avatar updated",
        description: "Your profile image has been changed."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update avatar",
        description: "Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    
    const data = {
      profile: user,
      exportDate: new Date().toISOString(),
      note: "NeuroMatch data export - your privacy is protected"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuromatch-data-${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your data has been downloaded."
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion",
      description: "This feature will be available in the full version. For now, you can clear your browser data."
    });
  };

  const getAvatarGradient = (avatarId: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-yellow-400 to-orange-400'
    ];
    const index = parseInt(avatarId.slice(-1)) || 0;
    return gradients[index % gradients.length];
  };

  if (isLoading || !user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16">
          <div className="animate-pulse-soft">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-soft p-6">
                  <div className="h-4 bg-muted rounded w-32 mb-4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Profile Information
            </h2>

            {/* Avatar Section */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-4 block">Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar
                  username={user.username}
                  size="lg"
                  gradient={getAvatarGradient(user.avatarId)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAvatar(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>

              {editingAvatar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 border border-border rounded-lg bg-muted/30"
                >
                  <AvatarGrid
                    avatars={mockData.avatars}
                    selectedId={selectedAvatarId}
                    onSelect={setSelectedAvatarId}
                    className="mb-4"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={handleSaveAvatar}
                      disabled={isSaving || selectedAvatarId === user.avatarId}
                    >
                      {isSaving ? 'Saving...' : 'Save Avatar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAvatar(false);
                        setSelectedAvatarId(user.avatarId);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Username Section */}
            <div>
              <Label className="text-base font-medium mb-4 block">Pseudonym</Label>
              <div className="flex items-center gap-4">
                {editingUsername ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      maxLength={30}
                    />
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={handleSaveUsername}
                      disabled={isSaving || !newUsername.trim()}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUsername(false);
                        setNewUsername(user.username);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-foreground font-medium flex-1">
                      {user.username}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUsername(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Matching Preferences
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Open to 1:1 Matches</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow direct one-on-one conversations with matches
                  </p>
                </div>
                <Switch
                  checked={user.preferences?.openTo1v1 ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('openTo1v1', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Only Group Chats</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prefer group conversations over individual matches
                  </p>
                </div>
                <Switch
                  checked={user.preferences?.onlyGroupChats ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('onlyGroupChats', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Daily Prompts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive daily micro-tests to keep your mindprint fresh
                  </p>
                </div>
                <Switch
                  checked={user.preferences?.dailyPrompts ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('dailyPrompts', checked)}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Privacy & Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Privacy & Data
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Pseudonym Enforcement</h3>
                <p className="text-sm text-muted-foreground">
                  Your real identity is never shared. Only your chosen pseudonym and mindprint 
                  are visible to potential matches. We enforce privacy-first connections.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDeleteAccount}
                  className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="card-soft p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-foreground mb-2">
              NeuroMatch MVP v1.0
            </h3>
            <p className="text-sm text-muted-foreground">
              Privacy-first neural matching. Your data stays yours, your identity stays private, 
              and your connections stay authentic.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;