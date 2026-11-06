import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, Plus, ShieldCheck, Star, 
  Map as MapIcon, Coffee, UtensilsCrossed, Fish, Salad, 
  Cake, Check, Heart, MoreHorizontal, List, Grid,
  ChevronLeft, ChevronRight, MapPinned, Store, X, Info,
  Phone, Clock, Navigation, Send, Sparkles, DollarSign
} from 'lucide-react';

import { InteractiveEntityMap, MapMarkerItem } from '../components/maps/InteractiveEntityMap';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY, MAP_ATTRIBUTION_IDS, getCoordinatesForLocation } from '../utils/googleMapsConfig';
import { subscribeRestaurants, addRestaurantToDb } from '../lib/firestoreService';

interface Restaurant {

  name: string;
  verified: boolean;
  country: string;
  city: string;
  loc: string;
  rating: number;
  reviews: number;
  type: string;
  price: string;
  status: string;
  features: string[];
  img: string;
  closed: boolean;
  phone?: string;
  address?: string;
  popularDishes?: string[];
  description?: string;
}

const CUISINES_LIST = [
  { name: "All Cuisines", icon: Store },
  { name: "Sri Lankan", icon: UtensilsCrossed },
  { name: "Seafood", icon: Fish },
  { name: "Vegetarian", icon: Salad },
  { name: "Traditional", icon: UtensilsCrossed },
  { name: "Fine Dining", icon: UtensilsCrossed },
  { name: "Bakery & Sweets", icon: Cake },
  { name: "Cafés", icon: Coffee }
];

