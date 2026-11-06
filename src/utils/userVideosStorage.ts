export interface VideoItem {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  views: string;
  time: string;
  duration?: string;
  viewers?: string;
  location?: string;
  img: string;
  videoUrl?: string;
  isLive?: boolean;
  category: string;
  desc?: string;
  uploadedAt?: string;
  likesCount?: number;
  isUserUploaded?: boolean;
}

export interface UserChannel {
  id: string;
  userId: string;
  channelName: string;
  handle: string;
  avatar: string;
  banner: string;
  description: string;
  subscribersCount: number;
  totalViews: number;
  contactEmail: string;
  location: string;
  links?: { title: string; url: string }[];
}

import { addVideo, deleteVideoFromDb } from "../lib/firestoreService";

const VIDEOS_STORAGE_KEY = 'lanka_all_videos_v1';
const CHANNEL_STORAGE_KEY = 'lanka_user_channel_v1';

// Clear legacy mock videos from localStorage
try {
  const cachedVideos = localStorage.getItem(VIDEOS_STORAGE_KEY);
  if (cachedVideos && (cachedVideos.includes('"v1"') || cachedVideos.includes('"v2"'))) {
    localStorage.removeItem(VIDEOS_STORAGE_KEY);
  }
} catch {
  // Ignore
}

export const INITIAL_VIDEOS: VideoItem[] = [];

export const DEFAULT_USER_CHANNEL: UserChannel = {
  id: "ch-damika",
  userId: "damika-user",
  channelName: "Damika's Dhamma Circle",
  handle: "@damikadhamma",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
  banner: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200",
  description: "Sharing inspirational Dhamma talks, guided meditation sessions, chantings, and cultural highlights with the global Buddhist community.",
  subscribersCount: 245,
  totalViews: 1372,
  contactEmail: "damika1316@gmail.com",
  location: "Los Angeles, CA",
  links: [
    { title: "LankaBuddhist Profile", url: "https://lankabuddhist.com" },
    { title: "Meditation Circle", url: "https://zoom.us" }
  ]
};

export function getUserChannel(): UserChannel {
  try {
    const raw = localStorage.getItem(CHANNEL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHANNEL_STORAGE_KEY, JSON.stringify(DEFAULT_USER_CHANNEL));
      return DEFAULT_USER_CHANNEL;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_CHANNEL;
  }
}

export function updateUserChannel(updates: Partial<UserChannel>): UserChannel {
  try {
    const current = getUserChannel();
    const updated: UserChannel = { ...current, ...updates };
    localStorage.setItem(CHANNEL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_channel_updated', { detail: { channel: updated } }));
    return updated;
  } catch {
    return DEFAULT_USER_CHANNEL;
  }
}

export function getAllVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VIDEOS;
  }
}

export function getUserUploadedVideos(authorName = "Damika"): VideoItem[] {
  const all = getAllVideos();
  return all.filter(v => v.isUserUploaded || v.authorId === "damika-user" || v.author.toLowerCase() === authorName.toLowerCase());
}

export function uploadUserVideo(videoData: {
  title: string;
  category: string;
  desc?: string;
  videoUrl?: string;
  img?: string;
  duration?: string;
  speaker?: string;
}): VideoItem {
  const all = getAllVideos();
  const channel = getUserChannel();
  
  const newVideo: VideoItem = {
    id: "v-up-" + Date.now(),
    title: videoData.title,
    author: channel.channelName || "Damika",
    authorId: channel.userId || "damika-user",
    views: "1 view",
    time: "Just now",
    duration: videoData.duration || "15:30",
    img: videoData.img || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
    videoUrl: videoData.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: videoData.category || "Dharma Deshana",
    desc: videoData.desc || "Dhamma video uploaded via LankaBuddhist channel.",
    isUserUploaded: true,
    likesCount: 1,
    uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const updated = [newVideo, ...all];
  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(updated));
  
  // Update channel totalViews and videos stats
  updateUserChannel({ totalViews: channel.totalViews + 1 });
  
  window.dispatchEvent(new CustomEvent('lanka_videos_updated', { detail: { video: newVideo } }));
  // Asynchronously sync video to Firestore
  addVideo(newVideo, newVideo.id).catch(err => {
    console.warn("Firestore sync warning for video:", err);
  });
  return newVideo;
}

export function deleteUserVideo(videoId: string): boolean {
  try {
    const all = getAllVideos();
    const filtered = all.filter(v => v.id !== videoId);
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('lanka_videos_updated', { detail: { deletedId: videoId } }));
    deleteVideoFromDb(videoId).catch(err => console.warn("Firestore delete video error:", err));
    return true;
  } catch {
    return false;
  }
}

export function updateUserVideo(videoId: string, updates: Partial<VideoItem>): VideoItem | null {
  try {
    const all = getAllVideos();
    let updatedItem: VideoItem | null = null;
    const updated = all.map(v => {
      if (v.id === videoId) {
        updatedItem = { ...v, ...updates };
        return updatedItem;
      }
      return v;
    });
    if (updatedItem) {
      localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lanka_videos_updated', { detail: { video: updatedItem } }));
    }
    return updatedItem;
  } catch {
    return null;
  }
}
