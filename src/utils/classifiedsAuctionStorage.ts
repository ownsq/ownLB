export interface BuyerContactDetails {
  fullName: string;
  phone: string;
  email: string;
  fulfillmentPreference: "Pickup" | "Shipping";
  address?: string;
  notes?: string;
}

export interface BidEntry {
  id: string;
  bidderName: string;
  bidderAvatar?: string;
  bidderPhone?: string;
  bidderEmail?: string;
  fulfillmentPreference?: "Pickup" | "Shipping";
  shippingAddress?: string;
  amount: number;
  timestamp: number;
  isUser?: boolean;
  isAutoBid?: boolean;
}

export interface ClassifiedOffer {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  amount: number;
  proposedDate?: string;
  proposedLocation?: string;
  fulfillment: "Pickup" | "Shipping";
  notes?: string;
  status: "pending" | "accepted" | "declined";
  timestamp: number;
}

export interface AuctionItem {
  id: string;
  title: string;
  desc: string;
  startingBid: number;
  currentBid: number;
  minIncrement: number;
  bidsCount: number;
  bidsHistory: BidEntry[];
  endTime: number; // Unix timestamp
  img: string;
  category: string;
  seller: string;
  sellerPhone: string;
  sellerEmail?: string;
  pickupAddress?: string;
  paymentMethodsAccepted?: string[];
  location: string;
  condition: "Antique / Rare" | "Brand New" | "Restored" | "Like New" | "Used";
  buyNowPrice?: number;
  reservePrice?: number;
  reserveMet?: boolean;
  highestBidder?: string;
  isUserHighestBidder?: boolean;
  isEnded?: boolean;
  closedWithoutWinner?: boolean; // When reserve price is not met
  antiSnipingExtensionsCount?: number;
  extendedByTwoMinutes?: boolean;
  maxProxyBids?: Record<string, number>; // username -> max limit
  winningBidderContact?: BuyerContactDetails;
  settlementDeadline?: number; // 48 hours after end
  settlementStatus?: 
    | "Awaiting 48h Mutual Contact"
    | "Terms Agreed (Arranging Pickup/Delivery)"
    | "Item Collected / Shipped"
    | "Transaction Completed"
    | "Non-Responsive Buyer"
    | "Reserve Not Met (Closed)";
  secondChanceOffer?: {
    runnerUpName: string;
    runnerUpPhone?: string;
    runnerUpEmail?: string;
    amount: number;
    status: "pending" | "accepted" | "declined";
    sentAt: number;
  };
  reported?: boolean;
  reportReason?: string;
}

export interface ClassifiedListing {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  isNegotiable: boolean;
  sellingMethod: "classified" | "auction";
  status: "available" | "reserved" | "sold" | "withdrawn";
  loc: string;
  cat: string;
  time: string;
  img: string;
  featured: boolean;
  seller: string;
  phone: string;
  email?: string;
  pickupAddress?: string;
  desc: string;
  condition?: string;
  viewsCount: number;
  offers?: ClassifiedOffer[];
  reported?: boolean;
  reportReason?: string;
}

export interface PlatformReport {
  id: string;
  targetType: "listing" | "auction" | "user";
  targetId: string;
  targetTitle: string;
  reportedUser: string;
  reporterName: string;
  reporterPhone: string;
  reason: "Non-Responsive Buyer/Seller" | "Prohibited Item" | "Suspected Shill Bidding" | "Misrepresented Item" | "Harassment/Scam";
  details: string;
  timestamp: number;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  adminActionTaken?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  targetTitle: string;
  performedBy: string;
  details: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  communityScore: number;
  memberSince: string;
  location: string;
  bio: string;
  role: "user" | "admin";
}

import { addClassifiedItem, deleteClassifiedItem } from "../lib/firestoreService";

const AUCTIONS_STORAGE_KEY = "lanka_auctions_data_v2";
const LISTINGS_STORAGE_KEY = "lanka_classifieds_listings_v2";
const REPORTS_STORAGE_KEY = "lanka_platform_reports_v2";
const AUDIT_LOGS_STORAGE_KEY = "lanka_platform_audit_logs_v2";
const USER_PROFILE_STORAGE_KEY = "lanka_user_profile_v2";

