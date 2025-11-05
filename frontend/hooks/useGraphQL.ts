'use client';

import { useEffect, useState } from 'react';
import { gqlFetch } from '@/lib/graphql';

export function useMe() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await gqlFetch<{ me: { id: string; username: string; email: string } }>(
          `query { me { id username email } }`
        );
        if (mounted) setData(res.me);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}

export function useCheckIns() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await gqlFetch<{ check_ins: any[] }>(`query { check_ins { id mood notes created_at } }`);
        if (mounted) setData(res.check_ins || []);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}

export function useMessages(sessionId: string | null) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await gqlFetch<{ messages: any[] }>(
          `query($s: String!) { messages(session_id: $s) { id message_type content created_at } }`,
          { s: sessionId }
        );
        if (mounted) setData(res.messages || []);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [sessionId]);

  return { data, loading, error };
}


