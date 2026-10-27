import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Shield,
  Clock,
  History,
  BarChart3,
  Calendar,
  LogOut,
  ChevronDown,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Search,
  Save,
  Map,
  Settings,
  Layers,
  Info,
  XCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { getCurrentUser } from '../services/storage';
import { ManagementApi } from '../services/api';
import PortalModuleCards from '../components/PortalModuleCards';
import UserProfileModal from '../components/profile/UserProfileModal';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons for Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Dashboard nav sections ───────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview', label: 'Dashboard Overview', icon: BarChart3, badge: 'Live' },
  { id: 'institute-profile', label: 'Institute Profile', icon: Building2 },
  { id: 'manage-location', label: 'Manage College Location', icon: MapPin, badge: 'GPS' },
  { id: 'geofence', label: 'Geofencing Settings', icon: Shield, badge: '100m Fixed' },
  { id: 'attendance-overview', label: 'Attendance Overview', icon: BarChart3 },
  { id: 'attendance-sessions', label: 'Attendance Sessions', icon: Calendar },
  { id: 'location-history', label: 'Location Update History', icon: History },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManagementPortalPage({ onNavigate }) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Location state
  const [instituteLocation, setInstituteLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const getInitials = (name = 'M') =>
    name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'M';

  const handleSignOut = () => {
    localStorage.removeItem('placeprep_current_user');
    localStorage.removeItem('placeprep_portal_role');
    onNavigate('gateway');
  };

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      const data = await ManagementApi.getInstituteLocation();
      setInstituteLocation(data);
    } catch (err) {
      console.warn('Location fetch error:', err.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await ManagementApi.getLocationHistory();
      setLocationHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('History fetch error:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (activeTab === 'location-history') fetchHistory();
  }, [activeTab]);

  const handleCardSelect = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const el = document.getElementById('mgmt-content');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] py-8 px-4 sm:px-6 lg:px-8">

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('gateway')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-900 font-bold text-xs shadow-xs transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Portals</span>
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Management Portal</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Management Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Institute Management Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-teal-200 mt-1">
                Logged in as <strong className="text-white">{currentUser.name}</strong> •{' '}
                <span className="inline-block px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-100 font-bold uppercase text-[11px]">
                  MANAGEMENT
                </span>
              </p>
            </div>

            {/* Profile Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 pl-2 pr-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition shadow-md cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0">
                  {getInitials(currentUser.name)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[130px] block">{currentUser.name}</span>
                  <span className="text-[10px] text-teal-300 font-semibold uppercase block">MANAGEMENT</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-teal-300 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 text-xs">
                    <div className="pb-3 border-b border-slate-100 mb-3">
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-slate-500 font-mono text-[10px]">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">MANAGEMENT</span>
                    </div>
                    <button onClick={() => { setIsProfileDropdownOpen(false); setIsProfileModalOpen(true); }} className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-left cursor-pointer transition">
                      <UserCheck className="w-4 h-4 text-teal-600" /> View Profile
                    </button>
                    <button onClick={() => { setIsProfileDropdownOpen(false); handleSignOut(); }} className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-left cursor-pointer transition">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-teal-800/60 text-xs">
            <div>
              <span className="text-teal-300 block">Location Status:</span>
              <span className={`font-black text-base ${instituteLocation?.exists ? 'text-emerald-400' : 'text-amber-300'}`}>
                {loadingLocation ? '...' : instituteLocation?.exists ? 'Configured' : 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-teal-300 block">Geofence Radius:</span>
              <span className="font-black text-base text-white">100 m (Fixed)</span>
            </div>
            <div>
              <span className="text-teal-300 block">Last Updated:</span>
              <span className="font-black text-base text-white">
                {instituteLocation?.exists && instituteLocation?.updatedAt
                  ? new Date(instituteLocation.updatedAt).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-teal-300 block">Updated By:</span>
              <span className="font-black text-base text-white truncate block max-w-full">
                {instituteLocation?.exists ? (instituteLocation?.updatedBy || currentUser.email) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <PortalModuleCards items={SECTIONS} activeId={activeTab} onSelect={handleCardSelect} tone="teal" />
      </div>

      {/* Content Area */}
      <div id="mgmt-content" className="max-w-7xl mx-auto scroll-mt-6">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <OverviewSection
            instituteLocation={instituteLocation}
            loadingLocation={loadingLocation}
            onSetLocation={() => handleCardSelect('manage-location')}
            onViewHistory={() => handleCardSelect('location-history')}
          />
        )}

        {/* INSTITUTE PROFILE */}
        {activeTab === 'institute-profile' && (
          <InstituteProfileSection
            instituteLocation={instituteLocation}
            loadingLocation={loadingLocation}
            onEdit={() => handleCardSelect('manage-location')}
          />
        )}

        {/* MANAGE LOCATION */}
        {activeTab === 'manage-location' && (
          <ManageLocationSection
            currentLocation={instituteLocation}
            onSaved={(newLoc) => {
              setInstituteLocation(newLoc);
              fetchLocation();
            }}
          />
        )}

        {/* GEOFENCE SETTINGS */}
        {activeTab === 'geofence' && (
          <GeofenceSection instituteLocation={instituteLocation} />
        )}

        {/* ATTENDANCE OVERVIEW */}
        {activeTab === 'attendance-overview' && (
          <AttendanceOverviewSection />
        )}

        {/* ATTENDANCE SESSIONS */}
        {activeTab === 'attendance-sessions' && (
          <AttendanceSessionsSection />
        )}

        {/* LOCATION HISTORY */}
        {activeTab === 'location-history' && (
          <LocationHistorySection history={locationHistory} loading={loadingHistory} onRefresh={fetchHistory} />
        )}

      </div>

      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ instituteLocation, loadingLocation, onSetLocation, onViewHistory }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-3xl p-6 border shadow-sm ${instituteLocation?.exists ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <MapPin className={`w-6 h-6 ${instituteLocation?.exists ? 'text-emerald-600' : 'text-amber-500'}`} />
            <h3 className="font-bold text-slate-900 text-sm">Institute Location</h3>
          </div>
          {loadingLocation ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : instituteLocation?.exists ? (
            <>
              <p className="text-sm font-bold text-emerald-800">{instituteLocation.instituteName}</p>
              <p className="text-xs text-emerald-700 mt-1">{instituteLocation.city}, {instituteLocation.state}</p>
              <p className="text-[11px] text-emerald-600 font-mono mt-1">
                {instituteLocation.latitude?.toFixed(6)}, {instituteLocation.longitude?.toFixed(6)}
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">Configured ✓</span>
            </>
          ) : (
            <>
              <p className="text-sm text-amber-800 font-semibold">Not configured yet</p>
              <button onClick={onSetLocation} className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer">
                Set Location Now
              </button>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Geofencing</h3>
          </div>
          <p className="text-3xl font-black text-indigo-600">100 m</p>
          <p className="text-xs text-slate-500 mt-1">Fixed attendance boundary radius</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Cannot be changed</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <History className="w-6 h-6 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-sm">Location History</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Track all location changes with timestamp and responsible management account.</p>
          <button onClick={onViewHistory} className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer">
            View History
          </button>
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600" /> Management Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            'Set or update the institute GPS location',
            'Preview the 100-meter attendance boundary on map',
            'View all previous location changes with timestamps',
            'Search college by name or address (geocoding)',
            'Use current device location to assist selection',
            'Students can only mark attendance within 100 meters',
            'Backend enforces geofence — cannot be bypassed',
            'All location changes are audited with your account',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl">
              <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Institute Profile Section ────────────────────────────────────────────────
function InstituteProfileSection({ instituteLocation, loadingLocation, onEdit }) {
  if (loadingLocation) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-900 text-lg">Institute Profile</h2>
        <button onClick={onEdit} className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer">
          {instituteLocation?.exists ? 'Update Location' : 'Set Location'}
        </button>
      </div>

      {!instituteLocation?.exists ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No institute location configured yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Set Location" to configure GPS coordinates for your institute.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            ['Institute Name', instituteLocation.instituteName],
            ['Address', instituteLocation.instituteAddress],
            ['City', instituteLocation.city],
            ['State', instituteLocation.state],
            ['Latitude', instituteLocation.latitude?.toFixed(8)],
            ['Longitude', instituteLocation.longitude?.toFixed(8)],
            ['Geofence Radius', '100 meters (Fixed)'],
            ['Location Status', instituteLocation.locationStatus],
            ['Last Updated', instituteLocation.updatedAt ? new Date(instituteLocation.updatedAt).toLocaleString() : '—'],
            ['Updated By', instituteLocation.updatedBy || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wide mb-1">{label}</span>
              <span className="font-bold text-slate-900 text-sm">{value || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Manage Location Section (with Leaflet map) ────────────────────────────────
function ManageLocationSection({ currentLocation, onSaved }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [form, setForm] = useState({
    instituteName: currentLocation?.instituteName || '',
    instituteAddress: currentLocation?.instituteAddress || '',
    city: currentLocation?.city || '',
    state: currentLocation?.state || '',
    latitude: currentLocation?.latitude || '',
    longitude: currentLocation?.longitude || '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const updateMapMarker = useCallback((lat, lng) => {
    if (!mapInstanceRef.current) return;
    const latlng = [lat, lng];
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { draggable: true })
        .addTo(mapInstanceRef.current)
        .on('dragend', (e) => {
          const pos = e.target.getLatLng();
          setForm(f => ({ ...f, latitude: pos.lat.toFixed(8), longitude: pos.lng.toFixed(8) }));
          if (circleRef.current) circleRef.current.setLatLng(pos);
        });
    }
    if (circleRef.current) {
      circleRef.current.setLatLng(latlng);
    } else {
      circleRef.current = L.circle(latlng, {
        radius: 100,
        color: '#0d9488',
        fillColor: '#0d9488',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapInstanceRef.current);
    }
    mapInstanceRef.current.setView(latlng, 17);
  }, []);

  // Initialize map
  useEffect(() => {
    // Dynamically import leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const defaultLat = form.latitude || 28.7041;
      const defaultLng = form.longitude || 77.1025;

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], form.latitude ? 17 : 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setForm(f => ({ ...f, latitude: lat.toFixed(8), longitude: lng.toFixed(8) }));
        updateMapMarker(lat, lng);
      });

      mapInstanceRef.current = map;
      setMapReady(true);

      if (form.latitude && form.longitude) {
        updateMapMarker(parseFloat(form.latitude), parseFloat(form.longitude));
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
        setMapReady(false);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync lat/lng inputs → map
  useEffect(() => {
    if (!mapReady) return;
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      updateMapMarker(lat, lng);
    }
  }, [form.latitude, form.longitude, mapReady, updateMapMarker]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'PlacePrep/1.0 (management@placeprep.com)' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setForm(f => ({
          ...f,
          latitude: parseFloat(lat).toFixed(8),
          longitude: parseFloat(lon).toFixed(8),
          instituteAddress: f.instituteAddress || display_name,
        }));
      } else {
        setErrorMsg('Location not found. Try a more specific query or enter coordinates manually.');
      }
    } catch {
      setErrorMsg('Geocoding service unavailable. Please enter coordinates manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsGettingLocation(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(8),
          longitude: pos.coords.longitude.toFixed(8),
        }));
        setIsGettingLocation(false);
      },
      () => {
        setErrorMsg('Could not retrieve your location. Please enter coordinates manually.');
        setIsGettingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const handleReset = () => {
    setForm({
      instituteName: currentLocation?.instituteName || '',
      instituteAddress: currentLocation?.instituteAddress || '',
      city: currentLocation?.city || '',
      state: currentLocation?.state || '',
      latitude: currentLocation?.latitude || '',
      longitude: currentLocation?.longitude || '',
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        instituteName: form.instituteName,
        instituteAddress: form.instituteAddress,
        city: form.city,
        state: form.state,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      const res = await ManagementApi.updateInstituteLocation(payload);
      setSuccessMsg(res.message || 'Institute location updated successfully!');
      setShowConfirmDialog(false);
      onSaved({ exists: true, ...payload, updatedAt: new Date().toISOString() });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = form.instituteName && form.latitude && form.longitude &&
    !isNaN(parseFloat(form.latitude)) && !isNaN(parseFloat(form.longitude));

  const hasExistingLocation = currentLocation?.exists;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="font-bold text-slate-900 text-lg mb-2">Manage Institute Location</h2>
        <p className="text-xs text-slate-500 mb-6">
          Set or update your institute's GPS coordinates. The attendance geofence will use a fixed 100-meter boundary around this point.
        </p>

        {successMsg && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <XCircle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Search by College Name / Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. Delhi Technological University"
                  className="flex-1 text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Use My Location */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-xs text-blue-800 font-semibold mb-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                This uses your device's current location, which may differ from the institute's actual location. Adjust the marker before saving.
              </p>
              <button
                onClick={handleUseMyLocation}
                disabled={isGettingLocation}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGettingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                Use My Current Location
              </button>
            </div>

            {/* Institute Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Institute Name *</label>
              <input
                type="text"
                value={form.instituteName}
                onChange={(e) => setForm(f => ({ ...f, instituteName: e.target.value }))}
                placeholder="Delhi Technological University (DTU)"
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Institute Address</label>
              <textarea
                value={form.instituteAddress}
                onChange={(e) => setForm(f => ({ ...f, instituteAddress: e.target.value }))}
                placeholder="Shahbad Daulatpur, Main Bawana Road, Delhi 110042"
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 resize-none"
                rows={2}
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="New Delhi"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                  placeholder="Delhi"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Latitude *</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={form.latitude}
                  onChange={(e) => setForm(f => ({ ...f, latitude: e.target.value }))}
                  placeholder="28.7041"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Longitude *</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={form.longitude}
                  onChange={(e) => setForm(f => ({ ...f, longitude: e.target.value }))}
                  placeholder="77.1025"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>

            {/* Geofence display */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-900">Geofencing Radius: 100 meters</p>
                <p className="text-[10px] text-indigo-700">Fixed — cannot be changed by management</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => { setShowConfirmDialog(true); setErrorMsg(''); }}
                disabled={!isFormValid || isSaving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {hasExistingLocation ? 'Update Institute Location' : 'Set Institute Location'}
              </button>
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Interactive Map</label>
              <span className="text-[10px] text-slate-400">Click map or drag marker to select location</span>
            </div>
            <div
              ref={mapRef}
              className="w-full rounded-2xl border border-slate-200 overflow-hidden"
              style={{ height: '420px', zIndex: 1 }}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Confirm Location Update</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to {hasExistingLocation ? 'update' : 'set'} the institute location?
              Student attendance verification will use the new location and the fixed 100-meter boundary.
            </p>
            {hasExistingLocation && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs mb-4 space-y-1">
                <p className="font-bold text-amber-900">Previous location:</p>
                <p className="font-mono text-amber-800">{currentLocation.latitude?.toFixed(6)}, {currentLocation.longitude?.toFixed(6)}</p>
                <p className="font-bold text-teal-900 mt-2">New location:</p>
                <p className="font-mono text-teal-800">{parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Geofence Section ─────────────────────────────────────────────────────────
function GeofenceSection({ instituteLocation }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="font-bold text-slate-900 text-lg mb-6">Geofencing Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-3xl">
            <Shield className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-indigo-900 text-base mb-1">Fixed Radius Policy</h3>
            <p className="text-5xl font-black text-indigo-600 my-3">100 m</p>
            <p className="text-xs text-indigo-700">
              The attendance boundary is fixed at exactly 100 meters from the institute center.
              This value is enforced server-side and cannot be changed by management or students.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Distance Calculation', value: 'Haversine Formula (Server-Side)', icon: '📐' },
              { label: 'Enforcement Point', value: 'Spring Boot Backend', icon: '🔒' },
              { label: 'Frontend Trust', value: 'None — client-supplied distance rejected', icon: '🛡️' },
              { label: 'Eligibility Rule', value: 'distance ≤ 100 meters (exact, no rounding)', icon: '📏' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs">
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="font-bold text-slate-700">{label}</p>
                  <p className="text-slate-500 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {instituteLocation?.exists && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
            <p className="font-bold text-emerald-900 mb-2">Current Geofence Center:</p>
            <p className="font-mono text-emerald-800">
              Latitude: {instituteLocation.latitude?.toFixed(8)}, Longitude: {instituteLocation.longitude?.toFixed(8)}
            </p>
            <p className="text-emerald-700 mt-1">Radius: 100 meters from this point</p>
          </div>
        )}

        {!instituteLocation?.exists && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 inline mr-2" />
            <span className="font-semibold text-amber-800">Institute location not configured. Students cannot mark GPS-based attendance until location is set.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attendance Overview Section ───────────────────────────────────────────────
function AttendanceOverviewSection() {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <h2 className="font-bold text-slate-900 text-lg mb-4">Attendance Overview</h2>
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-semibold">GPS Attendance Overview</p>
        <p className="text-xs text-slate-400 mt-2">
          Attendance analytics and GPS verification reports will appear here once students begin marking attendance.
          Ensure the institute location is configured first.
        </p>
      </div>
    </div>
  );
}

// ─── Attendance Sessions Section ───────────────────────────────────────────────
function AttendanceSessionsSection() {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <h2 className="font-bold text-slate-900 text-lg mb-4">Attendance Sessions</h2>
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-semibold">No active sessions</p>
        <p className="text-xs text-slate-400 mt-2">
          GPS-based attendance sessions created by teachers will appear here.
          Management can view session status and geofence verification results.
        </p>
      </div>
    </div>
  );
}

// ─── Location History Section ─────────────────────────────────────────────────
function LocationHistorySection({ history, loading, onRefresh }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-900 text-lg">Location Update History</h2>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No location changes recorded yet.</p>
          <p className="text-xs text-slate-400 mt-1">History entries appear whenever the institute location is updated.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Previous Location</th>
                <th className="py-2.5 px-3">New Location</th>
                <th className="py-2.5 px-3">Updated By</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((entry, idx) => (
                <tr key={entry.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">
                    {entry.previousLatitude != null
                      ? `${parseFloat(entry.previousLatitude).toFixed(6)}, ${parseFloat(entry.previousLongitude).toFixed(6)}`
                      : '— (Initial set)'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-teal-700 text-[10px] font-bold">
                    {parseFloat(entry.newLatitude).toFixed(6)}, {parseFloat(entry.newLongitude).toFixed(6)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{entry.updatedByEmail || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