// Clear legacy mock data from localStorage
try {
  const cachedAuctions = localStorage.getItem(AUCTIONS_STORAGE_KEY);
  if (cachedAuctions && (cachedAuctions.includes('"a1"') || cachedAuctions.includes('"a2"'))) {
    localStorage.removeItem(AUCTIONS_STORAGE_KEY);
  }
  const cachedListings = localStorage.getItem(LISTINGS_STORAGE_KEY);
  if (cachedListings && (cachedListings.includes('"l1"') || cachedListings.includes('"l2"'))) {
    localStorage.removeItem(LISTINGS_STORAGE_KEY);
  }
} catch {
  // Ignore
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Damika",
  phone: "+1 (323) 555-0144",
  email: "damika1316@gmail.com",
  phoneVerified: true,
  emailVerified: true,
  communityScore: 4.9,
  memberSince: "Aug 2023",
  location: "Los Angeles, CA",
  bio: "Active Sri Lankan cultural enthusiast, antique collector and verified community member.",
  role: "user"
};

export const DEFAULT_USER_CONTACT: BuyerContactDetails = {
  fullName: "Damika",
  phone: "+1 (323) 555-0144",
  email: "damika1316@gmail.com",
  fulfillmentPreference: "Pickup",
  address: "10834 Palms Blvd, Los Angeles, CA 90034",
  notes: "Flexible timing on weekends. Can pick up in person or receive courier."
};

const INITIAL_AUCTIONS: AuctionItem[] = [];

export const DEFAULT_LISTINGS: ClassifiedListing[] = [];

const INITIAL_REPORTS: PlatformReport[] = [];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Storage helpers
export function getAuctions(): AuctionItem[] {
  try {
    const raw = localStorage.getItem(AUCTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUCTIONS_STORAGE_KEY, JSON.stringify(INITIAL_AUCTIONS));
      return INITIAL_AUCTIONS;
    }
    const parsed: AuctionItem[] = JSON.parse(raw);
    return parsed.map((item) => {
      const initMatch = INITIAL_AUCTIONS.find((init) => init.id === item.id);
      return {
        sellerEmail: item.sellerEmail || initMatch?.sellerEmail || "community.seller@lankanet.org",
        pickupAddress: item.pickupAddress || initMatch?.pickupAddress || `${item.location} (Designated Pickup)`,
        paymentMethodsAccepted: item.paymentMethodsAccepted || initMatch?.paymentMethodsAccepted || ["Cash on Pickup", "Zelle", "Bank Wire"],
        settlementDeadline: item.settlementDeadline || Date.now() + 48 * 3600 * 1000,
        settlementStatus: item.settlementStatus || "Awaiting 48h Mutual Contact",
        antiSnipingExtensionsCount: item.antiSnipingExtensionsCount || 0,
        ...item
      };
    });
  } catch {
    return INITIAL_AUCTIONS;
  }
}

export function saveAuctions(auctions: AuctionItem[]): void {
  try {
    localStorage.setItem(AUCTIONS_STORAGE_KEY, JSON.stringify(auctions));
    window.dispatchEvent(new CustomEvent("lanka_auctions_updated", { detail: auctions }));
  } catch (err) {
    console.error("Error saving auctions:", err);
  }
}

export function getListings(): ClassifiedListing[] {
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_LISTINGS));
      return DEFAULT_LISTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LISTINGS;
  }
}

export function saveListings(listings: ClassifiedListing[]): void {
  try {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    window.dispatchEvent(new CustomEvent("lanka_listings_updated", { detail: listings }));
    // Asynchronously sync listings to Firestore
    if (listings.length > 0) {
      const latest = listings[0];
      addClassifiedItem(latest, latest.id).catch(err => {
        console.warn("Firestore sync warning for listing:", err);
      });
    }
  } catch (err) {
    console.error("Error saving listings:", err);
  }
}

export function getPlatformReports(): PlatformReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REPORTS;
  }
}

export function savePlatformReports(reports: PlatformReport[]): void {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent("lanka_reports_updated", { detail: reports }));
  } catch (err) {
    console.error("Error saving reports:", err);
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  try {
    const logs = getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: Date.now()
    };
    const updated = [newEntry, ...logs];
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("lanka_audit_updated", { detail: updated }));
  } catch (err) {
    console.error("Error saving audit log:", err);
  }
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("lanka_user_profile_updated", { detail: profile }));
  } catch (err) {
    console.error("Error saving user profile:", err);
  }
}

