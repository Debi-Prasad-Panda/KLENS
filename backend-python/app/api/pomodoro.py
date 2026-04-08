from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(prefix="/pomodoro", tags=["pomodoro-compat"])


class PomodoroSettingsResponse(BaseModel):
    user_email: str
    focus_minutes: int
    short_break_minutes: int
    long_break_minutes: int
    cycles_before_long_break: int
    auto_start_breaks: bool
    auto_start_focus: bool
    sound_enabled: bool


class PomodoroStatsResponse(BaseModel):
    user_email: str
    total_sessions_today: int
    total_focus_minutes_today: int
    total_break_minutes_today: int
    current_streak_days: int
    completed_cycles_today: int


@router.get("/settings/{user_email}", response_model=PomodoroSettingsResponse)
async def get_pomodoro_settings(user_email: str):
    """
    Compatibility endpoint for legacy frontend builds that still request
    /api/v1/pomodoro/settings/:email.
    """
    return {
        "user_email": user_email,
        "focus_minutes": 25,
        "short_break_minutes": 5,
        "long_break_minutes": 15,
        "cycles_before_long_break": 4,
        "auto_start_breaks": False,
        "auto_start_focus": False,
        "sound_enabled": True,
    }


@router.get("/stats/{user_email}", response_model=PomodoroStatsResponse)
async def get_pomodoro_stats(user_email: str):
    """
    Compatibility endpoint for legacy frontend builds that still request
    /api/v1/pomodoro/stats/:email.
    """
    return {
        "user_email": user_email,
        "total_sessions_today": 0,
        "total_focus_minutes_today": 0,
        "total_break_minutes_today": 0,
        "current_streak_days": 0,
        "completed_cycles_today": 0,
    }