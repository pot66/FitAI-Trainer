import { useEffect, useMemo, useState } from "react";
import api from "./services/api";

function WorkoutProgress({ onBack }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // Load Workout History
  // =====================================

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/workouts");

      console.log(
        "Workout Progress response:",
        response.data
      );

      setWorkouts(response.data?.data || []);
    } catch (error) {
      console.error(
        "Load workout progress error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลดข้อมูล Workout ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // =====================================
  // Format Time
  // =====================================

  const formatTime = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined ||
      Number.isNaN(Number(seconds))
    ) {
      return "00:00";
    }

    const totalSeconds = Math.max(
      0,
      Number(seconds)
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    const hh = String(hours).padStart(
      2,
      "0"
    );

    const mm = String(minutes).padStart(
      2,
      "0"
    );

    const ss = String(
      remainingSeconds
    ).padStart(2, "0");

    if (hours > 0) {
      return `${hh}:${mm}:${ss}`;
    }

    return `${mm}:${ss}`;
  };

  // =====================================
  // Format Date
  // =====================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "th-TH",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  // =====================================
  // Statistics
  // =====================================

  const statistics = useMemo(() => {
    if (!workouts.length) {
      return {
        totalWorkouts: 0,
        totalRepetitions: 0,
        totalDuration: 0,
        averageScore: 0,
        bestScore: 0,
        favoriteExercise: "-",
      };
    }

    const totalWorkouts =
      workouts.length;

    const totalRepetitions =
      workouts.reduce(
        (total, workout) =>
          total +
          Number(
            workout.repetitions || 0
          ),
        0
      );

    const totalDuration =
      workouts.reduce(
        (total, workout) =>
          total +
          Number(
            workout.duration || 0
          ),
        0
      );

    const scores = workouts
      .map((workout) =>
        Number(workout.score)
      )
      .filter(
        (score) =>
          !Number.isNaN(score)
      );

    const averageScore =
      scores.length
        ? scores.reduce(
            (total, score) =>
              total + score,
            0
          ) / scores.length
        : 0;

    const bestScore =
      scores.length
        ? Math.max(...scores)
        : 0;

    // =====================================
    // Favorite Exercise
    // =====================================

    const exerciseCount = {};

    workouts.forEach((workout) => {
      const name =
        workout.exercise?.name ||
        "Unknown";

      exerciseCount[name] =
        (exerciseCount[name] || 0) + 1;
    });

    let favoriteExercise = "-";

    Object.entries(
      exerciseCount
    ).forEach(
      ([name, count]) => {
        if (
          favoriteExercise === "-" ||
          count >
            exerciseCount[
              favoriteExercise
            ]
        ) {
          favoriteExercise = name;
        }
      }
    );

    return {
      totalWorkouts,
      totalRepetitions,
      totalDuration,
      averageScore,
      bestScore,
      favoriteExercise,
    };
  }, [workouts]);

  // =====================================
  // Recent Workouts
  // =====================================

  const recentWorkouts = useMemo(() => {
    return [...workouts]
      .sort(
        (a, b) =>
          new Date(b.startedAt) -
          new Date(a.startedAt)
      )
      .slice(0, 8);
  }, [workouts]);

  // =====================================
  // Chart Data
  // =====================================

  const chartWorkouts = useMemo(() => {
    return [...workouts]
      .filter(
        (workout) =>
          workout.score !== null &&
          workout.score !== undefined
      )
      .sort(
        (a, b) =>
          new Date(a.startedAt) -
          new Date(b.startedAt)
      )
      .slice(-7);
  }, [workouts]);

  const maxScore =
    Math.max(
      100,
      ...chartWorkouts.map(
        (workout) =>
          Number(workout.score) || 0
      )
    );

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="progress-page">

        <div className="progress-loading">

          <div className="progress-loading-icon">
            📊
          </div>

          <h2>
            กำลังโหลด Progress...
          </h2>

          <p>
            กำลังวิเคราะห์ข้อมูล Workout
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="progress-page">

      {/* =====================================
          Header
      ===================================== */}

      <header className="progress-header">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← กลับ Dashboard
        </button>

        <div className="progress-header-title">

          <div className="badge">
            AI FITNESS ASSISTANT
          </div>

          <h1>
            📈 Workout Progress
          </h1>

          <p>
            ติดตามพัฒนาการ
            และผลการออกกำลังกายของคุณ
          </p>

        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadWorkouts}
        >
          ↻ รีเฟรช
        </button>

      </header>

      <main className="progress-container">

        {/* =====================================
            Error
        ===================================== */}

        {error && (
          <div className="progress-error">
            ❌ {error}
          </div>
        )}

        {/* =====================================
            Summary Cards
        ===================================== */}

        <section className="progress-stats">

          <div className="progress-stat-card">

            <div className="progress-stat-icon">
              🏋️
            </div>

            <div>
              <span>
                Workout ทั้งหมด
              </span>

              <strong>
                {
                  statistics.totalWorkouts
                }
              </strong>

              <small>
                ครั้ง
              </small>
            </div>

          </div>

          <div className="progress-stat-card">

            <div className="progress-stat-icon">
              🔁
            </div>

            <div>
              <span>
                จำนวนครั้งรวม
              </span>

              <strong>
                {
                  statistics.totalRepetitions
                }
              </strong>

              <small>
                repetitions
              </small>
            </div>

          </div>

          <div className="progress-stat-card">

            <div className="progress-stat-icon">
              ⏱️
            </div>

            <div>
              <span>
                เวลาออกกำลังกาย
              </span>

              <strong>
                {formatTime(
                  statistics.totalDuration
                )}
              </strong>

              <small>
                ชั่วโมง : นาที : วินาที
              </small>
            </div>

          </div>

          <div className="progress-stat-card">

            <div className="progress-stat-icon">
              ⭐
            </div>

            <div>
              <span>
                คะแนนเฉลี่ย
              </span>

              <strong>
                {statistics.averageScore.toFixed(
                  1
                )}
              </strong>

              <small>
                / 100
              </small>
            </div>

          </div>

        </section>

        {/* =====================================
            Best + Favorite
        ===================================== */}

        <section className="progress-highlight-grid">

          <div className="progress-highlight-card">

            <span>
              🏆 Best Score
            </span>

            <strong>
              {statistics.bestScore}
              <small>
                /100
              </small>
            </strong>

            <p>
              คะแนนสูงสุดที่ทำได้
            </p>

          </div>

          <div className="progress-highlight-card">

            <span>
              💪 Exercise ที่ทำบ่อยที่สุด
            </span>

            <strong className="favorite-exercise">
              {
                statistics.favoriteExercise
              }
            </strong>

            <p>
              จากประวัติ Workout
            </p>

          </div>

        </section>

        {/* =====================================
            Score Chart
        ===================================== */}

        <section className="progress-section">

          <div className="progress-section-header">

            <div>
              <h2>
                📊 Score Progress
              </h2>

              <p>
                คะแนน Workout 7 ครั้งล่าสุด
              </p>
            </div>

          </div>

          {chartWorkouts.length === 0 ? (

            <div className="progress-empty">
              <div>
                📈
              </div>

              <h3>
                ยังไม่มีข้อมูล Score
              </h3>

              <p>
                บันทึก Workout
                พร้อมใส่คะแนนเพื่อดูกราฟ
              </p>
            </div>

          ) : (

            <div className="score-chart">

              <div className="chart-y-axis">

                <span>
                  100
                </span>

                <span>
                  75
                </span>

                <span>
                  50
                </span>

                <span>
                  25
                </span>

                <span>
                  0
                </span>

              </div>

              <div className="chart-area">

                <div className="chart-grid-line line-100" />
                <div className="chart-grid-line line-75" />
                <div className="chart-grid-line line-50" />
                <div className="chart-grid-line line-25" />
                <div className="chart-grid-line line-0" />

                <div className="chart-bars">

                  {chartWorkouts.map(
                    (workout, index) => {

                      const score =
                        Number(
                          workout.score
                        ) || 0;

                      const height =
                        Math.max(
                          5,
                          (score /
                            maxScore) *
                            100
                        );

                      return (
                        <div
                          className="chart-column"
                          key={
                            workout.id
                          }
                        >

                          <div className="chart-value">
                            {score}
                          </div>

                          <div
                            className="chart-bar"
                            style={{
                              height:
                                `${height}%`,
                            }}
                          />

                          <span className="chart-label">
                            {
                              formatDate(
                                workout.startedAt
                              )
                            }
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          )}

        </section>

        {/* =====================================
            Recent History
        ===================================== */}

        <section className="progress-section">

          <div className="progress-section-header">

            <div>
              <h2>
                🏋️ Recent Workouts
              </h2>

              <p>
                ประวัติการออกกำลังกายล่าสุด
              </p>
            </div>

          </div>

          {recentWorkouts.length === 0 ? (

            <div className="progress-empty">

              <div>
                🏃
              </div>

              <h3>
                ยังไม่มี Workout
              </h3>

              <p>
                เริ่มออกกำลังกาย
                เพื่อดู Progress ของคุณ
              </p>

            </div>

          ) : (

            <div className="progress-history">

              {recentWorkouts.map(
                (workout) => (

                  <div
                    className="progress-history-item"
                    key={
                      workout.id
                    }
                  >

                    <div className="progress-history-icon">
                      🏋️
                    </div>

                    <div className="progress-history-main">

                      <strong>
                        {
                          workout.exercise
                            ?.name ||
                          "Workout"
                        }
                      </strong>

                      <span>
                        {formatDate(
                          workout.startedAt
                        )}
                      </span>

                    </div>

                    <div className="progress-history-stat">

                      <span>
                        ครั้ง
                      </span>

                      <strong>
                        {
                          workout.repetitions ??
                          "-"
                        }
                      </strong>

                    </div>

                    <div className="progress-history-stat">

                      <span>
                        เวลา
                      </span>

                      <strong>
                        {formatTime(
                          workout.duration
                        )}
                      </strong>

                    </div>

                    <div className="progress-history-score">

                      <span>
                        Score
                      </span>

                      <strong>
                        {workout.score !==
                        null &&
                        workout.score !==
                          undefined
                          ? `${workout.score}/100`
                          : "-"}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default WorkoutProgress;