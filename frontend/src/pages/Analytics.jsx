import { useEffect, useState } from 'react';
import api from '../services/api';

function Analytics({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      setData(response.data?.data || null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'โหลด Analytics ไม่สำเร็จ');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="dashboard-page"><div className="dashboard-card"><h2>📊 กำลังวิเคราะห์ข้อมูล...</h2></div></div>;

  return (
    <div className="dashboard-page">
      <main className="dashboard-container">
        <div className="dashboard-header">
          <div><div className="badge">AI FITNESS ANALYTICS</div><h1>📊 My Analytics</h1><p>วิเคราะห์ความสม่ำเสมอ ปริมาณการฝึก และคุณภาพท่า</p></div>
          <button className="logout-button" type="button" onClick={onBack}>← กลับ</button>
        </div>
        {error && <div className="dashboard-card"><p className="dashboard-error">❌ {error}</p></div>}
        {data && (
          <>
            <section className="dashboard-section">
              <div className="dashboard-grid">
                <div className="info-card"><span>Workout</span><strong>{data.totals.sessions}</strong></div>
                <div className="info-card"><span>วันที่ฝึก</span><strong>{data.totals.uniqueDays}</strong></div>
                <div className="info-card"><span>Reps รวม</span><strong>{data.totals.repetitions}</strong></div>
                <div className="info-card"><span>คะแนนเฉลี่ย</span><strong>{data.totals.averageScore || '-'}</strong></div>
              </div>
            </section>
            <section className="dashboard-section">
              <h2>🤖 AI Insights</h2>
              <div className="dashboard-card">
                <p>{data.totals.sessions < 3 ? 'เริ่มเก็บข้อมูลเพิ่มอีกเล็กน้อยเพื่อให้ AI วิเคราะห์แนวโน้มได้แม่นยำขึ้น' : data.totals.averageScore >= 85 ? 'คุณภาพท่าอยู่ในระดับดี ควรรักษาความสม่ำเสมอและเพิ่มความยากทีละขั้น' : 'เน้นแก้ท่าและควบคุมการเคลื่อนไหวก่อนเพิ่มจำนวนครั้งหรือความหนัก'}</p>
              </div>
            </section>
            <section className="dashboard-section">
              <h2>📝 Workout ล่าสุด</h2>
              <div className="dashboard-grid">
                {data.recent.map((item) => <div className="info-card" key={item.id}><span>{item.exercise?.name || 'Exercise'}</span><strong>{item.score ?? '-'} / 100</strong><small>{new Date(item.startedAt).toLocaleDateString('th-TH')}</small></div>)}
              </div>
            </section>
          </>
        )}
        <button className="secondary-button" type="button" onClick={load}>↻ รีเฟรชข้อมูล</button>
      </main>
    </div>
  );
}

export default Analytics;