// Bidding Engine with 2-Minute Anti-Sniping Soft Close & Self-Bidding Prevention
export function placeBidOnAuction(
  auctionId: string, 
  bidAmount: number, 
  bidderContact?: Partial<BuyerContactDetails>,
  maxAutoBidLimit?: number
): { success: boolean; message: string; updatedAuction?: AuctionItem; antiSnipingTriggered?: boolean } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target) {
    return { success: false, message: "Auction item not found." };
  }

  const profile = getUserProfile();
  const bidderName = bidderContact?.fullName || profile.name || "Damika (You)";

  // RULE 1: Self-Bidding Prevention - Sellers must not bid on their own items
  if (target.seller.toLowerCase().trim() === bidderName.toLowerCase().replace("(you)", "").trim()) {
    return {
      success: false,
      message: "Integrity Rule: Sellers are strictly prohibited from bidding on their own listings."
    };
  }

  // Check minimum bid increment
  const minRequired = target.currentBid + (target.minIncrement || 10);
  if (bidAmount < minRequired) {
    return { 
      success: false, 
      message: `Minimum bid must be at least $${minRequired} ($${target.currentBid} + $${target.minIncrement} increment)` 
    };
  }

  const contact: BuyerContactDetails = {
    fullName: bidderName,
    phone: bidderContact?.phone || profile.phone,
    email: bidderContact?.email || profile.email,
    fulfillmentPreference: bidderContact?.fulfillmentPreference || "Pickup",
    address: bidderContact?.address || profile.location,
    notes: bidderContact?.notes || ""
  };

  const now = Date.now();
  let updatedEndTime = target.endTime;
  let antiSnipingTriggered = false;

  // RULE 2: Anti-Sniping / Soft Close Rule:
  // "A bid placed within the final two minutes should extend the auction until two minutes after that bid"
  const timeRemainingMs = target.endTime - now;
  const TWO_MINUTES_MS = 2 * 60 * 1000;
  if (timeRemainingMs > 0 && timeRemainingMs <= TWO_MINUTES_MS) {
    updatedEndTime = now + TWO_MINUTES_MS;
    antiSnipingTriggered = true;
    addAuditLog({
      action: "ANTI_SNIPING_EXTENSION",
      targetTitle: target.title,
      performedBy: bidderName,
      details: `Bid placed within final 2 minutes. Auction end time extended to ${new Date(updatedEndTime).toLocaleTimeString()}.`
    });
  }

  const newBid: BidEntry = {
    id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    bidderName: `${contact.fullName} (You)`,
    bidderPhone: contact.phone,
    bidderEmail: contact.email,
    fulfillmentPreference: contact.fulfillmentPreference,
    shippingAddress: contact.address,
    amount: bidAmount,
    timestamp: now,
    isUser: true,
    isAutoBid: Boolean(maxAutoBidLimit && maxAutoBidLimit > bidAmount)
  };

  const isReserveMet = target.reservePrice ? bidAmount >= target.reservePrice : true;

  const updated: AuctionItem = {
    ...target,
    currentBid: bidAmount,
    bidsCount: target.bidsCount + 1,
    highestBidder: `${contact.fullName} (You)`,
    isUserHighestBidder: true,
    reserveMet: isReserveMet,
    winningBidderContact: contact,
    endTime: updatedEndTime,
    antiSnipingExtensionsCount: antiSnipingTriggered 
      ? (target.antiSnipingExtensionsCount || 0) + 1 
      : (target.antiSnipingExtensionsCount || 0),
    extendedByTwoMinutes: antiSnipingTriggered,
    settlementStatus: "Awaiting 48h Mutual Contact",
    settlementDeadline: updatedEndTime + (48 * 3600 * 1000),
    bidsHistory: [newBid, ...target.bidsHistory],
    maxProxyBids: maxAutoBidLimit 
      ? { ...(target.maxProxyBids || {}), [contact.fullName]: maxAutoBidLimit } 
      : target.maxProxyBids
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: "BID_PLACED",
    targetTitle: target.title,
    performedBy: contact.fullName,
    details: `Placed leading bid of $${bidAmount}. Reserve met: ${isReserveMet ? 'YES' : 'NO (Reserve is $' + target.reservePrice + ')'}`
  });

  let message = `You placed the highest bid of $${bidAmount} on "${target.title}"!`;
  if (antiSnipingTriggered) {
    message += ` ⏱️ Anti-sniping rule triggered: Closing time extended by 2 minutes!`;
  }
  if (target.reservePrice && !isReserveMet) {
    message += ` (Note: Reserve price of $${target.reservePrice} not yet met)`;
  }

  return { 
    success: true, 
    message, 
    updatedAuction: updated,
    antiSnipingTriggered 
  };
}

