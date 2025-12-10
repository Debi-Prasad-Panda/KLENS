-- ============================================================
-- NOTIFICATIONS TABLE - Industrial-Grade Alert System
-- ============================================================
-- This schema supports:
-- 1. Real-time notifications via Supabase Realtime
-- 2. Acknowledgment tracking for critical alerts
-- 3. Escalation matrix for unacknowledged warnings
-- ============================================================

-- 1. The Notification Queue
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Content
    title TEXT NOT NULL,
    message TEXT,
    type TEXT CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL')) DEFAULT 'INFO',
    
    -- Navigation
    link TEXT, -- Where clicking takes you (e.g., "/graph?node=Boiler_B7")
    
    -- Read State
    is_read BOOLEAN DEFAULT false,
    
    -- Industrial Safety Features
    requires_acknowledgment BOOLEAN DEFAULT false, -- Must click "I SAW THIS"
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id), -- Who acknowledged (for audit)
    
    -- Escalation Tracking
    escalation_level INT DEFAULT 0, -- 0=initial, 1=engineer, 2=manager, 3=shutdown
    parent_notification_id UUID REFERENCES notifications(id), -- Links escalated alerts
    
    -- Metadata
    source_type TEXT, -- 'IOT', 'DOCUMENT', 'COMPLIANCE', 'SYSTEM', 'DEMO'
    source_id TEXT, -- Reference to source entity (machine_id, doc_id, etc.)
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_unacked_critical ON notifications(type, is_read, created_at) 
    WHERE type = 'CRITICAL' AND is_read = false;

-- 3. Enable Realtime (So the bell rings instantly)
-- Note: Run this in production, may need ALTER PUBLICATION if already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Publication doesn't exist, create it
        CREATE PUBLICATION supabase_realtime FOR TABLE notifications;
END $$;

-- 4. Row Level Security (Only I see my alerts)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update (mark read/acknowledge) their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: System/Backend can insert notifications (via service role)
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Policy: System can delete notifications
DROP POLICY IF EXISTS "System can delete notifications" ON notifications;
CREATE POLICY "System can delete notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at ON notifications;
CREATE TRIGGER notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================================
-- SUCCESS: Run this in Supabase SQL Editor to set up notifications
-- ============================================================
