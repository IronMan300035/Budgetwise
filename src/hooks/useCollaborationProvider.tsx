
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'active';
  created_at: string;
  user_id: string;
}

interface Collaboration {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  description?: string;
  collaborators: Collaborator[];
}

interface CollaborationContextType {
  collaborations: Collaboration[];
  loading: boolean;
  createCollaboration: (name: string, description?: string) => Promise<Collaboration | null>;
  inviteCollaborator: (collaborationId: string, email: string, role: 'viewer' | 'editor' | 'admin') => Promise<boolean>;
  removeCollaborator: (collaborationId: string, collaboratorId: string) => Promise<boolean>;
  deleteCollaboration: (id: string) => Promise<boolean>;
  updateCollaboration: (id: string, updates: Partial<Omit<Collaboration, 'id' | 'owner_id' | 'collaborators' | 'created_at'>>) => Promise<Collaboration | null>;
  fetchCollaborations: () => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCollaborations = async () => {
    if (!user) {
      setCollaborations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First get all collaborations where the user is the owner
      const { data: ownedData, error: ownedError } = await supabase
        .from('collaborations')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Then get all collaborations where the user is a collaborator
      const { data: collaboratorData, error: collaboratorError } = await supabase
        .from('collaborators')
        .select('collaboration_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (collaboratorError) throw collaboratorError;

      // If user is a collaborator on any collaborations, fetch those
      let sharedCollaborations: any[] = [];
      if (collaboratorData && collaboratorData.length > 0) {
        const collaborationIds = collaboratorData.map(item => item.collaboration_id);
        
        const { data: sharedData, error: sharedError } = await supabase
          .from('collaborations')
          .select('*')
          .in('id', collaborationIds);

        if (sharedError) throw sharedError;
        sharedCollaborations = sharedData || [];
      }

      // Combine owned and shared collaborations
      const allCollaborations = [...(ownedData || []), ...sharedCollaborations];
      
      // For each collaboration, fetch its collaborators
      const collaborationsWithMembers = await Promise.all(
        allCollaborations.map(async (collab) => {
          // First fetch collaborator data
          const { data: collaboratorsData, error: collabError } = await supabase
            .from('collaborators')
            .select('id, user_id, role, status, created_at')
            .eq('collaboration_id', collab.id);

          if (collabError) {
            console.error('Error fetching collaborators:', collabError);
            return {
              ...collab,
              collaborators: []
            };
          }

          // Then for each collaborator, fetch the corresponding profile to get email
          const collaboratorsWithProfiles = await Promise.all((collaboratorsData || []).map(async (collaborator) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', collaborator.user_id)
              .single();
              
            return {
              id: collaborator.id,
              user_id: collaborator.user_id,
              email: profileData?.email || 'Unknown',
              role: collaborator.role,
              status: collaborator.status,
              created_at: collaborator.created_at
            };
          }));

          return {
            ...collab,
            collaborators: collaboratorsWithProfiles
          };
        })
      );

      setCollaborations(collaborationsWithMembers);
    } catch (error: any) {
      console.error('Error fetching collaborations:', error);
      toast.error('Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  };

  const createCollaboration = async (name: string, description?: string): Promise<Collaboration | null> => {
    if (!user) return null;

    try {
      // Create the collaboration
      const { data, error } = await supabase
        .from('collaborations')
        .insert({
          name,
          description,
          owner_id: user.id
        })
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from collaboration creation');
      }

      // Add the new collaboration to state
      const newCollaboration: Collaboration = {
        ...data[0],
        collaborators: []
      };
      
      setCollaborations(prev => [...prev, newCollaboration]);
      toast.success('Collaboration created successfully');
      
      return newCollaboration;
    } catch (error: any) {
      console.error('Error creating collaboration:', error);
      toast.error('Failed to create collaboration');
      return null;
    }
  };

  const inviteCollaborator = async (collaborationId: string, email: string, role: 'viewer' | 'editor' | 'admin') => {
    if (!user) return false;

    try {
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        toast.error(`User with email ${email} not found. They need to sign up first.`);
        return false;
      }

      // Check if user is already a collaborator
      const { data: existingCollab, error: checkError } = await supabase
        .from('collaborators')
        .select('*')
        .eq('collaboration_id', collaborationId)
        .eq('user_id', userData.id);

      if (checkError) throw checkError;

      if (existingCollab && existingCollab.length > 0) {
        toast.info('This user is already a collaborator on this project');
        return false;
      }

      // Add the collaborator
      const { data, error } = await supabase
        .from('collaborators')
        .insert({
          collaboration_id: collaborationId,
          user_id: userData.id,
          role,
          status: 'pending'
        })
        .select();

      if (error) throw error;

      // Update state
      setCollaborations(prev => 
        prev.map(collab => {
          if (collab.id === collaborationId) {
            return {
              ...collab,
              collaborators: [
                ...collab.collaborators,
                {
                  id: data[0].id,
                  user_id: userData.id,
                  email,
                  role,
                  status: 'pending',
                  created_at: data[0].created_at
                }
              ]
            };
          }
          return collab;
        })
      );
      
      toast.success(`Invitation sent to ${email}`);
      return true;
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      toast.error('Failed to invite collaborator');
      return false;
    }
  };

  const removeCollaborator = async (collaborationId: string, collaboratorId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      // Update state
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

  const deleteCollaboration = async (id: string) => {
    if (!user) return false;

    try {
      // Delete the collaboration - cascades to collaborators due to FK constraint
      const { error } = await supabase
        .from('collaborations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state
      setCollaborations(prev => prev.filter(collab => collab.id !== id));
      
      toast.success('Collaboration deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting collaboration:', error);
      toast.error('Failed to delete collaboration');
      return false;
    }
  };

  const updateCollaboration = async (id: string, updates: Partial<Omit<Collaboration, 'id' | 'owner_id' | 'collaborators' | 'created_at'>>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('collaborations')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Update state
      const updatedCollaboration = data[0];
      setCollaborations(prev => 
        prev.map(collab => {
          if (collab.id === id) {
            return {
              ...collab,
              ...updatedCollaboration
            };
          }
          return collab;
        })
      );
      
      toast.success('Collaboration updated successfully');
      return {
        ...updatedCollaboration,
        collaborators: collaborations.find(c => c.id === id)?.collaborators || []
      };
    } catch (error: any) {
      console.error('Error updating collaboration:', error);
      toast.error('Failed to update collaboration');
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const collaborationsChannel = supabase
      .channel('collaboration_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'collaborations' 
      }, () => {
        fetchCollaborations();
      })
      .subscribe();

    const collaboratorsChannel = supabase
      .channel('collaborator_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'collaborators' 
      }, () => {
        fetchCollaborations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(collaborationsChannel);
      supabase.removeChannel(collaboratorsChannel);
    };
  }, [user]);

  const value: CollaborationContextType = {
    collaborations,
    loading,
    createCollaboration,
    inviteCollaborator,
    removeCollaborator,
    deleteCollaboration,
    updateCollaboration,
    fetchCollaborations
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
