import { useEffect } from 'react';
import { useLoaderData, useSearchParams } from 'react-router';
import Watermark from '~/assets/images/watermark.svg?react';
import ErrorState from '~/components/error-state';
import Pagination from '~/components/pagination';
import VideoPlayer from '~/components/video-player';
import type { Route } from './+types/home';

interface VideoResponse {
  videos: {
    id: string;
  }[];
  videosPerPage: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const meta = () => {
  return [{ title: 'Oddbit Player' }, { name: 'description', content: 'View multiple videos' }];
};

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  const res = await fetch(`${import.meta.env.VITE_SERVER_HOST}/api/video?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch videos');
  const data: VideoResponse = await res.json();
  return data;
};

clientLoader.hydrate = true as const;

const Home = () => {
  const { videos, pages } = useLoaderData<typeof clientLoader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    const players = document.querySelectorAll<HTMLVideoElement>('.oddbit-player');
    players.forEach((player) => {
      player.pause();
      player.load();
    });
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    if (!searchParams.get('page') || page < 1 || page > pages) {
      setSearchParams({ page: '1' });
    }
  }, [pages, searchParams]);

  return videos.length === 0 ? (
    <ErrorState
      className="m-auto flex h-screen w-screen items-center justify-center text-black"
      title="No videos found"
      message="The video library appears to be empty at this time. If you expected to see content or need further help, please contact support team."
      actionTitle="Reload"
      onClickAction={() => window.location.reload()}
    />
  ) : (
    <div className="container mx-auto px-4 py-8">
      <Watermark className="mx-auto mb-8 h-12 w-fit text-black md:mx-0 md:h-16 dark:text-white" />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoPlayer key={video.id} autoPlay videoId={video.id} />
        ))}
      </div>
      <Pagination
        totalPages={pages}
        currentPage={parseInt(searchParams.get('page') || '1', 10)}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default Home;
