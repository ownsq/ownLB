import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  DocumentData,
  Unsubscribe 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import { ClassifiedListing, AuctionItem } from "../utils/classifiedsAuctionStorage";
import { EventItem, EventRsvpRecord } from "../data/eventsData";
import { BuddhismCourse } from "../types/buddhismCourse";
import { VideoItem } from "../utils/userVideosStorage";
import { Temple } from "../data/templesData";
import { Monk } from "../data/monksData";

// ==========================================
// 1. CLASSIFIEDS & AUCTIONS
// ==========================================
export function subscribeClassifieds(callback: (items: ClassifiedListing[]) => void): Unsubscribe {
  const colRef = collection(db, "classifieds");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ClassifiedListing[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "classifieds");
    }
  );
}

export async function addClassifiedItem(item: Omit<ClassifiedListing, "id">, customId?: string): Promise<string> {
  const path = "classifieds";
  try {
    const id = customId || `clf-${Date.now()}`;
    const cleanItem = {
      ...item,
      id,
      sellerId: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanItem);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateClassifiedItem(id: string, updates: Partial<ClassifiedListing>): Promise<void> {
  const path = `classifieds/${id}`;
  try {
    await updateDoc(doc(db, "classifieds", id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteClassifiedItem(id: string): Promise<void> {
  const path = `classifieds/${id}`;
  try {
    await deleteDoc(doc(db, "classifieds", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ==========================================
// 2. COMMUNITY EVENTS & RSVPS
// ==========================================
export function subscribeEvents(callback: (events: EventItem[]) => void): Unsubscribe {
  const colRef = collection(db, "events");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const events: EventItem[] = [];
      snapshot.forEach((docSnap) => {
        events.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(events);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "events");
    }
  );
}

export async function addCommunityEvent(event: Omit<EventItem, "id">, customId?: string): Promise<string> {
  const path = "events";
  try {
    const id = customId || `evt-${Date.now()}`;
    const cleanEvent = {
      ...event,
      id,
      organizerId: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanEvent);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteCommunityEvent(id: string): Promise<void> {
  const path = `events/${id}`;
  try {
    await deleteDoc(doc(db, "events", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export function subscribeEventRsvps(eventId: string, callback: (rsvps: EventRsvpRecord[]) => void): Unsubscribe {
  const colRef = collection(db, "event_rsvps");
  const q = query(colRef, where("eventId", "==", eventId));
  return onSnapshot(
    q,
    (snapshot) => {
      const rsvps: EventRsvpRecord[] = [];
      snapshot.forEach((docSnap) => {
        rsvps.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(rsvps);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "event_rsvps");
    }
  );
}

export async function saveEventRsvp(rsvp: Omit<EventRsvpRecord, "id">, customId?: string): Promise<string> {
  const path = "event_rsvps";
  try {
    const id = customId || `rsvp-${Date.now()}`;
    const cleanRsvp = {
      ...rsvp,
      id,
      userId: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanRsvp);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// ==========================================
// 3. BUDDHISM TRAINING COURSES
// ==========================================
export function subscribeCourses(callback: (courses: BuddhismCourse[]) => void): Unsubscribe {
  const colRef = collection(db, "courses");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const courses: BuddhismCourse[] = [];
      snapshot.forEach((docSnap) => {
        courses.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(courses);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "courses");
    }
  );
}

export async function addBuddhismCourse(course: Omit<BuddhismCourse, "id">, customId?: string): Promise<string> {
  const path = "courses";
  try {
    const id = customId || `crs-${Date.now()}`;
    const cleanCourse = {
      ...course,
      id,
      createdBy: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanCourse);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteBuddhismCourseFromDb(id: string): Promise<void> {
  const path = `courses/${id}`;
  try {
    await deleteDoc(doc(db, "courses", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ==========================================
// 4. DHAMMA VIDEOS
// ==========================================
export function subscribeVideos(callback: (videos: VideoItem[]) => void): Unsubscribe {
  const colRef = collection(db, "videos");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const videos: VideoItem[] = [];
      snapshot.forEach((docSnap) => {
        videos.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(videos);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "videos");
    }
  );
}

export async function addVideo(video: Omit<VideoItem, "id">, customId?: string): Promise<string> {
  const path = "videos";
  try {
    const id = customId || `vid-${Date.now()}`;
    const cleanVideo = {
      ...video,
      id,
      authorId: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanVideo);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteVideoFromDb(id: string): Promise<void> {
  const path = `videos/${id}`;
  try {
    await deleteDoc(doc(db, "videos", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ==========================================
// 5. TEMPLES & MONKS & RESTAURANTS
// ==========================================
export function subscribeTemples(callback: (temples: Temple[]) => void): Unsubscribe {
  const colRef = collection(db, "temples");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Temple[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "temples");
    }
  );
}

export async function addTempleToDb(temple: Omit<Temple, "id">, customId?: string): Promise<string> {
  const path = "temples";
  try {
    const id = customId || `temple-${Date.now()}`;
    const cleanTemple = {
      ...temple,
      id,
      createdBy: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanTemple);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeMonks(callback: (monks: Monk[]) => void): Unsubscribe {
  const colRef = collection(db, "monks");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Monk[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id as any, ...(docSnap.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "monks");
    }
  );
}

export async function addMonkToDb(monk: any, customId?: string): Promise<string> {
  const path = "monks";
  try {
    const id = customId || `monk-${Date.now()}`;
    const cleanMonk = {
      ...monk,
      id,
      createdBy: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanMonk);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteMonkFromDb(id: string): Promise<void> {
  const path = `monks/${id}`;
  try {
    await deleteDoc(doc(db, "monks", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function getMonkFromDb(id: string): Promise<Monk | null> {
  const path = `monks/${id}`;
  try {
    const snap = await getDoc(doc(db, "monks", id));
    if (snap.exists()) {
      return { id: snap.id as any, ...(snap.data() as any) } as Monk;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// ==========================================
// 5B. FAMOUS PEOPLE & NOTABLE PERSONALITIES
// ==========================================
export function subscribeFamousPeople(callback: (people: any[]) => void): Unsubscribe {
  const colRef = collection(db, "famous_people");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "famous_people");
    }
  );
}

export async function addFamousPersonToDb(person: any, customId?: string): Promise<string> {
  const path = "famous_people";
  try {
    const id = customId || `famous-${Date.now()}`;
    const cleanPerson = {
      ...person,
      id,
      createdBy: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanPerson);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteFamousPersonFromDb(id: string): Promise<void> {
  const path = `famous_people/${id}`;
  try {
    await deleteDoc(doc(db, "famous_people", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export function subscribeRestaurants(callback: (restaurants: any[]) => void): Unsubscribe {
  const colRef = collection(db, "restaurants");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "restaurants");
    }
  );
}

export async function addRestaurantToDb(rest: any, customId?: string): Promise<string> {
  const path = "restaurants";
  try {
    const id = customId || `rest-${Date.now()}`;
    const cleanRest = {
      ...rest,
      id,
      createdBy: auth.currentUser?.uid || "damika-user",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanRest);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// ==========================================
// 6. COMMUNITY FEED POSTS & GROUPS
// ==========================================
export function subscribePosts(callback: (posts: any[]) => void): Unsubscribe {
  const colRef = collection(db, "posts");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort newest first
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "posts");
    }
  );
}

export async function addPostToDb(post: any): Promise<string> {
  const path = "posts";
  try {
    const id = `post-${Date.now()}`;
    const cleanPost = {
      ...post,
      id,
      authorId: auth.currentUser?.uid || "damika-user",
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanPost);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeGroups(callback: (groups: any[]) => void): Unsubscribe {
  const colRef = collection(db, "groups");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "groups");
    }
  );
}

export async function addGroupToDb(group: any): Promise<string> {
  const path = "groups";
  try {
    const id = `grp-${Date.now()}`;
    const cleanGroup = {
      ...group,
      id,
      createdBy: auth.currentUser?.uid || "damika-user",
      membersCount: group.membersCount || 1,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, path, id), cleanGroup);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// ==========================================
// 7. REGISTERED USERS
// ==========================================
export function subscribeUsers(callback: (users: any[]) => void): Unsubscribe {
  const colRef = collection(db, "users");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "users");
    }
  );
}
