import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { cn, timeAgo } from "@/lib/utils";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  RefreshCw,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Settings,
  Clock,
  Filter,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

interface ChannelSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationStats {
  totalSentToday: number;
  unreadCount: number;
  readRate: number;
}

const eventTypes = [
  { key: "admissions", label: "Admissions" },
  { key: "fees", label: "Fees" },
  { key: "exams", label: "Exams" },
  { key: "attendance", label: "Attendance" },
  { key: "helpdesk", label: "Helpdesk" },
];

export default function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channels, setChannels] = useState<ChannelSettings>({
    email: true,
    sms: false,
    push: true,
    inApp: true,
  });
  const [stats, setStats] = useState<NotificationStats>({
    totalSentToday: 0,
    unreadCount: 0,
    readRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "admissions",
    "fees",
    "exams",
    "attendance",
    "helpdesk",
  ]);
  const [filterType, setFilterType] = useState<string>("all");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/my");
      setNotifications(response.data?.data ?? []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setStats((prev) => ({
        ...prev,
        unreadCount: response.data?.data?.count ?? 0,
      }));
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await api.get("/notifications/channels");
      setChannels(response.data?.data ?? {});
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/notifications/stats");
      setStats((prev) => ({ ...(response.data?.data ?? {}), unreadCount: prev.unreadCount }));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchAll = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
      fetchChannels(),
      fetchStats(),
    ]);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);
    };
    init();

    intervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
      fetchStats();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setStats((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setStats((prev) => ({ ...prev, unreadCount: 0 }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const updateChannels = async (newChannels: ChannelSettings) => {
    setChannels(newChannels);
    try {
      await api.put("/notifications/channels", newChannels);
    } catch (error) {
      console.error("Failed to update channels:", error);
      fetchChannels();
    }
  };

  const toggleEventType = (key: string) => {
    setSelectedEvents((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.read;
    if (filterType === "read") return n.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "admissions":
        return <Bell className="h-4 w-4 text-indigo-500" />;
      case "fees":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "exams":
        return <Check className="h-4 w-4 text-orange-500" />;
      case "attendance":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "helpdesk":
        return <MessageSquare className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Real-time Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your notification preferences and view recent alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.unreadCount > 0 && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              {stats.unreadCount} unread
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium",
              "hover:bg-gray-50 transition-colors",
              refreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Feed
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {["all", "unread", "read"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md capitalize transition-colors",
                        filterType === type
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {stats.unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <BellOff className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="text-sm">No notifications to display</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() =>
                      !notification.read && markAsRead(notification.id)
                    }
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      notification.read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            notification.read
                              ? "text-gray-700"
                              : "text-gray-900"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {timeAgo(new Date(notification.createdAt))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Stats
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSentToday}
                </p>
                <p className="text-sm text-gray-500 mt-1">Sent Today</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.unreadCount}
                </p>
                <p className="text-sm text-gray-500 mt-1">Unread</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {stats.readRate}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Read Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Channels
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Email
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateChannels({ ...channels, email: !channels.email })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    channels.email ? "bg-indigo-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      channels.email ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    SMS
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateChannels({ ...channels, sms: !channels.sms })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    channels.sms ? "bg-indigo-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      channels.sms ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Push
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateChannels({ ...channels, push: !channels.push })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    channels.push ? "bg-indigo-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      channels.push ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    In-App
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateChannels({ ...channels, inApp: !channels.inApp })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    channels.inApp ? "bg-indigo-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      channels.inApp ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-3">
                Select events that trigger notifications:
              </p>
              {eventTypes.map((event) => (
                <label
                  key={event.key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.key)}
                    onChange={() => toggleEventType(event.key)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quiet Hours
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  No notifications during:
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End
                  </label>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
