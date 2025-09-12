import { useRouter } from 'next/router';

const TagPage = () => {
  const { slug } = useRouter().query;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Tag: {slug}</h1>
    </div>
  );
};

export default TagPage;
