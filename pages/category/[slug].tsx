import { useRouter } from 'next/router';

const CategoryPage = () => {
  const { slug } = useRouter().query;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Kategorie: {slug}</h1>
    </div>
  );
};

export default CategoryPage;
