
import { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'alert' | 'info' | 'success' | 'update';
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  
  // Generate sample notifications on mount
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'Budget Alert',
        message: 'You have exceeded your monthly budget for dining by ₹2,500.',
        time: new Date(2025, 3, 10, 14, 23),
        read: false,
        type: 'alert'
      },
      {
        id: '2',
        title: 'New Feature Available',
        message: 'Try our new splitwise feature to share expenses with friends.',
        time: new Date(2025, 3, 9, 10, 15),
        read: false,
        type: 'update'
      },
      {
        id: '3',
        title: 'Transaction Complete',
        message: 'Your investment of ₹10,000 in SIP has been processed.',
        time: new Date(2025, 3, 8, 16, 45),
        read: true,
        type: 'success'
      },
      {
        id: '4',
        title: 'Market Update',
        message: 'Sensex crossed 110,000 points for the first time today.',
        time: new Date(2025, 3, 8, 9, 30),
        read: true,
        type: 'info'
      },
      {
        id: '5',
        title: 'Security Alert',
        message: 'New login detected from Mumbai. Was this you?',
        time: new Date(2025, 3, 7, 20, 10),
        read: false,
        type: 'alert'
      }
    ];
    
    setNotifications(sampleNotifications);
    updateUnreadCount(sampleNotifications);
  }, []);
  
  // Update unread count whenever notifications change
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };
  
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'alert':
        return <span className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">!</span>;
      case 'success':
        return <span className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><Check className="h-4 w-4" /></span>;
      case 'update':
        return <span className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400"><Settings className="h-4 w-4" /></span>;
      case 'info':
      default:
        return <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">i</span>;
    }
  };
  
  const handleToggleNotification = (type: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <Tabs defaultValue="notifications">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="notifications" className="p-0 focus:outline-none">
            {notifications.length > 0 ? (
              <>
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <span className="text-sm font-medium">
                    {unreadCount} unread
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                      Mark all read
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-xs">
                      Clear all
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[300px]">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        {getNotificationIcon(notification.type)}
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markAsRead(notification.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(notification.time, 'MMM dd, yyyy • HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </>
            ) : (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No notifications to display</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="focus:outline-none">
            <div className="px-4 py-3 border-b">
              <h4 className="font-medium">Notification Preferences</h4>
              <p className="text-xs text-muted-foreground">Configure how you want to receive notifications</p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Get updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.email}
                  onCheckedChange={() => handleToggleNotification('email')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Get alerts on your device</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.push}
                  onCheckedChange={() => handleToggleNotification('push')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">Get updates via text message</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.sms}
                  onCheckedChange={() => handleToggleNotification('sms')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">In-App Notifications</p>
                    <p className="text-xs text-muted-foreground">Get alerts within the app</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.inApp}
                  onCheckedChange={() => handleToggleNotification('inApp')}
                />
              </div>
            </div>
            
            <div className="p-4 pt-0">
              <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Save Preferences
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
