
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useCollaboration } from "@/context/CollaborationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Mail, 
  Share2, 
  Copy, 
  UserMinus,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
  AtSign
} from "lucide-react";
import { toast } from "sonner";

export default function Collaborations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    collaborations, 
    loading: collabLoading, 
    createCollaboration, 
    inviteCollaborator,
    removeCollaborator,
    deleteCollaboration,
    updateCollaboration
  } = useCollaboration();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [selectedCollaboration, setSelectedCollaboration] = useState<any>(null);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  const handleCreateCollaboration = async () => {
    if (!name) {
      toast.error("Please enter a name for the collaboration");
      return;
    }
    
    const result = await createCollaboration(name, description);
    if (result) {
      setName("");
      setDescription("");
      setIsCreateOpen(false);
    }
  };
  
  const handleEditCollaboration = async () => {
    if (!selectedCollaboration || !name) {
      toast.error("Please enter a name for the collaboration");
      return;
    }
    
    const result = await updateCollaboration(selectedCollaboration.id, {
      name,
      description
    });
    
    if (result) {
      setIsEditOpen(false);
    }
  };
  
  const handleInviteCollaborator = async () => {
    if (!selectedCollaboration || !email) {
      toast.error("Please enter an email address");
      return;
    }
    
    const result = await inviteCollaborator(selectedCollaboration.id, email, role);
    if (result) {
      setEmail("");
      setRole("viewer");
      setIsInviteOpen(false);
    }
  };
  
  const handleOpenEdit = (collaboration: any) => {
    setSelectedCollaboration(collaboration);
    setName(collaboration.name);
    setDescription(collaboration.description || "");
    setIsEditOpen(true);
  };
  
  const handleOpenInvite = (collaboration: any) => {
    setSelectedCollaboration(collaboration);
    setIsInviteOpen(true);
  };
  
  const handleOpenShare = (collaboration: any) => {
    setSelectedCollaboration(collaboration);
    setIsShareOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this collaboration? This action cannot be undone.")) {
      await deleteCollaboration(id);
    }
  };
  
  const handleRemoveCollaborator = async (collaborationId: string, collaboratorId: string) => {
    if (window.confirm("Are you sure you want to remove this collaborator?")) {
      await removeCollaborator(collaborationId, collaboratorId);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  const shareUrl = selectedCollaboration ? 
    `${window.location.origin}/collaborate?id=${selectedCollaboration.id}` : "";
  
  const socialShare = (platform: string) => {
    let url = "";
    const text = `Join my collaboration on BudgetWise: ${selectedCollaboration?.name}`;
    
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Check out this collaboration: ${shareUrl}`)}`;
        break;
    }
    
    if (url) {
      window.open(url, "_blank");
    }
  };
  
  if (authLoading || collabLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading collaborations...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Companion Mode
            </h1>
            <p className="text-muted-foreground">
              Collaborate with others to manage finances together
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Create Collaboration
          </Button>
        </div>
        
        {collaborations.length === 0 ? (
          <Card className="text-center p-10 bg-accent/20">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Users className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No collaborations yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create a collaboration to manage finances with friends, family, or colleagues. 
                Share budgets, track expenses, and work towards financial goals together.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Create Your First Collaboration
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collaboration) => (
              <Card key={collaboration.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{collaboration.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(collaboration)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenInvite(collaboration)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenShare(collaboration)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(collaboration.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    Created on {new Date(collaboration.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    {collaboration.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <Users className="h-4 w-4" />
                    <span>{collaboration.collaborators.length + 1} members</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-accent/20 p-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenInvite(collaboration)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" /> Invite
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/dashboard?collaborative=${collaboration.id}`)}
                  >
                    View Dashboard
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Create Collaboration Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collaboration</DialogTitle>
            <DialogDescription>
              Create a new collaborative space to manage finances with others.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Family Budget, Trip Planning"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this collaboration for?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCollaboration}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Collaboration Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collaboration</DialogTitle>
            <DialogDescription>
              Update collaboration details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            {selectedCollaboration && (
              <div className="mt-2">
                <h3 className="text-sm font-medium mb-2">Collaborators</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCollaboration.collaborators.map((collaborator: any) => (
                        <TableRow key={collaborator.id}>
                          <TableCell>{collaborator.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{collaborator.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={collaborator.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {collaborator.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-red-500"
                              onClick={() => handleRemoveCollaborator(selectedCollaboration.id, collaborator.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCollaboration}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Invite Collaborator Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Invite someone to join this collaboration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (can only view)</SelectItem>
                  <SelectItem value="editor">Editor (can edit but not invite)</SelectItem>
                  <SelectItem value="admin">Admin (full access)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Admins can invite others and manage the collaboration. Editors can make changes but can't invite. Viewers can only view.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteCollaborator}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Collaboration</DialogTitle>
            <DialogDescription>
              Share this collaboration with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly />
              <Button size="sm" onClick={() => copyToClipboard(shareUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">Share via</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => socialShare("email")}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => socialShare("facebook")}>
                  <Facebook className="h-4 w-4 mr-1" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={() => socialShare("twitter")}>
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={() => socialShare("linkedin")}>
                  <Linkedin className="h-4 w-4 mr-1" />
                  LinkedIn
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center mb-2">
                <AtSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <h3 className="text-sm font-medium">Or invite directly</h3>
              </div>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  setIsShareOpen(false);
                  handleOpenInvite(selectedCollaboration);
                }}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Invite by Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