// Buy It Now on an auction
export function buyNowAuction(
  auctionId: string,
  buyerContact?: Partial<BuyerContactDetails>
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target || !target.buyNowPrice) {
    return { success: false, message: "Buy It Now is not available for this item." };
  }

  const profile = getUserProfile();
  const contact: BuyerContactDetails = {
    fullName: buyerContact?.fullName || profile.name,
    phone: buyerContact?.phone || profile.phone,
    email: buyerContact?.email || profile.email,
    fulfillmentPreference: buyerContact?.fulfillmentPreference || "Pickup",
    address: buyerContact?.address || profile.location,
    notes: buyerContact?.notes || ""
  };

  const newBid: BidEntry = {
    id: `b-buy-now-${Date.now()}`,
    bidderName: `${contact.fullName} (You - Buy It Now)`,
    bidderPhone: contact.phone,
    bidderEmail: contact.email,
    fulfillmentPreference: contact.fulfillmentPreference,
    shippingAddress: contact.address,
    amount: target.buyNowPrice,
    timestamp: Date.now(),
    isUser: true
  };

  const updated: AuctionItem = {
    ...target,
    currentBid: target.buyNowPrice,
    bidsCount: target.bidsCount + 1,
    highestBidder: `${contact.fullName} (You)`,
    isUserHighestBidder: true,
    isEnded: true,
    reserveMet: true,
    winningBidderContact: contact,
    settlementStatus: "Awaiting 48h Mutual Contact",
    settlementDeadline: Date.now() + 48 * 3600 * 1000,
    bidsHistory: [newBid, ...target.bidsHistory]
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: "BUY_IT_NOW",
    targetTitle: target.title,
    performedBy: contact.fullName,
    details: `Purchased item immediately for $${target.buyNowPrice}. 48-Hour mutual contact countdown activated.`
  });

  return {
    success: true,
    message: `Congratulations! You purchased "${target.title}" for $${target.buyNowPrice}! Seller phone is unlocked. Please make contact within 48 hours.`,
    updatedAuction: updated
  };
}

// Toggle end status of auction with strict reserve checking:
// "If reserve is not met, the auction should close without a winner."
export function toggleAuctionEndStatus(
  auctionId: string
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target) return { success: false, message: "Auction item not found" };

  const isNowEnded = !target.isEnded;
  const reserveMet = target.reservePrice ? target.currentBid >= target.reservePrice : true;
  const closedWithoutWinner = isNowEnded && !reserveMet;

  const updated: AuctionItem = {
    ...target,
    isEnded: isNowEnded,
    closedWithoutWinner,
    reserveMet,
    settlementStatus: closedWithoutWinner 
      ? "Reserve Not Met (Closed)"
      : isNowEnded ? "Awaiting 48h Mutual Contact" : "Awaiting 48h Mutual Contact",
    settlementDeadline: isNowEnded ? Date.now() + 48 * 3600 * 1000 : undefined
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: isNowEnded ? "AUCTION_CLOSED" : "AUCTION_REOPENED",
    targetTitle: target.title,
    performedBy: "System",
    details: isNowEnded 
      ? (closedWithoutWinner ? `Closed WITHOUT winner (Current bid $${target.currentBid} did not meet reserve $${target.reservePrice}).` : `Closed with winner: ${target.highestBidder} at $${target.currentBid}.`)
      : "Auction manually reopened for live bidding."
  });

  const msg = isNowEnded
    ? closedWithoutWinner
      ? `Auction closed without a winner because the reserve price of $${target.reservePrice} was not met.`
      : `Auction ended! Winner: ${target.highestBidder} at $${target.currentBid}. 48-Hour mutual contact active.`
    : `Auction reopened for live bidding.`;

  return { success: true, message: msg, updatedAuction: updated };
}

