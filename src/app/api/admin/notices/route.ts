import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { loadNoticeStore, createNotice, updateNotice, deleteNotice } from '@/lib/csmStore';

export async function GET() {
  const store = await loadNoticeStore();
  return NextResponse.json({ success: true, items: store.items });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { type, category, title, content, pinned } = body;
    if (!type || !title || !content) {
      return NextResponse.json({ success: false, message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }
    const store = await createNotice({ type, category, title, content, pinned: !!pinned });
    return NextResponse.json({ success: true, items: store.items });
  } catch {
    return NextResponse.json({ success: false, message: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ success: false, message: 'id가 필요합니다.' }, { status: 400 });
    const store = await updateNotice(id, patch);
    return NextResponse.json({ success: true, items: store.items });
  } catch {
    return NextResponse.json({ success: false, message: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, message: 'id가 필요합니다.' }, { status: 400 });
  const store = await deleteNotice(id);
  return NextResponse.json({ success: true, items: store.items });
}
