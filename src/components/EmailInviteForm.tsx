
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailInviteFormProps {
  onInvite: (email: string, role: 'viewer' | 'editor' | 'admin') => Promise<boolean>;
  disabled?: boolean;
}

export const EmailInviteForm: React.FC<EmailInviteFormProps> = ({
  onInvite,
  disabled = false
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onInvite(email.trim(), role);
      if (success) {
        setEmail('');
        toast.success(`Invitation sent to ${email}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email">Invite by Email</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="invite-email"
            placeholder="Enter email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || isSubmitting}
            className="flex-1"
          />
          <Select 
            value={role} 
            onValueChange={(value) => setRole(value as 'viewer' | 'editor' | 'admin')}
            disabled={disabled || isSubmitting}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={disabled || isSubmitting || !email}
          >
            {isSubmitting ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
            ) : (
              <SendHorizontal className="h-4 w-4 mr-2" />
            )}
            Send Invite
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>Role permissions:</p>
        <ul className="list-disc list-inside">
          <li><strong>Viewer:</strong> Can only view financial data</li>
          <li><strong>Editor:</strong> Can add transactions and make changes</li>
          <li><strong>Admin:</strong> Can manage other collaborators</li>
        </ul>
      </div>
    </form>
  );
};