// Update settlement status
export function updateAuctionSettlement(
  auctionId: string,
  updates: Partial<AuctionItem>
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target) return { success: false, message: "Auction item not found" };

  const updated: AuctionItem = {
    ...target,
    ...updates
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: "SETTLEMENT_UPDATE",
    targetTitle: target.title,
    performedBy: target.seller,
    details: `Settlement status updated to: ${updates.settlementStatus || "Updated"}`
  });

  return {
    success: true,
    message: "Auction settlement details updated successfully.",
    updatedAuction: updated
  };
}

// Send Second-Chance Offer to runner-up bidder when winning buyer does not respond
export function sendSecondChanceOffer(
  auctionId: string
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target) return { success: false, message: "Auction item not found" };

  // Find runner up (second highest distinct bidder)
  const bids = target.bidsHistory || [];
  const runnerUpBid = bids.find(b => b.bidderName !== target.highestBidder);

  if (!runnerUpBid) {
    return { success: false, message: "No runner-up bidder found to send a second-chance offer to." };
  }

  const secondChance = {
    runnerUpName: runnerUpBid.bidderName,
    runnerUpPhone: runnerUpBid.bidderPhone || "+1 (415) 555-8291",
    runnerUpEmail: runnerUpBid.bidderEmail || "runnerup@lankanet.org",
    amount: runnerUpBid.amount,
    status: "pending" as const,
    sentAt: Date.now()
  };

  const updated: AuctionItem = {
    ...target,
    secondChanceOffer: secondChance,
    settlementStatus: "Awaiting 48h Mutual Contact"
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: "SECOND_CHANCE_OFFER_SENT",
    targetTitle: target.title,
    performedBy: target.seller,
    details: `Second-chance offer sent to runner-up ${runnerUpBid.bidderName} for $${runnerUpBid.amount}.`
  });

  return {
    success: true,
    message: `Second-Chance Offer for $${runnerUpBid.amount} sent to runner-up "${runnerUpBid.bidderName}". They will be notified to accept or decline.`,
    updatedAuction: updated
  };
}

// Respond to Second Chance Offer
export function respondToSecondChanceOffer(
  auctionId: string,
  accept: boolean
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target || !target.secondChanceOffer) {
    return { success: false, message: "No second chance offer found." };
  }

  const updated: AuctionItem = {
    ...target,
    highestBidder: accept ? target.secondChanceOffer.runnerUpName : target.highestBidder,
    currentBid: accept ? target.secondChanceOffer.amount : target.currentBid,
    isUserHighestBidder: accept && target.secondChanceOffer.runnerUpName.includes("Damika"),
    secondChanceOffer: {
      ...target.secondChanceOffer,
      status: accept ? "accepted" : "declined"
    },
    settlementStatus: accept ? "Awaiting 48h Mutual Contact" : "Non-Responsive Buyer",
    settlementDeadline: accept ? Date.now() + 48 * 3600 * 1000 : target.settlementDeadline
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: accept ? "SECOND_CHANCE_ACCEPTED" : "SECOND_CHANCE_DECLINED",
    targetTitle: target.title,
    performedBy: target.secondChanceOffer.runnerUpName,
    details: accept 
      ? `Accepted second-chance purchase at $${target.secondChanceOffer.amount}.` 
      : "Declined second-chance purchase."
  });

  return {
    success: true,
    message: accept 
      ? `Second-chance offer accepted! You are now the confirmed buyer for $${target.secondChanceOffer.amount}.`
      : `Second-chance offer declined.`,
    updatedAuction: updated
  };
}

