import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  totalUsers: number;
  totalPageViews: number;
  totalGameStarts: number;
}

export function AnalyticsStats() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return null; 
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto w-full mt-12 px-4">
      <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-200">
            누적 방문자
          </CardTitle>
          <Users className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-20 bg-white/10" /> : data?.totalUsers.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            + Total Visitors
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-200">
            게임 시작
          </CardTitle>
          <PlayCircle className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-20 bg-white/10" /> : data?.totalGameStarts.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            + Total Games Started
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200">
            페이지 뷰
          </CardTitle>
          <Eye className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-20 bg-white/10" /> : data?.totalPageViews.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            + Total Page Views
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
