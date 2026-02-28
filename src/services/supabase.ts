import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// TODO: Supabase projesinden aldığın URL ve Anon Key'i buraya yapıştır.
const supabaseUrl = 'https://fctxwcgjpzvgfkbchfxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_lBoYkp_QtG9-U_n3lbDQig_Hlc76MlE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

