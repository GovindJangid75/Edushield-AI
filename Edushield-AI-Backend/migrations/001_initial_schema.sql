-- migrations/001_initial_schema.sql

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    class VARCHAR(20),
    section VARCHAR(10),
    roll_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    address TEXT,
    enrollment_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE,
    phone VARCHAR(20),
    subjects TEXT[],
    classes_assigned TEXT[],
    role VARCHAR(50) DEFAULT 'teacher',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance tracking
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- present, absent, late, half_day
    reason TEXT,
    marked_by UUID REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Performance tracking
CREATE TABLE performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    assessment_type VARCHAR(50), -- exam, quiz, assignment, project
    assessment_name VARCHAR(200),
    max_marks DECIMAL(5,2),
    obtained_marks DECIMAL(5,2),
    assessment_date DATE,
    teacher_id UUID REFERENCES teachers(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Homework/Assignment tracking
CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    assignment_name VARCHAR(200),
    assigned_date DATE,
    due_date DATE,
    submission_date DATE,
    status VARCHAR(50), -- submitted, late, missing, partial
    quality_score DECIMAL(3,2), -- 0-1 scale
    teacher_id UUID REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Engagement logs
CREATE TABLE engagement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    participation_score DECIMAL(3,2), -- 0-1 scale
    questions_asked INTEGER DEFAULT 0,
    class_interaction_level VARCHAR(50), -- high, medium, low, none
    teacher_id UUID REFERENCES teachers(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Teacher observations (voice + text)
CREATE TABLE teacher_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id),
    observation_type VARCHAR(50), -- voice, text, behavioral
    original_text TEXT,
    transcribed_text TEXT,
    audio_url TEXT,
    language VARCHAR(10), -- en, hi
    sentiment VARCHAR(20), -- positive, neutral, negative, concerning
    concern_level VARCHAR(20), -- none, low, medium, high, critical
    extracted_insights JSONB,
    observed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Risk predictions (AI output)
CREATE TABLE risk_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    risk_level VARCHAR(20), -- critical, high, moderate, low, stable
    risk_score DECIMAL(5,4), -- 0-1 probability
    confidence_score DECIMAL(5,4), -- 0-1
    risk_category VARCHAR(50), -- dropout, disengagement, academic_decline, behavioral
    contributing_factors JSONB, -- {"attendance": 0.35, "marks_decline": 0.45, ...}
    reasoning TEXT,
    prediction_horizon_days INTEGER, -- 30, 60, 90
    model_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interventions
CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    risk_prediction_id UUID REFERENCES risk_predictions(id),
    intervention_type VARCHAR(100), -- parent_call, counseling, peer_support, etc.
    priority VARCHAR(20), -- critical, high, medium, low
    status VARCHAR(50), -- recommended, planned, in_progress, completed, dismissed
    recommended_by VARCHAR(50), -- ai_system, teacher, admin
    assigned_to UUID REFERENCES teachers(id),
    recommended_action TEXT,
    action_taken TEXT,
    scheduled_date DATE,
    completed_date DATE,
    outcome VARCHAR(50), -- successful, partially_successful, unsuccessful, ongoing
    outcome_notes TEXT,
    ai_recommendation_reasoning TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50), -- student_risk, teacher_burnout, system
    severity VARCHAR(20), -- critical, high, medium, low
    entity_type VARCHAR(50), -- student, teacher, class
    entity_id UUID,
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES teachers(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Teacher workload tracking
CREATE TABLE teacher_workload (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id),
    date DATE NOT NULL,
    classes_taught INTEGER DEFAULT 0,
    assignments_corrected INTEGER DEFAULT 0,
    students_mentored INTEGER DEFAULT 0,
    interventions_handled INTEGER DEFAULT 0,
    hours_worked DECIMAL(4,2),
    stress_level VARCHAR(20), -- low, moderate, high, critical
    burnout_score DECIMAL(3,2), -- 0-1
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(teacher_id, date)
);

-- School health metrics
CREATE TABLE school_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    total_students INTEGER,
    at_risk_students INTEGER,
    critical_cases INTEGER,
    avg_attendance_rate DECIMAL(5,4),
    avg_performance DECIMAL(5,2),
    avg_engagement_score DECIMAL(3,2),
    intervention_success_rate DECIMAL(5,4),
    teacher_burnout_rate DECIMAL(5,4),
    overall_health_score DECIMAL(3,2), -- 0-1
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(metric_date)
);

-- Behavioral patterns (AI-detected)
CREATE TABLE behavioral_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    pattern_type VARCHAR(100), -- silent_student, low_confidence, social_disconnect
    pattern_strength DECIMAL(3,2), -- 0-1
    detection_date DATE,
    evidence JSONB, -- supporting data points
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_active ON students(is_active);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_performance_student ON performance(student_id, assessment_date);
CREATE INDEX idx_risk_predictions_student_active ON risk_predictions(student_id, is_active);
CREATE INDEX idx_interventions_status ON interventions(status, priority);
CREATE INDEX idx_alerts_unread ON alerts(is_read, severity);
CREATE INDEX idx_engagement_student_date ON engagement_logs(student_id, date);