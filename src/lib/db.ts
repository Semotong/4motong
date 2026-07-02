// Supabase 기반 DB (파일 기반 → Supabase로 교체)
import { supabaseAdmin } from './supabase';

export interface DBUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  role: string;
  agree_marketing: boolean;
  created_at: string;
}

export interface DBZzim {
  user_id: number;
  plan_id: number;
  created_at: string;
}

// --- 유저 ---
export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  return data;
}

export async function getUserById(id: number): Promise<DBUser | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function getAllUsers(): Promise<DBUser[]> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  agreeMarketing: boolean;
}): Promise<DBUser> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: data.email,
      password_hash: data.passwordHash,
      name: data.name,
      phone: data.phone,
      agree_marketing: data.agreeMarketing,
    })
    .select()
    .single();

  if (error) throw error;
  return user;
}

export async function updateUser(
  id: number,
  fields: { name?: string; phone?: string }
): Promise<DBUser | null> {
  const patch: Record<string, unknown> = {};
  if (fields.name !== undefined) patch.name = fields.name;
  if (fields.phone !== undefined) patch.phone = fields.phone;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 회원 권한(롤) 변경 — 최고관리자 전용 기능에서 호출
export async function updateUserRole(id: number, role: string): Promise<DBUser | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- 찜 ---
export async function getZzimsByUser(userId: number): Promise<DBZzim[]> {
  const { data } = await supabaseAdmin
    .from('zzim')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function addZzim(userId: number, planId: number): Promise<void> {
  await supabaseAdmin
    .from('zzim')
    .upsert({ user_id: userId, plan_id: planId });
}

export async function removeZzim(userId: number, planId: number): Promise<void> {
  await supabaseAdmin
    .from('zzim')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId);
}