// Relist an auction
export function relistAuction(
  auctionId: string
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target) return { success: false, message: "Auction item not found" };

  const updated: AuctionItem = {
    ...target,
    currentBid: target.startingBid,
    bidsCount: 0,
    bidsHistory: [],
    highestBidder: undefined,
    isUserHighestBidder: false,
    isEnded: false,
    closedWithoutWinner: false,
    reserveMet: false,
    winningBidderContact: undefined,
    secondChanceOffer: undefined,
    endTime: Date.now() + 48 * 3600 * 1000,
    settlementStatus: undefined,
    antiSnipingExtensionsCount: 0
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: "AUCTION_RELISTED",
    targetTitle: target.title,
    performedBy: target.seller,
    details: `Item relisted with new 48h duration at starting bid $${target.startingBid}.`
  });

  return {
    success: true,
    message: `"${target.title}" has been relisted for a fresh 48-hour auction!`,
    updatedAuction: updated
  };
}

// Manage classified listing status (available, reserved, sold, withdrawn)
export function updateListingStatus(
  listingId: string, 
  newStatus: "available" | "reserved" | "sold" | "withdrawn"
): { success: boolean; message: string } {
  const listings = getListings();
  const target = listings.find(l => l.id === listingId);
  if (!target) return { success: false, message: "Listing not found" };

  const updatedAll = listings.map(l => l.id === listingId ? { ...l, status: newStatus } : l);
  saveListings(updatedAll);

  addAuditLog({
    action: "LISTING_STATUS_CHANGE",
    targetTitle: target.title,
    performedBy: target.seller,
    details: `Listing status changed from ${target.status} to ${newStatus}.`
  });

  return { success: true, message: `Listing marked as "${newStatus}".` };
}

// Submit classified offer / arrange inspection
export function makeClassifiedOffer(
  listingId: string,
  offerData: {
    amount: number;
    buyerName?: string;
    buyerPhone?: string;
    buyerEmail?: string;
    proposedDate?: string;
    proposedLocation?: string;
    fulfillment?: "Pickup" | "Shipping";
    notes?: string;
  }
): { success: boolean; message: string } {
  const listings = getListings();
  const target = listings.find(l => l.id === listingId);
  if (!target) return { success: false, message: "Listing not found" };

  const profile = getUserProfile();
  const newOffer: ClassifiedOffer = {
    id: `off-${Date.now()}`,
    buyerName: offerData.buyerName || profile.name,
    buyerPhone: offerData.buyerPhone || profile.phone,
    buyerEmail: offerData.buyerEmail || profile.email,
    amount: offerData.amount,
    proposedDate: offerData.proposedDate || "Flexible this week",
    proposedLocation: offerData.proposedLocation || target.loc,
    fulfillment: offerData.fulfillment || "Pickup",
    notes: offerData.notes || "",
    status: "pending",
    timestamp: Date.now()
  };

  const updatedListing: ClassifiedListing = {
    ...target,
    offers: [newOffer, ...(target.offers || [])]
  };

  const updatedAll = listings.map(l => l.id === listingId ? updatedListing : l);
  saveListings(updatedAll);

  addAuditLog({
    action: "OFFER_MADE",
    targetTitle: target.title,
    performedBy: newOffer.buyerName,
    details: `Made an offer of $${offerData.amount} with inspection proposal.`
  });

  return { 
    success: true, 
    message: `Offer of $${offerData.amount} sent to ${target.seller}! Both parties should contact directly to arrange inspection & handover.`
  };
}

// Submit report against suspicious ad or non-responsive user
export function submitPlatformReport(
  report: Omit<PlatformReport, "id" | "timestamp" | "status">
): { success: boolean; message: string } {
  const reports = getPlatformReports();
  const newReport: PlatformReport = {
    ...report,
    id: `rep-${Date.now()}`,
    timestamp: Date.now(),
    status: "pending"
  };

  savePlatformReports([newReport, ...reports]);

  addAuditLog({
    action: "USER_REPORT_FILED",
    targetTitle: report.targetTitle,
    performedBy: report.reporterName,
    details: `Report reason: "${report.reason}". Dispatched to Trust & Safety administrators.`
  });

  return {
    success: true,
    message: "Thank you. Your report has been submitted to the platform administrators for review."
  };
}

