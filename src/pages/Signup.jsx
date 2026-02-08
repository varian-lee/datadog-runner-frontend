import { Alert, Button, Card, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';

const PROFILE_OPTIONS = {
  gender: {
    label: '성별',
    options: [
      { value: 'male', label: '남' },
      { value: 'female', label: '여' },
      { value: 'other', label: '그외' },
    ]
  },
  ageGroup: {
    label: '나이대',
    options: [
      { value: 'under10', label: '10대 이하' },
      { value: '20s', label: '20대' },
      { value: '30s', label: '30대' },
      { value: '40s', label: '40대' },
      { value: '50s', label: '50대' },
      { value: 'over60', label: '60대 이상' },
    ]
  },
  region: {
    label: '지역',
    options: [
      { value: 'seoul_gangnam', label: '서울(강남)' },
      { value: 'seoul_gangbuk', label: '서울(강북)' },
      { value: 'gyeonggi_south', label: '경기(남부)' },
      { value: 'gyeonggi_north', label: '경기(북부)' },
      { value: 'other_region', label: '그 외' },
    ]
  },
  gameLove: {
    label: '평소 게임을 좋아하시나요?',
    options: [
      { value: 'love', label: '매우 좋아함' },
      { value: 'like', label: '좋아함' },
      { value: 'neutral', label: '보통' },
      { value: 'dislike', label: '별로' },
    ]
  }
};

export default function Signup({ onLogin, onSwitchToLogin }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [profile, setProfile] = useState({
    gender: '',
    ageGroup: '',
    region: '',
    gameLove: '',
    datadogExp: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    // Client-side validation
    if (id.length < 3) {
      setErr('아이디는 3글자 이상이어야 합니다.');
      return;
    }
    if (pw.length < 4) {
      setErr('비밀번호는 4글자 이상이어야 합니다.');
      return;
    }
    if (pw !== pwConfirm) {
      setErr('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, pw, profile })
      });

      const data = await r.json();

      if (r.ok) {
        onLogin(); // Auto login after successful signup
      } else {
        setErr(data.detail || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setErr('서버와의 연결에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-2xl px-4">
        <Card className="shadow-2xl border-0">
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🐶</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Datadog Runner</h1>
            <p className="text-gray-500 text-sm">새 계정을 만들어 게임을 시작하세요</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId" value="아이디" className="mb-1 block text-sm font-medium text-gray-900" />
                <TextInput
                  id="userId"
                  type="text"
                  placeholder="3글자 이상"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" value="비밀번호" className="mb-1 block text-sm font-bold text-gray-900" />
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="4글자 이상"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="passwordConfirm" value="비밀번호 확인" className="mb-1 block text-sm font-bold text-gray-900" />
                  <TextInput
                    id="passwordConfirm"
                    type="password"
                    placeholder="비밀번호를 다시 입력"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-sm font-bold text-orange-600 mb-3">추가 정보 (선택사항)</p>
            </div>

            {/* 프로필 옵션들 */}
            <div className="space-y-4">
              {Object.entries(PROFILE_OPTIONS).map(([field, config]) => (
                <div key={field}>
                  <Label value={config.label} className="mb-2 block text-sm font-medium text-orange-400" />
                  <div className="flex flex-wrap gap-2">
                    {config.options.map(option => {
                      const isSelected = profile[field] === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`
                            cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all
                            ${isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-white border-gray-300 text-gray-600 hover:border-purple-300'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={field}
                            value={option.value}
                            checked={isSelected}
                            onChange={() => handleProfileChange(field, option.value)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {err && (
              <Alert color="failure">
                <span className="font-medium">오류!</span> {err}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full !bg-gradient-to-r !from-lime-600 !to-green-600 hover:!from-lime-700 hover:!to-green-700"
              size="lg"
              disabled={loading}
              style={{
                background: 'linear-gradient(to right, #65a30d, #16a34a)',
                borderColor: 'transparent'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                로그인
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
