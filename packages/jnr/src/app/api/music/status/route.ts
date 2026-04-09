import { NextRequest, NextResponse } from 'next/server';

/**
 * 8gent Jr - Song Status Polling API
 *
 * GET /api/music/status?taskId=xxx
 *
 * Polls Suno for task completion. Returns one of:
 * - { status: 'processing' }
 * - { status: 'complete', audioUrl, imageUrl, title, duration }
 * - { status: 'failed', error }
 */

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  const sunoKey = process.env.SUNO_API_KEY;
  if (!sunoKey) {
    return NextResponse.json({ error: 'Not configured', code: 'E-NO-KEY' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${sunoKey}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Status check failed', code: 'E-SUNO-HTTP' }, { status: 500 });
    }

    const data = await res.json();

    if (data.code !== 200) {
      return NextResponse.json({ error: 'Status check failed', code: 'E-SUNO-DATA' }, { status: 500 });
    }

    const status: string = data.data?.status || '';
    const tracks: Array<{
      audioUrl: string;
      streamAudioUrl?: string;
      imageUrl?: string;
      title?: string;
      duration?: number;
    }> = data.data?.response?.sunoData || [];

    if (status === 'SUCCESS' && tracks.length > 0) {
      const track = tracks[0];
      return NextResponse.json({
        status: 'complete',
        audioUrl: track.audioUrl,
        streamUrl: track.streamAudioUrl,
        imageUrl: track.imageUrl,
        title: track.title,
        duration: track.duration,
      });
    }

    const FAILED_STATUSES = [
      'CREATE_TASK_FAILED',
      'GENERATE_AUDIO_FAILED',
      'CALLBACK_EXCEPTION',
      'SENSITIVE_WORD_ERROR',
    ];

    if (FAILED_STATUSES.includes(status)) {
      return NextResponse.json({ status: 'failed', error: status });
    }

    // Still in progress (PENDING, TEXT_SUCCESS, FIRST_SUCCESS)
    return NextResponse.json({ status: 'processing', sunoStatus: status });
  } catch (error) {
    console.error('[music/status] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