export function Restaurants() {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [dbRestaurants, setDbRestaurants] = useState<Restaurant[]>([]);

  React.useEffect(() => {
    const unsub = subscribeRestaurants((items) => {
      setDbRestaurants(items as any);
    });
    return () => unsub();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines');
  const [activeTab, setActiveTab] = useState('All Restaurants');
  const [sortBy, setSortBy] = useState('Highest Rated');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Modals
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [reserveForm, setReserveForm] = useState({ name: "", phone: "", guests: "2", date: "Today, 7:00 PM" });
  const [newRestForm, setNewRestForm] = useState({ name: "", city: "", country: "Sri Lanka", phone: "", type: "Sri Lankan, Seafood" });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFavorite = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(name);
      if (isFav) {
        showToast(`Removed ${name} from favorites`);
        return prev.filter(f => f !== name);
      } else {
        showToast(`Added ${name} to favorites!`);
        return [...prev, name];
      }
    });
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveForm.name || !reserveForm.phone) {
      showToast("Please enter your name and phone number");
      return;
    }
    showToast(`Reservation inquiry submitted for ${reserveForm.guests} guests at ${selectedRestaurant?.name}!`);
    setSelectedRestaurant(null);
  };

  const handleAddRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestForm.name || !newRestForm.city) {
      showToast("Please enter restaurant name and city");
      return;
    }
    const newEntry = {
      name: newRestForm.name,
      city: newRestForm.city,
      country: newRestForm.country,
      loc: `${newRestForm.city}, ${newRestForm.country}`,
      phone: newRestForm.phone || "",
      type: newRestForm.type || "Sri Lankan Traditional",
      price: "$$",
      rating: 5.0,
      reviews: 1,
      status: "Open",
      features: ["Takeaway", "Dine-in"],
      img: "https://images.unsplash.com/photo-1544025162-811114cd3543?auto=format&fit=crop&q=80&w=600",
      closed: false,
      verified: true,
      description: "Authentic Sri Lankan delicacies and traditional hospitality."
    };
    try {
      await addRestaurantToDb(newEntry);
      showToast(`Restaurant "${newRestForm.name}" registered and saved to Firebase!`);
    } catch {
      showToast(`Restaurant listing for "${newRestForm.name}" submitted!`);
    }
    setShowAddModal(false);
    setNewRestForm({ name: "", city: "", country: "Sri Lanka", phone: "", type: "Sri Lankan, Seafood" });
  };

  const clearAllFilters = () => {
    setSelectedCountry('All Countries');
    setSelectedCity('All Cities');
    setSelectedCuisine('All Cuisines');
    setSearchQuery('');
  };

  const restaurantSource = dbRestaurants;

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurantSource];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.loc.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }

    if (selectedCountry !== 'All Countries') {
      filtered = filtered.filter(r => r.country.toLowerCase() === selectedCountry.toLowerCase());
    }

    if (selectedCity !== 'All Cities') {
      filtered = filtered.filter(r => r.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (selectedCuisine !== 'All Cuisines') {
      filtered = filtered.filter(r => r.type.toLowerCase().includes(selectedCuisine.toLowerCase()));
    }

    if (activeTab === 'Top Rated') {
      filtered = filtered.filter(r => r.rating >= 4.7);
    }

    if (sortBy === 'Highest Rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'Most Reviewed') {
      filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }, [searchQuery, selectedCountry, selectedCity, selectedCuisine, activeTab, sortBy]);

  const restaurantMapMarkers: MapMarkerItem[] = useMemo(() => {
    return filteredRestaurants.map((r, i) => {
      const coords = getCoordinatesForLocation(r.address || r.loc);
      return {
        id: `rest-${i}`,
        name: r.name,
        subtitle: `${r.type} • ${r.price} • ${r.status}`,
        address: r.address || r.loc,
        lat: coords.lat,
        lng: coords.lng,
        rating: r.rating,
        reviews: r.reviews,
        image: r.img,
        category: r.country,
        phone: r.phone
      };
    });
  }, [filteredRestaurants]);


  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-neutral-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 border border-neutral-700">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-sm">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedRestaurant(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-neutral-900">{selectedRestaurant.name}</h3>
                  {selectedRestaurant.verified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Verified</span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> {selectedRestaurant.address || selectedRestaurant.loc}
                </p>
              </div>
              <button onClick={() => setSelectedRestaurant(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="rounded-xl overflow-hidden aspect-video relative">
                <img src={selectedRestaurant.img} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded">
                  {selectedRestaurant.price} • {selectedRestaurant.type}
                </span>
              </div>

              <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                {selectedRestaurant.description}
              </p>

              {/* Popular Dishes */}
              {selectedRestaurant.popularDishes && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-2">Signature Dishes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRestaurant.popularDishes.map((dish, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-amber-50/60 rounded-lg text-xs font-semibold text-amber-900 border border-amber-100">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{dish}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reserve or Inquire */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-bold text-sm text-neutral-900">Reserve a Table / Inquire</h4>
                <form onSubmit={handleReservationSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={reserveForm.name} 
                      onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })} 
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs" 
                      required 
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      value={reserveForm.phone} 
                      onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })} 
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={reserveForm.guests} 
                      onChange={(e) => setReserveForm({ ...reserveForm, guests: e.target.value })} 
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="4">4 People</option>
                      <option value="6">6+ People</option>
                    </select>
                    <input 
                      type="text" 
                      value={reserveForm.date} 
                      onChange={(e) => setReserveForm({ ...reserveForm, date: e.target.value })} 
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs" 
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm">
                    Confirm Reservation Request
                  </button>
                </form>
              </div>

              {/* Interactive Mini Google Map */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    Restaurant Map Location
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {selectedRestaurant.loc}
                  </span>
                </div>
                <div className="h-40 w-full rounded-xl overflow-hidden border border-neutral-200 relative shadow-inner">
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'geometry']}>
                    <Map
                      defaultCenter={getCoordinatesForLocation(selectedRestaurant.address || selectedRestaurant.loc)}
                      defaultZoom={15}
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
                      gestureHandling="greedy"
                      disableDefaultUI={false}
                      className="w-full h-full"
                    >
                      <AdvancedMarker
                        position={getCoordinatesForLocation(selectedRestaurant.address || selectedRestaurant.loc)}
                        title={selectedRestaurant.name}
                      >
                        <Pin background="#d97706" glyphColor="#ffffff" borderColor="#78350f" />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex gap-3 pt-2">
                {selectedRestaurant.phone && (
                  <a 
                    href={`tel:${selectedRestaurant.phone}`} 
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" /> Call {selectedRestaurant.phone}
                  </a>
                )}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.name + ' ' + selectedRestaurant.loc)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-amber-400" /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-900">Add Sri Lankan Restaurant</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRestaurantSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Restaurant Name</label>
                <input 
                  type="text" 
                  value={newRestForm.name} 
                  onChange={(e) => setNewRestForm({ ...newRestForm, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                  placeholder="e.g. Ceylon Spices Kitchen" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">City</label>
                  <input 
                    type="text" 
                    value={newRestForm.city} 
                    onChange={(e) => setNewRestForm({ ...newRestForm, city: e.target.value })} 
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                    placeholder="Melbourne, London..." 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Country</label>
                  <select 
                    value={newRestForm.country} 
                    onChange={(e) => setNewRestForm({ ...newRestForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  >
                    <option>Sri Lanka</option>
                    <option>USA</option>
                    <option>Australia</option>
                    <option>UK</option>
                    <option>Canada</option>
                    <option>UAE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newRestForm.phone} 
                  onChange={(e) => setNewRestForm({ ...newRestForm, phone: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-neutral-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm">
                  Submit Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Restaurant Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-900">Claim Your Restaurant</h3>
              <button onClick={() => setShowClaimModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-neutral-700">
              <p>Own or manage a Sri Lankan food business? Claiming lets you update your menu items, accept online bookings, and showcase specials to diaspora diners.</p>
              <input type="text" placeholder="Restaurant Name" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" />
              <input type="text" placeholder="Manager Name & Business Email" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 text-xs text-neutral-600">Cancel</button>
              <button 
                onClick={() => {
                  showToast("Claim request submitted! We will verify and activate your merchant badge.");
                  setShowClaimModal(false);
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shrink-0">
            <UtensilsCrossed className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Sri Lankan Restaurants Worldwide</h1>
            <p className="text-neutral-500 mt-1">Discover authentic Sri Lankan flavors and diaspora food hubs around the world.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Restaurant
          </button>
          <button 
            onClick={() => setShowClaimModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm"
          >
            <Store className="w-4 h-4" />
            Claim Your Restaurant
          </button>
        </div>
      </div>

      {/* Search & Location Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurant name, kottu, lamprais, seafood..." 
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
          />
        </div>
        <div className="w-full md:w-48 relative">
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm appearance-none"
          >
            <option>All Countries</option>
            <option>Sri Lanka</option>
            <option>USA</option>
            <option>Australia</option>
            <option>Canada</option>
          </select>
          <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none rotate-90" />
        </div>
        <button 
          onClick={() => {
            setSelectedCountry("USA");
            setViewMode("map");
            showToast("Showing Sri Lankan restaurants on Interactive Google Map");
          }}
          className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg text-sm flex items-center justify-center gap-1.5"
        >
          <MapPinned className="w-4 h-4 text-amber-600" /> Near Me
        </button>
      </div>

      {/* Cuisines Filter Carousel */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-neutral-900">Browse by Food Category</h2>
          <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline">Reset Filters</button>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {CUISINES_LIST.map((item, i) => {
            const isActive = selectedCuisine === item.name;
            return (
              <button 
                key={i} 
                onClick={() => setSelectedCuisine(item.name)}
                className={`flex flex-col items-center justify-center p-3 min-w-[100px] rounded-xl border transition-all ${
                  isActive ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-neutral-200 hover:border-amber-300 bg-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-amber-700' : 'text-neutral-500'}`} />
                <span className={`text-xs font-bold ${isActive ? 'text-amber-900' : 'text-neutral-700'}`}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 pb-3">
          <div className="flex gap-2">
            {['All Restaurants', 'Top Rated'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                  activeTab === tab ? 'bg-amber-100 text-amber-900' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">Showing {filteredRestaurants.length} restaurants</span>
            <div className="flex bg-neutral-100 rounded-lg p-0.5">
              <button 
                onClick={() => setViewMode('list')} 
                title="List View"
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-neutral-900 font-bold' : 'text-neutral-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                title="Grid View"
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-neutral-900 font-bold' : 'text-neutral-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                title="Interactive Google Map View"
                className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-semibold ${viewMode === 'map' ? 'bg-white shadow-sm text-amber-700 font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Map View or List/Grid */}
        {viewMode === 'map' ? (
          <InteractiveEntityMap
            items={restaurantMapMarkers}
            title="Interactive Google Map of Sri Lankan Restaurants"
            description="Locate traditional curries, lamprais, seafood, and diaspora eateries on the interactive map. Click any pin to view details and directions."
            height="620px"
            pinColor="#d97706"
          />
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
            <Store className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-neutral-900">No restaurants found</h3>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting your keyword or cuisine filters.</p>
            <button onClick={clearAllFilters} className="mt-3 text-xs text-amber-700 font-bold underline">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredRestaurants.map((rest, i) => {
              const isFav = favorites.includes(rest.name);
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedRestaurant(rest)}
                  className={`bg-white rounded-xl border border-neutral-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex overflow-hidden ${
                    viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row gap-4 p-4'
                  }`}
                >
                  <div className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-full sm:w-48 h-36'} shrink-0 overflow-hidden relative rounded-lg`}>
                    <img src={rest.img} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                      onClick={(e) => toggleFavorite(e, rest.name)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-bold text-base text-neutral-900 group-hover:text-amber-700 transition-colors">
                            {rest.name}
                          </h3>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {rest.loc}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                          {rest.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-bold text-xs text-neutral-900">{rest.rating}</span>
                        <span className="text-xs text-neutral-400">({rest.reviews} reviews)</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-xs text-neutral-600">{rest.type}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {rest.features.slice(0, 3).map((f, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold">{rest.status.split(' - ')[0]}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedRestaurant(rest); }}
                        className="text-amber-700 font-bold hover:underline"
                      >
                        View Menu & Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Restaurants;
