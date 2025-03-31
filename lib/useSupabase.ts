'use client';

import { useMemo } from 'react';
import { createClient } from './supabase';

export function useSupabase() {
  return useMemo(() => createClient(), []);
}
