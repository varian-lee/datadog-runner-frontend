// 강아지 꾸미기 페이지 - 색상, 모자 커스터마이징
import { useEffect, useState } from 'react';

export default function Customize() {
    // 🐕 강아지 커스터마이징 색상 매핑
    const DOG_COLORS = {
        white: { body: '#fdfaff', shadow: '#f1edf7', ear: '#e9e2f5', paw: '#e9e2f5', name: '흰색' },
        cream: { body: '#fff8e7', shadow: '#f5e6c8', ear: '#ead4a8', paw: '#ead4a8', name: '크림' },
        brown: { body: '#e8b87d', shadow: '#d4a06a', ear: '#c99458', paw: '#c99458', name: '갈색' },
        pink: { body: '#ffd4e5', shadow: '#ffb8d4', ear: '#ff9fc4', paw: '#ff9fc4', name: '핑크' },
        gray: { body: '#d1d5db', shadow: '#9ca3af', ear: '#6b7280', paw: '#6b7280', name: '회색' },
        purple: { body: '#e9d5ff', shadow: '#d8b4fe', ear: '#c084fc', paw: '#c084fc', name: '보라' },
        starlight: { body: '#e0e7ff', shadow: '#c7d2fe', ear: '#a5b4fc', paw: '#a5b4fc', sparkle: true, name: '별빛✨' },
    };

    // 🎩 모자 컴포넌트 (CSS 픽셀아트 스타일)
    const HatCrown = () => (
        <div style={{ position: 'relative', width: '18px', height: '16px' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '2px', width: '20px', height: '6px', background: '#FFD700', borderRadius: '0 0 2px 2px' }} />
            <div style={{ position: 'absolute', bottom: '6px', left: '2px', width: '4px', height: '8px', background: '#FFD700', borderRadius: '2px 2px 0 0' }} />
            <div style={{ position: 'absolute', bottom: '6px', left: '10px', width: '4px', height: '10px', background: '#FFD700', borderRadius: '2px 2px 0 0' }} />
            <div style={{ position: 'absolute', bottom: '6px', left: '18px', width: '4px', height: '8px', background: '#FFD700', borderRadius: '2px 2px 0 0' }} />
            <div style={{ position: 'absolute', bottom: '2px', left: '9px', width: '6px', height: '3px', background: '#E11D48', borderRadius: '1px' }} />
        </div>
    );

    const HatRibbon = () => (
        <div style={{ position: 'relative', width: '28px', height: '16px' }}>
            <div style={{ position: 'absolute', top: '7px', left: '10px', width: '8px', height: '8px', background: '#EC4899', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', top: '5px', left: '0px', width: '12px', height: '12px', background: '#F472B6', borderRadius: '50% 0 50% 50%', transform: 'rotate(-15deg)' }} />
            <div style={{ position: 'absolute', top: '5px', right: '0px', width: '12px', height: '12px', background: '#F472B6', borderRadius: '0 50% 50% 50%', transform: 'rotate(15deg)' }} />
        </div>
    );

    const HatParty = () => (
        <div style={{ position: 'relative', width: '15px', height: '24px', marginTop: '-7px' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '0px', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '24px solid #8B5CF6' }} />
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '10px', height: '3px', background: '#FCD34D' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '6px', width: '8px', height: '3px', background: '#FCD34D' }} />
            <div style={{ position: 'absolute', top: '-4px', left: '6px', width: '8px', height: '8px', background: '#FBBF24', borderRadius: '50%' }} />
        </div>
    );

    const HatGat = () => (
        <div style={{ position: 'relative', width: '44px', height: '22px', marginTop: '-5px' }}>
            <div style={{ position: 'absolute', bottom: '6px', left: '14px', width: '16px', height: '14px', background: '#1a1a1a', borderRadius: '8px 8px 3px 3px' }} />
            <div style={{ position: 'absolute', bottom: '0px', left: '0px', width: '44px', height: '8px', background: '#2d2d2d', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-3px', left: '8px', width: '2px', height: '8px', background: '#8B4513', borderRadius: '1px' }} />
            <div style={{ position: 'absolute', bottom: '-3px', right: '8px', width: '2px', height: '8px', background: '#8B4513', borderRadius: '1px' }} />
        </div>
    );

    const HatFlower = () => (
        <div style={{ position: 'relative', width: '20px', height: '20px', marginTop: '1px' }}>
            <div style={{ position: 'absolute', top: '0px', left: '6px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '5px', left: '0px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '5px', left: '12px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '12px', left: '2px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '12px', left: '10px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px', background: '#FFD700', borderRadius: '50%' }} />
        </div>
    );

    const renderHat = (hatCode) => {
        switch (hatCode) {
            case 'crown': return <HatCrown />;
            case 'ribbon': return <HatRibbon />;
            case 'party': return <HatParty />;
            case 'gat': return <HatGat />;
            case 'flower': return <HatFlower />;
            default: return null;
        }
    };

    const HAT_OPTIONS = [
        { code: 'none', emoji: '❌', name: '없음' },
        { code: 'crown', emoji: '👑', name: '왕관' },
        { code: 'ribbon', emoji: '🎀', name: '리본' },
        { code: 'party', emoji: '🎉', name: '파티' },
        { code: 'flower', emoji: '🌸', name: '꽃' },
        { code: 'gat', emoji: '🇰🇷', name: '갓' },
    ];

    // 커스터마이징 상태
    const [dogCustomization, setDogCustomization] = useState({
        bodyColor: 'white',
        hatCode: 'none',
    });
    const [achievements, setAchievements] = useState({
        bestScore: 0,
        playCount: 0,
        canSelectHat: false,
        canSelectColor: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 서버에서 불러오기
    useEffect(() => {
        const loadCustomization = async () => {
            try {
                const response = await fetch('/api/customization', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    // 업적 정보 분리
                    const { achievements: achievementsData, ...customizationData } = data;
                    setDogCustomization(customizationData);
                    if (achievementsData) {
                        setAchievements(achievementsData);
                    }
                    // localStorage에도 캐시 (Game.jsx에서 빠르게 로드)
                    localStorage.setItem('dogCustomization', JSON.stringify(customizationData));
                }
            } catch (e) {
                console.error('커스터마이징 로드 실패:', e);
                // 로드 실패 시 localStorage에서 로드
                const saved = localStorage.getItem('dogCustomization');
                if (saved) {
                    setDogCustomization(JSON.parse(saved));
                }
            } finally {
                setLoading(false);
            }
        };
        loadCustomization();
    }, []);

    // 서버에 저장하기
    const saveCustomization = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/customization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dogCustomization)
            });
            if (response.ok) {
                // localStorage에도 저장 (캐시)
                localStorage.setItem('dogCustomization', JSON.stringify(dogCustomization));
                alert('저장되었습니다! 🎉');
            } else {
                alert('저장에 실패했습니다 😢');
            }
        } catch (e) {
            console.error('저장 실패:', e);
            alert('저장에 실패했습니다 😢');
        } finally {
            setSaving(false);
        }
    };

    const currentColors = DOG_COLORS[dogCustomization.bodyColor] || DOG_COLORS.white;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
                🎨 Bits 꾸미기
            </h2>

            {/* 게임 화면 스타일 미리보기 */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">🎮 미리보기</h3>

                {/* 게임 화면 컨테이너 */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    background: 'linear-gradient(180deg, #e8eaff 0%, #f0f2ff 50%, #f8f9ff 100%)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #d2d7ff'
                }}>
                    {/* 배경 이미지 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: 0,
                        right: 0,
                        height: '170px',
                        backgroundImage: 'url(/background.png)',
                        backgroundSize: '100% auto',
                        backgroundPosition: 'center bottom',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.85,
                        zIndex: 1
                    }} />

                    {/* 땅 점선 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '28px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'repeating-linear-gradient(to right, #c6cbff 0px, #c6cbff 8px, transparent 8px, transparent 20px)',
                        animation: 'groundMove 1s linear infinite',
                        zIndex: 5
                    }} />

                    {/* 강아지 (Game.jsx와 동일) */}
                    <div style={{
                        position: 'absolute',
                        left: '60px',
                        bottom: '27px',
                        width: '40px',
                        height: '80px',
                        zIndex: 10
                    }}>
                        {/* 🎩 모자 영역 */}
                        {dogCustomization.hatCode !== 'none' && (
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '50%',
                                transform: 'translateX(-40%)',
                                zIndex: 20
                            }}>
                                {renderHat(dogCustomization.hatCode)}
                            </div>
                        )}

                        {/* 몸통 (Main Body) */}
                        <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '4px',
                            width: '32px',
                            height: '36px',
                            background: currentColors.body,
                            boxShadow: currentColors.sparkle
                                ? `inset -3px -3px 0px ${currentColors.shadow}, 0 0 8px 3px rgba(255,255,255,0.8)`
                                : `inset -3px -3px 0px ${currentColors.shadow}`,
                            borderRadius: '8px',
                            animation: currentColors.sparkle ? 'sparkleBody 0.15s linear infinite' : 'none'
                        }} />

                        {/* 반짝이 효과 (starlight 전용) */}
                        {currentColors.sparkle && (
                            <>
                                <div style={{ position: 'absolute', bottom: '25px', left: '8px', width: '5px', height: '5px', background: '#fff', borderRadius: '50%', animation: 'twinkle 0.15s ease-in-out infinite', boxShadow: '0 0 6px 2px #fff' }} />
                                <div style={{ position: 'absolute', bottom: '32px', left: '22px', width: '3px', height: '3px', background: '#00ffff', borderRadius: '50%', animation: 'twinkle 0.18s ease-in-out infinite 0.1s', boxShadow: '0 0 4px 2px #00ffff' }} />
                            </>
                        )}

                        {/* 머리 (Head) */}
                        <div style={{
                            position: 'absolute',
                            top: '26px',
                            left: '12px',
                            width: '28px',
                            height: '26px',
                            background: currentColors.body,
                            boxShadow: `inset -2px 2px 0px ${currentColors.shadow}`,
                            borderRadius: '12px 12px 4px 12px'
                        }} />

                        {/* 귀 (Floppy Ear) */}
                        <div style={{
                            position: 'absolute',
                            top: '24px',
                            right: '-2px',
                            width: '12px',
                            height: '20px',
                            background: currentColors.ear,
                            borderRadius: '6px 10px 6px 10px',
                            transform: 'rotate(10deg)',
                            zIndex: -1
                        }} />

                        {/* 연보라색 눈 (Lavender Eye) */}
                        <div style={{
                            position: 'absolute',
                            top: '34px',
                            right: '8px',
                            width: '5px',
                            height: '7px',
                            background: '#A78BFA',
                            borderRadius: '2px'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '1px',
                                left: '1px',
                                width: '2px',
                                height: '2px',
                                background: 'white',
                                borderRadius: '1px'
                            }} />
                        </div>

                        {/* 코 (Button Nose) */}
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            right: '2px',
                            width: '5px',
                            height: '4px',
                            background: '#4B5563',
                            borderRadius: '2px'
                        }} />

                        {/* 핑크색 목걸이 (Collar) */}
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            left: '14px',
                            width: '24px',
                            height: '3px',
                            background: '#FDA4AF',
                            borderRadius: '3px'
                        }} />

                        {/* 꼬리 (Happy Tail) */}
                        <div style={{
                            position: 'absolute',
                            bottom: '31px',
                            left: '-2px',
                            width: '10px',
                            height: '12px',
                            background: currentColors.body,
                            border: `2px solid ${currentColors.shadow}`,
                            borderRadius: '40% 60% 40% 60%',
                            transformOrigin: 'right bottom',
                            animation: 'wagTail 0.1s ease-in-out infinite alternate'
                        }} />

                        {/* 발 (Paws) */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '10px',
                            width: '10px',
                            height: '6px',
                            background: currentColors.paw,
                            borderRadius: '3px 3px 0 0'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '26px',
                            width: '10px',
                            height: '6px',
                            background: currentColors.paw,
                            borderRadius: '3px 3px 0 0'
                        }} />
                    </div>

                    {/* 장애물 (Game.jsx와 동일) */}
                    <div style={{
                        position: 'absolute',
                        right: '110px',
                        bottom: '28px',
                        width: '24px',
                        height: '40px',
                        background: 'transparent',
                        zIndex: 10
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'rgb(255, 90, 110)',
                            borderRadius: '2px',
                            boxShadow: 'inset -4px -4px 0px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        }}>
                            <div style={{ width: '20%', height: '40%', background: 'white', borderRadius: '20px' }} />
                            <div style={{ width: '20%', height: '15%', background: 'white', borderRadius: '20px' }} />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '10%',
                            width: '80%',
                            height: '4px',
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '50%'
                        }} />
                    </div>
                </div>

                <style>{`
          @keyframes wagTail {
            0% { transform: rotate(-35deg); }
            100% { transform: rotate(-5deg); }
          }
          @keyframes sparkleBody {
            0% { filter: brightness(1); box-shadow: 0 0 5px 2px rgba(255,255,255,0.5); }
            25% { filter: brightness(1.6); box-shadow: 0 0 15px 5px rgba(255,255,0,0.8); }
            50% { filter: brightness(1.3); box-shadow: 0 0 12px 4px rgba(255,150,255,0.7); }
            75% { filter: brightness(1.8); box-shadow: 0 0 18px 6px rgba(100,255,255,0.9); }
            100% { filter: brightness(1); box-shadow: 0 0 5px 2px rgba(255,255,255,0.5); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes groundMove {
            0% { background-position: 0 0; }
            100% { background-position: -20px 0; }
          }
        `}</style>
            </div>

            {/* 색상 & 모자 선택 (업적 기반 제한) */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                {/* 몸 색상 - 플레이 10회 이상 필요 */}
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">🎨 몸 색상</span>
                    <div className="flex gap-2 flex-wrap">
                        {Object.entries(DOG_COLORS).map(([colorKey, colorVal]) => {
                            const isDefault = colorKey === 'white';
                            const isLocked = !isDefault && !achievements.canSelectColor;
                            const isSelected = dogCustomization.bodyColor === colorKey;

                            return (
                                <div key={colorKey} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => !isLocked && setDogCustomization(prev => ({ ...prev, bodyColor: colorKey }))}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: colorVal.sparkle ? '#ddd' : colorVal.body,
                                            border: isSelected ? '3px solid #632CA6' : '2px solid #ddd',
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            boxShadow: isSelected ? '0 0 8px rgba(99,44,166,0.4)' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: '#666'
                                        }}
                                        title={isLocked ? `🔒 총 플레이 횟수가 10번 이상이어야 합니다. (현재: ${achievements.playCount}회)` : colorVal.name}
                                    >
                                        {colorVal.sparkle ? '?' : ''}
                                    </button>
                                    {/* 잠금 오버레이 */}
                                    {isLocked && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            borderRadius: '50%',
                                            background: 'rgba(128, 128, 128, 0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            pointerEvents: 'none'
                                        }}>
                                            🔒
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {!achievements.canSelectColor && (
                        <span className="text-xs text-gray-400">(플레이 횟수: {achievements.playCount}/10회)</span>
                    )}
                </div>

                {/* 모자 - 최고 점수 500점 이상 필요 */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">🎩 모자</span>
                    <div className="flex gap-2 flex-wrap">
                        {HAT_OPTIONS.map(hat => {
                            const isDefault = hat.code === 'none';
                            const isLocked = !isDefault && !achievements.canSelectHat;
                            const isSelected = dogCustomization.hatCode === hat.code;

                            return (
                                <div key={hat.code} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => !isLocked && setDogCustomization(prev => ({ ...prev, hatCode: hat.code }))}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '14px',
                                            background: isSelected ? '#632CA6' : '#fff',
                                            color: isSelected ? '#fff' : '#666',
                                            border: isSelected ? '2px solid #632CA6' : '2px solid #ddd',
                                            cursor: isLocked ? 'not-allowed' : 'pointer'
                                        }}
                                        title={isLocked ? `🔒 최고 점수가 500점 이상이어야 합니다. (현재: ${achievements.bestScore}점)` : hat.name}
                                    >
                                        {hat.emoji}
                                    </button>
                                    {/* 잠금 오버레이 */}
                                    {isLocked && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            borderRadius: '16px',
                                            background: 'rgba(128, 128, 128, 0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            pointerEvents: 'none'
                                        }}>
                                            🔒
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {!achievements.canSelectHat && (
                        <span className="text-xs text-gray-400">(최고 점수: {achievements.bestScore}/500점)</span>
                    )}
                </div>
            </div>

            {/* 저장 버튼 */}
            <button
                onClick={saveCustomization}
                disabled={saving || loading}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg transition-all ${saving || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl'
                    }`}
            >
                {saving ? '저장 중...' : loading ? '로딩 중...' : '💾 저장하기'}
            </button>
        </div>
    );
}

