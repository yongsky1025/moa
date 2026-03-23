import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, X } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { scheduleApi } from '../../api/scheduleApi';
import { placeApi, type PlaceRecommendResponse } from '../../api/placeApi';
import { getErrorMessage } from '../../common/utils/errorMessage';

function toInputDatetime(dt: string) {
  return dt.slice(0, 16);
}

function toLocalDateTime(dt: string) {
  return dt + ':00';
}

interface SelectedPlace {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function ScheduleFormPage() {
  const { circleId, scheduleId } = useParams<{ circleId: string; scheduleId: string }>();
  const cid = Number(circleId);
  const sid = scheduleId ? Number(scheduleId) : null;
  const isEdit = !!scheduleId;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    maxMember: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<kakao.maps.services.PlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceRecommendResponse[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infowindowsRef = useRef<any[]>([]);
  const initialMarkerSetRef = useRef(false);

  // Kakao Maps SDK 초기화
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof kakao !== 'undefined' && kakao.maps) {
        clearInterval(timer);
        kakao.maps.load(() => setKakaoReady(true));
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // 맵 초기화
  useEffect(() => {
    if (!kakaoReady || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 6,
    });
  }, [kakaoReady]);

  // 수정 모드: 기존 일정 로드
  useEffect(() => {
    if (!isEdit || !sid) return;
    scheduleApi.getSchedule(cid, sid)
      .then(res => {
        const s = res.data;
        setForm({
          title: s.title,
          description: s.description,
          startAt: toInputDatetime(s.startAt),
          endAt: toInputDatetime(s.endAt),
          maxMember: s.maxMember,
        });
        if (s.location && s.latitude && s.longitude) {
          setSelectedPlace({
            name: s.location,
            address: s.location,
            latitude: s.latitude,
            longitude: s.longitude,
          });
        }
      })
      .catch(() => setError('일정 정보를 불러올 수 없습니다.'));
  }, [isEdit, sid]);

  // 수정 모드: 기존 위치 마커 표시
  useEffect(() => {
    if (!kakaoReady || !mapRef.current || !selectedPlace || initialMarkerSetRef.current) return;
    initialMarkerSetRef.current = true;
    const position = new kakao.maps.LatLng(selectedPlace.latitude, selectedPlace.longitude);
    const marker = new kakao.maps.Marker({ map: mapRef.current, position });
    markersRef.current.push(marker);
    mapRef.current.setCenter(position);
    mapRef.current.setLevel(3);
  }, [kakaoReady, selectedPlace]);

  const clearMarkers = () => {
    infowindowsRef.current.forEach(iw => iw.close());
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    infowindowsRef.current = [];
  };

  const handlePlaceSearch = () => {
    if (!kakaoReady || !placeQuery.trim() || !mapRef.current) return;
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(placeQuery, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const top5 = result.slice(0, 5);
        setPlaceResults(top5);
        clearMarkers();

        const bounds = new kakao.maps.LatLngBounds();
        top5.forEach(place => {
          const position = new kakao.maps.LatLng(Number(place.y), Number(place.x));
          const marker = new kakao.maps.Marker({ map: mapRef.current, position });
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;">${place.place_name}</div>`,
            removable: false,
          });

          kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(mapRef.current, marker));
          kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
          kakao.maps.event.addListener(marker, 'click', () => handlePlaceSelectFromKakao(place));

          markersRef.current.push(marker);
          infowindowsRef.current.push(infowindow);
          bounds.extend(position);
        });

