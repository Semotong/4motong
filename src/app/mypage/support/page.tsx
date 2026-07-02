'use client';

import Link from 'next/link';

const faqs = [
  {
    q: '요금제는 어떻게 신청하나요?',
    a: '원하는 요금제의 "신규가입" 또는 "번호이동" 버튼을 누르면 해당 통신사 신청 페이지로 이동해요.',
  },
  {
    q: '찜한 요금제는 어디서 보나요?',
    a: '마이페이지 > 찜한 요금제에서 관심 요금제를 모아볼 수 있어요.',
  },
  {
    q: '요금제 정보는 얼마나 자주 갱신되나요?',
    a: '매일 최신 요금제 정보로 업데이트됩니다.',
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/mypage" className="text-gray-400 text-sm">← 마이페이지</Link>
      </div>
      <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">고객센터</h1>

      <div className="bg-white rounded-2xl p-5 mb-3">
        <p className="text-sm font-bold text-gray-900 mb-2">문의하기</p>
        <p className="text-sm text-gray-500">
          이메일 <a href="mailto:help@savemobile.co.kr" style={{ color: '#17B4E8' }}>help@savemobile.co.kr</a>
        </p>
        <p className="text-sm text-gray-500 mt-1">운영시간 평일 10:00 ~ 18:00 (주말·공휴일 휴무)</p>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <p className="text-sm font-bold text-gray-900 px-5 pt-5 pb-2">자주 묻는 질문</p>
        {faqs.map((f, i) => (
          <div key={i} className="px-5 py-4" style={{ borderTop: '1px solid #F3F4F6' }}>
            <p className="text-sm font-medium text-gray-900 mb-1">Q. {f.q}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
