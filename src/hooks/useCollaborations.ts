
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Collaboration {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  collaborators: Collaborator[];
}

export interface Collaborator {
  id: string;
  collaboration_id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  email?: string; // Email from the profiles table
  first_name?: string | null;
  last_name?: string | null;
}

export const useCollaborations = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch both owned collaborations and ones the user is a collaborator on
  const fetchCollaborations = async () => {
    if (!user) {
      setCollaborations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get collaborations owned by the user
      const { data: ownedCollaborations, error: ownedError } = await supabase
        .from('collaborations')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Get collaborations where the user is a collaborator with active status
      const { data: memberCollaborations, error: memberError } = await supabase
        .from('collaboration_members')
        .select('collaboration_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (memberError) throw memberError;

      // Fetch the full collaboration data for member collaborations
      let memberCollaborationData: any[] = [];
      if (memberCollaborations.length > 0) {
        const collaborationIds = memberCollaborations.map(c => c.collaboration_id);
        const { data, error } = await supabase
          .from('collaborations')
          .select('*')
          .in('id', collaborationIds);

        if (error) throw error;
        memberCollaborationData = data || [];
      }

      // Combine both sets of collaborations
      const allCollaborations = [...(ownedCollaborations || []), ...memberCollaborationData];
      
      // Fetch collaborators for each collaboration
      const collaborationsWithCollaborators = await Promise.all(
        allCollaborations.map(async (collab) => {
          const { data: collaborators, error: collaboratorsError } = await supabase
            .from('collaboration_members')
            .select('*')
            .eq('collaboration_id', collab.id);

          if (collaboratorsError) {
            console.error('Error fetching collaborators:', collaboratorsError);
            return { ...collab, collaborators: [] };
          }

          // Get the emails for each collaborator from the profiles table
          const collaboratorsWithProfiles = await Promise.all(
            (collaborators || []).map(async (collaborator) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('email, first_name, last_name')
                .eq('user_id', collaborator.user_id)
                .single();

              return {
                ...collaborator,
                email: profileData?.email,
                first_name: profileData?.first_name,
                last_name: profileData?.last_name
              };
            })
          );

          return { ...collab, collaborators: collaboratorsWithProfiles };
        })
      );

      setCollaborations(collaborationsWithCollaborators as Collaboration[]);
    } catch (error: any) {
      console.error('Error fetching collaborations:', error);
      setError(error);
      toast.error('Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  };

  // Create a new collaboration
  const createCollaboration = async (name: string, description?: string): Promise<Collaboration | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('collaborations')
        .insert({
          name,
          description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCollaboration = { ...data, collaborators: [] };
        setCollaborations(prev => [...prev, newCollaboration as Collaboration]);
        toast.success('Collaboration created successfully');
        return newCollaboration as Collaboration;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error creating collaboration:', error);
      toast.error('Failed to create collaboration');
      return null;
    }
  };

  // Add a collaborator by email
  const inviteCollaborator = async (
    collaborationId: string, 
    email: string, 
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // First, find the user ID for the given email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      if (userError) {
        toast.error('User not found with this email');
        return false;
      }

      if (!userData?.user_id) {
        toast.error('User not found');
        return false;
      }

      // Check if the invitation already exists
      const { data: existingInvite, error: existingError } = await supabase
        .from('collaboration_members')
        .select('*')
        .eq('collaboration_id', collaborationId)
        .eq('user_id', userData.user_id)
        .single();

      if (existingInvite) {
        toast.error('This user has already been invited');
        return false;
      }

      // Add the new collaborator with pending status
      const { data, error } = await supabase
        .from('collaboration_members')
        .insert({
          collaboration_id: collaborationId,
          user_id: userData.user_id,
          role,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Add collaborator to the local state
      setCollaborations(prev =>
        prev.map(collab => {
          if (collab.id === collaborationId) {
            return {
              ...collab,
              collaborators: [
                ...collab.collaborators,
                {
                  ...data,
                  email,
                } as Collaborator
              ]
            };
          }
          return collab;
        })
      );

      toast.success('Invitation sent successfully');
      return true;
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  };

  // Update a collaborator's role or status
  const updateCollaborator = async (
    collaborationId: string,
    collaboratorId: string,
    updates: Partial<Pick<Collaborator, 'role' | 'status'>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('collaboration_members')
        .update(updates)
        .eq('id', collaboratorId)
        .eq('collaboration_id', collaborationId);

      if (error) throw error;

      // Update the local state
      setCollaborations(prev =>
        prev.map(collab => {
          if (collab.id === collaborationId) {
            return {
              ...collab,
              collaborators: collab.collaborators.map(c =>
                c.id === collaboratorId ? { ...c, ...updates } : c
              )
            };
          }
          return collab;
        })
      );

      toast.success('Collaborator updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating collaborator:', error);
      toast.error('Failed to update collaborator');
      return false;
    }
  };

  // Remove a collaborator
  const removeCollaborator = async (collaborationId: string, collaboratorId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('collaboration_members')
        .delete()
        .eq('id', collaboratorId)
        .eq('collaboration_id', collaborationId);

      if (error) throw error;

      // Update the local state
      setCollaborations(prev =>
        prev.map(collab => {
          if (collab.id === collaborationId) {
            return {
              ...collab,
              collaborators: collab.collaborators.filter(c => c.id !== collaboratorId)
            };
          }
          return collab;
        })
      );

      toast.success('Collaborator removed successfully');
      return true;
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
      return false;
    }
  };

  // Update a collaboration's details
  const updateCollaboration = async (
    id: string,
    updates: Partial<Pick<Collaboration, 'name' | 'description'>>
  ): Promise<Collaboration | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('collaborations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Get the current collaborators for this collaboration
        const currentCollab = collaborations.find(c => c.id === id);
        const updatedCollab = { 
          ...data, 
          collaborators: currentCollab?.collaborators || [] 
        } as Collaboration;
        
        // Update the local state
        setCollaborations(prev =>
          prev.map(collab => (collab.id === id ? updatedCollab : collab))
        );
        
        toast.success('Collaboration updated successfully');
        return updatedCollab;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error updating collaboration:', error);
      toast.error('Failed to update collaboration');
      return null;
    }
  };

  // Delete a collaboration
  const deleteCollaboration = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('collaborations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the local state
      setCollaborations(prev => prev.filter(collab => collab.id !== id));
      
      toast.success('Collaboration deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting collaboration:', error);
      toast.error('Failed to delete collaboration');
      return false;
    }
  };

  // Set up real-time subscription for collaboration changes
  useEffect(() => {
    if (!user) return;

    const collaborationsChannel = supabase
      .channel('collaborations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaborations',
      }, () => {
        fetchCollaborations();
      })
      .subscribe();

    const collaboratorsChannel = supabase
      .channel('collaborators-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaboration_members',
      }, () => {
        fetchCollaborations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(collaborationsChannel);
      supabase.removeChannel(collaboratorsChannel);
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  return {
    collaborations,
    loading,
    error,
    fetchCollaborations,
    createCollaboration,
    updateCollaboration,
    deleteCollaboration,
    inviteCollaborator,
    updateCollaborator,
    removeCollaborator,
  };
};