        mapRef.current.setBounds(bounds);
      } else {
        setPlaceResults([]);
      }
    });
  };

  const handlePlaceSelect = (place: kakao.maps.services.PlaceItem) => {
    const lat = Number(place.y);
    const lng = Number(place.x);
    setSelectedPlace({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      latitude: lat,
      longitude: lng,
    });
    setPlaceResults([]);
    clearMarkers();

    if (mapRef.current) {
      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({ map: mapRef.current, position });
      markersRef.current.push(marker);
      mapRef.current.setCenter(position);
      mapRef.current.setLevel(3);
    }
  };

  const handleClearPlace = () => {
    setSelectedPlace(null);
    setPlaceQuery('');
    setPlaceResults([]);
    setNearbyPlaces([]);
    clearMarkers();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= 10) return prev;
      return [...prev, tag];
    });
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handlePlaceSelectFromKakao = (place: kakao.maps.services.PlaceItem) => {
    handlePlaceSelect(place);
    // 카카오 장소 선택 후 MOA 근처 장소 조회
    const lat = Number(place.y);
    const lng = Number(place.x);
    setNearbyLoading(true);
    placeApi.recommendPlaces(form.title, form.description, selectedTags.length > 0 ? selectedTags : undefined, lat, lng, 5)
      .then(res => setNearbyPlaces(res.data))
      .catch(() => setNearbyPlaces([]))
      .finally(() => setNearbyLoading(false));
  };

  const handleSelectMoaPlace = (p: PlaceRecommendResponse) => {
    setSelectedPlace({ name: p.name, address: p.address, latitude: p.latitude, longitude: p.longitude });
    setNearbyPlaces([]);
    clearMarkers();
    if (mapRef.current) {
      const position = new kakao.maps.LatLng(p.latitude, p.longitude);
      new kakao.maps.Marker({ map: mapRef.current, position });
      mapRef.current.setCenter(position);
      mapRef.current.setLevel(3);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    if (!form.startAt || !form.endAt) {
      setError('시작 시간과 종료 시간을 입력해주세요.');
      return;
    }
    if (form.endAt <= form.startAt) {
      setError('종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      startAt: toLocalDateTime(form.startAt),
      endAt: toLocalDateTime(form.endAt),
      maxMember: form.maxMember,
      ...(selectedPlace ? {
        location: selectedPlace.name,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
      } : {}),
    };
    setLoading(true);
    try {
      if (isEdit && sid) {
        await scheduleApi.updateSchedule(cid, sid, payload);
        navigate(`/circle/${cid}/schedules/${sid}`);
      } else {
        const res = await scheduleApi.createSchedule(cid, payload);
        navigate(`/circle/${cid}/schedules/${res.data.scheduleId}`);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px 60px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#111' }}>
            {isEdit ? '일정 수정' : '일정 만들기'}
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

              {/* ── 왼쪽: 기본 정보 ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* 제목 */}
                <div>
                  <label style={labelStyle}>
                    제목 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 100자)</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    maxLength={100}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    style={inputStyle}
                    placeholder="일정 제목을 입력하세요"
                    required
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label style={labelStyle}>
                    설명 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 255자)</span>
                  </label>
                  <textarea
                    value={form.description}
                    maxLength={255}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="일정을 설명해주세요"
                    required
                  />
                </div>

                {/* 시작 / 종료 시간 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>시작 시간</label>
                    <input
                      type="datetime-local"
                      value={form.startAt}
                      onChange={e => setForm(p => ({ ...p, startAt: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>종료 시간</label>
                    <input
                      type="datetime-local"
                      value={form.endAt}
                      onChange={e => setForm(p => ({ ...p, endAt: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* 최대 인원 */}
                <div>
                  <label style={labelStyle}>
                    최대 인원 <span style={{ color: '#aaa', fontWeight: 400 }}>(최소 2명)</span>
                  </label>
                  <input
                    type="number"
                    value={form.maxMember}
                    min={2}
                    onChange={e => setForm(p => ({ ...p, maxMember: Number(e.target.value) }))}
                    style={{ ...inputStyle, maxWidth: 120 }}
                    required
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#dc2626', padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: 8, margin: 0 }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{ ...btnStyle, flex: 1, background: 'white', color: '#666', border: '1px solid #e5e5e5' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ ...btnStyle, flex: 2, background: '#111', color: 'white', opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? '처리 중...' : isEdit ? '수정하기' : '일정 만들기'}
                  </button>
                </div>
              </div>

              {/* ── 오른쪽: 태그 + 장소 ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* 태그 선택 */}
                <div>
                  <label style={labelStyle}>
                    태그 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 10개 · 장소 추천 정확도 향상)</span>
                  </label>
                  <div style={{ fontSize: 12, color: selectedTags.length >= 10 ? '#dc2626' : '#888', marginBottom: 8 }}>
                    {selectedTags.length}/10 선택됨
                  </div>
                  {TAG_CATEGORIES.map(({ category, tags }) => {
                    const isOpen = openCategories.includes(category);
                    const selectedInCategory = tags.filter(t => selectedTags.includes(t));
                    return (
                      <div key={category} style={{ marginBottom: 4, border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden' }}>
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '7px 12px', background: isOpen ? '#f5f5ff' : 'white',
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#444' }}>{category}</span>
                            {selectedInCategory.map(t => (
                              <span key={t} style={{
                                padding: '1px 7px', borderRadius: 20, fontSize: 11,
                                backgroundColor: '#eef2ff', color: '#6366f1', fontWeight: 600,
                              }}>{t}</span>
                            ))}
                          </div>
                          <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                            {tags.map(tag => {
                              const selected = selectedTags.includes(tag);
                              const disabled = !selected && selectedTags.length >= 10;
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  disabled={disabled}
                                  style={{
                                    padding: '3px 9px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                    border: selected ? '1.5px solid #6366f1' : '1px solid #e5e5e5',
                                    backgroundColor: selected ? '#eef2ff' : 'white',
                                    color: selected ? '#6366f1' : disabled ? '#ccc' : '#555',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 장소 검색 */}
                <div>
                  <label style={labelStyle}>
                    장소 <span style={{ color: '#aaa', fontWeight: 400 }}>(선택)</span>
                  </label>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={placeQuery}
                      onChange={e => setPlaceQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handlePlaceSearch(); } }}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder={kakaoReady ? '장소명 또는 주소를 검색하세요' : '카카오 지도 준비 중...'}
                      disabled={!kakaoReady}
                    />
                    <button
                      type="button"
                      onClick={handlePlaceSearch}
                      disabled={!kakaoReady}
                      style={{
                        padding: '10px 16px', borderRadius: 8, border: 'none',
                        backgroundColor: kakaoReady ? '#111' : '#ccc',
                        color: 'white', cursor: kakaoReady ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13,
                      }}
                    >
                      <Search size={15} />
                      검색
                    </button>
                  </div>

                  {placeResults.length > 0 && (
                    <div style={{
                      border: '1px solid #e5e5e5', borderRadius: 8, marginBottom: 8,
                      overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}>
                      {placeResults.map((p, i) => (
                        <div
                          key={p.id}
                          onClick={() => handlePlaceSelectFromKakao(p)}
                          style={{
                            padding: '10px 14px', cursor: 'pointer',
                            borderBottom: i < placeResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                            backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: 10,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f8')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          <MapPin size={14} style={{ color: '#f02c2c', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{p.place_name}</div>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                              {p.road_address_name || p.address_name}
                            </div>
                            {p.category_name && (
                              <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>
                                {p.category_name.split(' > ').pop()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    ref={mapContainerRef}
                    style={{
                      width: '100%', height: 260, borderRadius: 10,
                      border: '1px solid #e5e5e5', overflow: 'hidden',
                      backgroundColor: '#e8e8e8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {!kakaoReady && (
                      <span style={{ color: '#999', fontSize: 13 }}>지도 로딩 중...</span>
                    )}
                  </div>

                  {selectedPlace && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', border: '1.5px solid #16a34a', borderRadius: 8,
                      backgroundColor: '#f0fdf4', marginTop: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{selectedPlace.name}</div>
                          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{selectedPlace.address}</div>
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                            {selectedPlace.latitude.toFixed(5)}, {selectedPlace.longitude.toFixed(5)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearPlace}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#aaa' }}
                        title="장소 선택 취소"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {nearbyLoading && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 10, textAlign: 'center' }}>
                      MOA 추천 장소 검색 중...
                    </div>
                  )}
                  {!nearbyLoading && nearbyPlaces.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                        ✨ MOA 추천 장소
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {nearbyPlaces.map(p => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectMoaPlace(p)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8,
                              backgroundColor: 'white', cursor: 'pointer', transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f8')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <MapPin size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{p.address}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                              <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                                {p.distanceKm != null
                                  ? (p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)}m` : `${p.distanceKm.toFixed(1)}km`)
                                  : ''}
                              </div>
                              <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                                최대 {p.capacity}명 · {p.pricePerHour.toLocaleString()}원/h
                              </div>
                              {p.tags.length > 0 && (
                                <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                                  {p.tags.slice(0, 3).join(' · ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const TAG_CATEGORIES = [
  { category: '분위기', tags: ['아늑한', '모던한', '인스타감성', '빈티지', '럭셔리', '캐주얼', '조용한', '활기찬', '아기자기한', '미니멀한'] },
  { category: '학습/업무', tags: ['스터디', '회의', '집중력향상', '프레젠테이션', '강의', '코딩', '그룹스터디', '독서', '자격증', '언어학습'] },
  { category: '모임/파티', tags: ['파티', '생일파티', '소셜모임', '동아리', '팀빌딩', '워크샵', '기업행사', '웨딩촬영', '돌잔치', '친목'] },
  { category: '편의시설', tags: ['주차', '와이파이', '에어컨', '빔프로젝터', '화이트보드', '음향장비', '조명', '주방', '샤워실', '스크린', '냉장고', '전자레인지', '마이크', '악기대여', '방음'] },
  { category: '스포츠/운동', tags: ['요가', '필라테스', '댄스', '클라이밍', '탁구', '배드민턴', '복싱', '헬스', '스트레칭', '수영'] },
  { category: '음식/음료', tags: ['바베큐', '케이터링', '카페음료', '주류', '요리실습', '베이킹', '와인', '커피머신', '간식', '채식'] },
  { category: '문화/예술', tags: ['미술', '음악', '사진', '영상제작', '도예', '목공', '드로잉', '공예', '악기연습', '창작'] },
  { category: '위치/특성', tags: ['역세권', '루프탑', '한강뷰', '도심뷰', '자연채광', '야외', '금연', '24시간', '반려동물', '친환경'] },
  { category: '엔터테인먼트', tags: ['보드게임', '방탈출', 'VR', '노래방', '당구', '게임', '마술', '공연', '영화감상', '파티게임'] },
  { category: '규모/대상', tags: ['소규모', '대형', '프라이빗', '커플', '가족'] },
];

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8,
  fontSize: 14, color: '#111', boxSizing: 'border-box', outline: 'none',
};
const btnStyle: React.CSSProperties = {
  padding: '12px 0', borderRadius: 8, border: 'none', fontSize: 14,
  fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
};