// Admin resolve report
export function resolvePlatformReport(
  reportId: string,
  actionTaken: string,
  status: "resolved" | "dismissed"
): { success: boolean; message: string } {
  const reports = getPlatformReports();
  const target = reports.find(r => r.id === reportId);
  if (!target) return { success: false, message: "Report not found." };

  const updated = reports.map(r => r.id === reportId ? { ...r, status, adminActionTaken: actionTaken } : r);
  savePlatformReports(updated);

  addAuditLog({
    action: "ADMIN_REPORT_RESOLVED",
    targetTitle: target.targetTitle,
    performedBy: "Administrator",
    details: `Report ${reportId} marked ${status}. Action: ${actionTaken}`
  });

  return {
    success: true,
    message: `Report marked as ${status}.`
  };
}

// Simulate an outbid by another community member
export function simulateOutbid(
  auctionId: string
): { success: boolean; message: string; updatedAuction?: AuctionItem } {
  const currentAuctions = getAuctions();
  const target = currentAuctions.find(a => a.id === auctionId);
  if (!target) return { success: false, message: "Auction item not found" };

  const bidders = [
    { name: "Sanjeewa Rathnayake", phone: "+1 (818) 555-9012", email: "sanjeewa.r@gmail.com", loc: "Glendale, CA" },
    { name: "Nadeesha Perera", phone: "+1 (626) 555-4309", email: "nadeesha.p@yahoo.com", loc: "Pasadena, CA" },
    { name: "Ruwan Jayakody", phone: "+94 77 123 9988", email: "ruwan.j@colombo.lk", loc: "Colombo, Sri Lanka" },
    { name: "Gayan Wickramasinghe", phone: "+1 (310) 555-6677", email: "gayan.w@hotmail.com", loc: "Torrance, CA" }
  ];
  const chosen = bidders[Math.floor(Math.random() * bidders.length)];
  const outbidAmount = target.currentBid + (target.minIncrement || 25);
  const now = Date.now();

  // Check 2-min anti-sniping extension
  let updatedEndTime = target.endTime;
  let extended = false;
  if (target.endTime - now <= 2 * 60 * 1000 && target.endTime - now > 0) {
    updatedEndTime = now + 2 * 60 * 1000;
    extended = true;
  }

  const newBid: BidEntry = {
    id: `b-sim-${Date.now()}`,
    bidderName: chosen.name,
    bidderPhone: chosen.phone,
    bidderEmail: chosen.email,
    fulfillmentPreference: "Shipping",
    shippingAddress: chosen.loc,
    amount: outbidAmount,
    timestamp: now,
    isUser: false
  };

  const updated: AuctionItem = {
    ...target,
    currentBid: outbidAmount,
    bidsCount: target.bidsCount + 1,
    highestBidder: chosen.name,
    isUserHighestBidder: false,
    endTime: updatedEndTime,
    antiSnipingExtensionsCount: extended ? (target.antiSnipingExtensionsCount || 0) + 1 : target.antiSnipingExtensionsCount,
    extendedByTwoMinutes: extended,
    winningBidderContact: {
      fullName: chosen.name,
      phone: chosen.phone,
      email: chosen.email,
      fulfillmentPreference: "Shipping",
      address: chosen.loc,
      notes: "Will contact seller for bank wire details."
    },
    bidsHistory: [newBid, ...target.bidsHistory]
  };

  const updatedAll = currentAuctions.map(a => a.id === auctionId ? updated : a);
  saveAuctions(updatedAll);

  addAuditLog({
    action: "SIMULATED_OUTBID",
    targetTitle: target.title,
    performedBy: chosen.name,
    details: `Placed counter-bid of $${outbidAmount}. Previous bidder was outbid.`
  });

  return {
    success: true,
    message: `Alert: ${chosen.name} placed a higher bid of $${outbidAmount}! You have been outbid.`,
    updatedAuction: updated
  };
}

// Calculate countdown string from timestamp
export function formatAuctionCountdown(endTime: number): {
  isEnded: boolean;
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
  isUnderTwoMinutes: boolean;
} {
  const now = Date.now();
  const diff = endTime - now;
  if (diff <= 0) {
    return { isEnded: true, formatted: "Auction Ended", hours: 0, minutes: 0, seconds: 0, isUnderTwoMinutes: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUnderTwoMinutes = diff <= 2 * 60 * 1000;

  let formatted = "";
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    formatted = `${days}d ${remH}h left`;
  } else {
    formatted = `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s left`;
  }

  return { isEnded: false, formatted, hours, minutes, seconds, isUnderTwoMinutes };
}
