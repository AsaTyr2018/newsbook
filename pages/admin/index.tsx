import { getSession } from 'next-auth/react';
import { useContext } from 'react';
import AdminNav from '../../components/AdminNav';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';
import { prisma } from '../../lib/prisma';

interface PostClick {
  id: number;
  title: string;
  count: number;
}

interface StatsProps {
  uniqueViews: number;
  postsCount: number;
  commentsCount: number;
  topPoster?: { username: string; posts: number } | null;
  postClicks: PostClick[];
}

const AdminHome = ({ uniqueViews, postsCount, commentsCount, topPoster, postClicks }: StatsProps) => {
  const { locale } = useContext(LocaleContext);
  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold">{t(locale, 'admin_stats_title')}</h1>
      <div className="mt-4 space-y-2">
        <p>
          {t(locale, 'admin_stats_unique_views')}: {uniqueViews}
        </p>
        <p>
          {t(locale, 'admin_stats_posts_count')}: {postsCount}
        </p>
        <p>
          {t(locale, 'admin_stats_comments_count')}: {commentsCount}
        </p>
        <p>
          {t(locale, 'admin_stats_top_poster')}: {topPoster ? `${topPoster.username} (${topPoster.posts})` : t(locale, 'admin_stats_no_data')}
        </p>
      </div>
      <h2 className="text-xl font-bold mt-4">{t(locale, 'admin_stats_post_clicks')}</h2>
      <ul className="mt-2 list-disc list-inside">
        {postClicks.length ? (
          postClicks.map((pc) => (
            <li key={pc.id}>
              {pc.title}: {pc.count}
            </li>
          ))
        ) : (
          <li>{t(locale, 'admin_stats_no_data')}</li>
        )}
      </ul>
    </div>
  );
};

export default AdminHome;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session || session.user?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  const uniqueViews = await prisma.pageView.count({ distinct: ['ip'] });
  const postsCount = await prisma.post.count();
  const commentsCount = await prisma.comment.count();

  const topPosterData = await prisma.user.findMany({
    select: { username: true, _count: { select: { posts: true } } },
    orderBy: { posts: { _count: 'desc' } },
    take: 1,
  });

  const postClicksData = await prisma.post.findMany({
    select: { id: true, title: true, _count: { select: { pageViews: true } } },
    orderBy: { pageViews: { _count: 'desc' } },
    take: 10,
  });

  const postClicks: PostClick[] = postClicksData.map((p) => ({ id: p.id, title: p.title, count: p._count.pageViews }));

  const topPoster = topPosterData[0]
    ? { username: topPosterData[0].username, posts: topPosterData[0]._count.posts }
    : null;

  return {
    props: { uniqueViews, postsCount, commentsCount, topPoster, postClicks },
  };
}
