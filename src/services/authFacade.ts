import { supabase } from '../supabaseClient';
import { z } from 'zod';

export class AuthFacade {
  static async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return data;
  }

  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  static async resetPassword(email: string, origin: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login`,
    });
    if (error) throw error;
  }

  static async loginWithOAuth(provider: 'google' | 'linkedin', origin: string) {
    const options: any = {
      redirectTo: `${origin}/dashboard`,
    };

    if (provider === 'google') {
      options.scopes = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';
      options.queryParams = {
        access_type: 'offline',
        prompt: 'consent',
      };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options
    });
    if (error) throw error;
  }
}
