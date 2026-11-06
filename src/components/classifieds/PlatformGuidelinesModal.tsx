import React from "react";
import { X, ShieldCheck, AlertTriangle, Clock, Phone, MapPin, Handshake, CheckCircle2, FileText, Ban, Sparkles } from "lucide-react";

interface PlatformGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformGuidelinesModal({ isOpen, onClose }: PlatformGuidelinesModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900">
                Platform Guidelines & Direct Settlement Rules
              </h3>
              <p className="text-xs text-neutral-500">
                Important rules for classified advertising, bidding, and mutual contact
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-neutral-700 text-xs sm:text-sm">
          {/* CRITICAL NOTICE */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Direct Arrangement Policy (No Payments or Shipping by Platform)</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Lanka Community Hub only connects buyers and sellers.</strong> We do <strong>not</strong> accept payments, hold funds, process money transfers, provide payment protection, or organize delivery/shipping. All payments, shipping costs, and handover arrangements must be agreed upon and carried out directly between the buyer and seller.
            </p>
          </div>

          {/* Section 1: 48-Hour Contact Rule */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>1. The 48-Hour Mutual Contact Obligation</span>
            </h4>
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-2 text-xs leading-relaxed">
              <p>
                • <strong>Mutual Contact:</strong> When an auction closes with a winner (reserve met) or when an offer is accepted, both the buyer and seller receive secure access to each other's phone number.
              </p>
              <p>
                • <strong>Timing:</strong> Both parties are required to make contact within <strong>48 hours</strong> to confirm the purchase and coordinate payment methods, delivery charges, or collection time and place.
              </p>
              <p>
                • <strong>Transaction Completion:</strong> Winning an auction does not automatically conclude the transaction. Both parties must manually mark the deal complete once goods have been received.
              </p>
              <p>
                • <strong>Non-Responsive Buyers:</strong> If the winning buyer fails to respond within 48 hours, the seller may report the issue, relist the item, or issue a <strong>Second-Chance Offer</strong> to the runner-up bidder.
              </p>
            </div>
          </div>

          {/* Section 2: Auction Rules */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Handshake className="w-4 h-4 text-amber-600" />
              <span>2. Auction & Bidding Integrity Rules</span>
            </h4>
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-2 text-xs leading-relaxed">
              <p>
                • <strong>Reserve Price Protection:</strong> If a seller sets a reserve price and the highest bid is below the reserve when time expires, the auction closes <strong>without a winner</strong>.
              </p>
              <p>
                • <strong>2-Minute Anti-Sniping Soft Close:</strong> Any bid placed during the final <strong>two minutes</strong> of an auction extends the closing time by 2 full minutes from that bid, ensuring fair competition.
              </p>
              <p>
                • <strong>Prohibition on Self-Bidding:</strong> Sellers are strictly prohibited from placing bids on their own listings to artificially inflate prices. Violators face immediate account suspension.
              </p>
              <p>
                • <strong>Lock on Essential Details:</strong> Once active bidding has started, sellers cannot alter the starting price, reserve, or fundamental description of the item.
              </p>
            </div>
          </div>

          {/* Section 3: Classified Ads & Direct Offers */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>3. Classified Advertisements & Negotiation</span>
            </h4>
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-2 text-xs leading-relaxed">
              <p>
                • Sellers clearly declare whether their asking price is <strong>Fixed</strong> or <strong>Negotiable</strong>.
              </p>
              <p>
                • Buyers can propose an offer and schedule an inspection date and handover location through the "Make an Offer" feature.
              </p>
              <p>
                • Sellers can update their listing status between <strong>Available</strong>, <strong>Reserved</strong>, <strong>Sold</strong>, or <strong>Withdrawn</strong> at any time.
              </p>
            </div>
          </div>

          {/* Section 4: Safety & Inspection Advice */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Safety & Handover Best Practices</span>
            </h4>
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-1.5 text-xs text-neutral-600">
              <p>✓ Meet in well-lit public spaces (e.g. community centers, shopping malls, police station parking areas).</p>
              <p>✓ Always inspect high-value items thoroughly before handing over cash or completing local bank transfers.</p>
              <p>✓ Never send untraceable wire transfers, gift cards, or money orders to unverified parties.</p>
              <p>✓ If courier shipping is necessary, agree on registered/tracked postal services and clarify who covers postage.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
