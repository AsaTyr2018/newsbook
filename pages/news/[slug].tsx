import { useRouter } from 'next/router';

const NewsPost = () => {
  const { slug } = useRouter().query;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Beitrag: {slug}</h1>
    </div>
  );
};

export default NewsPost;
