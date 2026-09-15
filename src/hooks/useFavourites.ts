'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase';
import { FavouriteItem } from '@/types';

const LOCAL_TRAINS_KEY = 'rg_favourite_trains';
const LOCAL_STATIONS_KEY = 'rg_favourite_stations';

export function useFavourites() {
  const { user } = useAuth();
  const [favouriteTrains, setFavouriteTrains] = useState<string[]>([]);
  const [favouriteStations, setFavouriteStations] = useState<string[]>([]);
  const [favouriteItems, setFavouriteItems] = useState<FavouriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage or Supabase
  const loadFavourites = useCallback(async () => {
    setIsLoading(true);

    if (user) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('favourites')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data) {
          const trains = data.filter((f) => f.type === 'train').map((f) => f.reference_id);
          const stations = data.filter((f) => f.type === 'station').map((f) => f.reference_id);

          setFavouriteTrains(trains);
          setFavouriteStations(stations);
          setFavouriteItems(
            data.map((f) => ({
              id: f.id,
              userId: f.user_id,
              type: f.type,
              referenceId: f.reference_id,
              title: f.title,
              subtitle: f.subtitle,
              addedAt: f.created_at,
            }))
          );
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase favourites load warning:', err);
      }
    }

    // Guest fallback (localStorage)
    if (typeof window !== 'undefined') {
      try {
        const rawTrains = localStorage.getItem(LOCAL_TRAINS_KEY);
        const rawStations = localStorage.getItem(LOCAL_STATIONS_KEY);
        setFavouriteTrains(rawTrains ? JSON.parse(rawTrains) : []);
        setFavouriteStations(rawStations ? JSON.parse(rawStations) : []);
      } catch {
        setFavouriteTrains([]);
        setFavouriteStations([]);
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  // Toggle Favourite Train
  const toggleFavouriteTrain = async (trainNumber: string, title?: string) => {
    const isFav = favouriteTrains.includes(trainNumber);
    const updated = isFav
      ? favouriteTrains.filter((t) => t !== trainNumber)
      : [...favouriteTrains, trainNumber];

    setFavouriteTrains(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_TRAINS_KEY, JSON.stringify(updated));
    }

    if (user) {
      const supabase = getSupabaseClient();
      try {
        if (isFav) {
          await supabase
            .from('favourites')
            .delete()
            .eq('user_id', user.id)
            .eq('type', 'train')
            .eq('reference_id', trainNumber);
        } else {
          await supabase.from('favourites').insert({
            user_id: user.id,
            type: 'train',
            reference_id: trainNumber,
            title: title || `Train ${trainNumber}`,
          });
        }
      } catch (err) {
        console.warn('Supabase favourite train sync error:', err);
      }
    }
  };

  // Toggle Favourite Station (FR-16)
  const toggleFavouriteStation = async (stationCode: string, stationName?: string) => {
    const isFav = favouriteStations.includes(stationCode);
    const updated = isFav
      ? favouriteStations.filter((s) => s !== stationCode)
      : [...favouriteStations, stationCode];

    setFavouriteStations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(updated));
    }

    if (user) {
      const supabase = getSupabaseClient();
      try {
        if (isFav) {
          await supabase
            .from('favourites')
            .delete()
            .eq('user_id', user.id)
            .eq('type', 'station')
            .eq('reference_id', stationCode);
        } else {
          await supabase.from('favourites').insert({
            user_id: user.id,
            type: 'station',
            reference_id: stationCode,
            title: stationName || stationCode,
          });
        }
      } catch (err) {
        console.warn('Supabase favourite station sync error:', err);
      }
    }
  };

  return {
    favouriteTrains,
    favouriteStations,
    favouriteItems,
    isLoading,
    isFavouriteTrain: (trainNumber: string) => favouriteTrains.includes(trainNumber),
    isFavouriteStation: (stationCode: string) => favouriteStations.includes(stationCode),
    toggleFavouriteTrain,
    toggleFavouriteStation,
    reload: loadFavourites,
  };
}
